import express from 'express';
import Stripe from 'stripe';
import { db } from '../../config/firebase';

const router = express.Router();
// Use process.env directly or strict validation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
});

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];

        if (!sig) {
            return res.status(400).send('Missing stripe-signature header');
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Idempotency check
        const eventId = event.id;
        const eventDoc = await db.collection('stripe_events').doc(eventId).get();

        if (eventDoc.exists) {
            console.log(`Event ${eventId} already processed`);
            return res.json({ received: true, status: 'duplicate' });
        }

        // Mark event as processed
        await db.collection('stripe_events').doc(eventId).set({
            type: event.type,
            processedAt: new Date(),
            data: event.data.object
        });

        // Handle events
        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const userId = session.metadata?.userId;
                    const tier = session.metadata?.tier;

                    if (userId && tier) {
                        await db.collection('users').doc(userId).update({
                            subscriptionTier: tier,
                            stripeCustomerId: session.customer,
                            subscriptionId: session.subscription,
                            updatedAt: new Date()
                        });
                    }
                    break;
                }
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const userId = subscription.metadata?.userId;
                    if (userId) {
                        await db.collection('users').doc(userId).update({
                            subscriptionTier: 'observer', // Downgrade to free tier
                            subscriptionStatus: 'canceled',
                            downgradedAt: new Date()
                        });
                        console.log(`User ${userId} downgraded to observer (subscription canceled)`);
                    }
                    break;
                }
                case 'invoice.payment_failed': {
                    const invoice = event.data.object as Stripe.Invoice;
                    const userId = invoice.subscription_details?.metadata?.userId;
                    console.warn(`Payment failed for invoice ${invoice.id}, User: ${userId}`);
                    // Optional: Notify user or update status to 'past_due'
                    if (userId) {
                        await db.collection('users').doc(userId).update({
                            subscriptionStatus: 'past_due'
                        });
                    }
                    break;
                }
            }

            res.json({ received: true });
        } catch (err: any) {
            console.error(`Error processing event ${event.type}:`, err);
            res.status(500).send('Event processing failed');
        }
    }
);

export default router;
