import express from 'express';
import Stripe from 'stripe';
import { collections } from '../../services/firestore';

const router = express.Router();

// Expect STRIPE_WEBHOOK_SECRET in env/secret manager
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing stripe signature or webhook secret');
    return res.status(400).send('Webhook misconfigured');
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log event for auditing
  console.info('Stripe event:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      // handle checkout
      // Example: update user tier in Firestore
      try {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        if (userId) {
          await collections.users.doc(userId).update({ stripe_subscription_id: session.subscription });
        }
      } catch (e) {
        console.error('Error handling checkout.session.completed', e);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
});

export default router;
