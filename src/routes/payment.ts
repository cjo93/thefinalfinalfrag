
import express from 'express';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
// We import admin directly since it's a singleton in node
import { verifyAuthToken } from '../middleware/auth';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia', // Use latest stable
} as any);

// POST /api/payment/checkout
// Body: { priceId: string, successUrl: string, cancelUrl: string }
router.post('/checkout', verifyAuthToken, async (req, res) => {
    try {
        const { tier, successUrl, cancelUrl, userId } = req.body;

        let priceId = '';
        if (tier === 'HELIX_PROTOCOL') priceId = process.env.STRIPE_PRICE_ID_OPERATOR || '';
        if (tier === 'ARCHITECT_NODE') priceId = process.env.STRIPE_PRICE_ID_ARCHITECT || '';

        if (!priceId) {
            return res.status(400).json({ error: "Invalid Tier or Missing Price Configuration" });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            // Mock mode if no key (Should not happen now)
            return res.status(200).json({
                url: `${successUrl}?session_id=mock_session_${Date.now()}`
            });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
            client_reference_id: userId,
            metadata: {
                userId: userId,
                tier: tier
            }
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// GET /api/payment/checkout-status/:sessionId
// Manually verify session (redundancy for webhooks or local dev)
router.get('/checkout-status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!process.env.STRIPE_SECRET_KEY) {
            // Mock Check
            if (sessionId.startsWith('mock_session_')) {
                return res.json({ status: 'complete', payment_status: 'paid' });
            }
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.metadata?.userId || session.client_reference_id;
            const targetTier = session.metadata?.tier || 'HELIX_PROTOCOL';

            if (userId) {
                // Determine mapped tier value to be safe
                // (User logic handles string 'HELIX_PROTOCOL' etc, ensure consistency)
                await admin.firestore().collection('users').doc(userId).update({
                    tier: targetTier,
                    stripeCustomerId: session.customer,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            res.json({ status: session.status, payment_status: session.payment_status, tier: targetTier });
        } else {
            res.json({ status: session.status, payment_status: session.payment_status });
        }

    } catch (error: any) {
        console.error('Session Status Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
