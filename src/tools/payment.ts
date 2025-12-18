import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Ensure this version is valid for the types installed
});

// --- Tool: createCheckoutSession ---
export const createCheckoutSession = async (input: { userId: string; subscription_tier: 'pro' | 'premium' }) => {
    const { userId, subscription_tier } = input;

    const priceId = subscription_tier === 'pro'
        ? process.env.STRIPE_PRICE_PRO
        : process.env.STRIPE_PRICE_PREMIUM;

    if (!priceId) {
        throw new Error('Stripe price ID not configured');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
            user_id: userId,
            tier: subscription_tier,
        },
        success_url: `${frontendUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/`,
    });

    return { session_id: session.id, checkout_url: session.url };
};

// --- Tool: handleStripeWebhook ---
export const handleStripeWebhook = async (input: { body: any; signature: string }) => {
    const { body, signature } = input;

    let event: Stripe.Event;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id;
            const tier = session.metadata?.tier as 'pro' | 'premium';

            if (userId && tier) {
                await collections.users.doc(userId).update({
                    subscription_tier: tier,
                    subscription_status: 'active',
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_started_at: Timestamp.now(),
                });
                await trackPayment({ operation: `payment_${tier}`, amount: session.amount_total || 0, status: 'succeeded' });
            }
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            // Find user by stripe_subscription_id - simplified query here or use metadata if available
            const snapshot = await collections.users.where('stripe_subscription_id', '==', subscription.id).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                await doc.ref.update({
                    subscription_status: 'cancelled',
                    subscription_tier: 'free'
                });
            }
            break;
        }
        // Implement other cases as needed
    }

    return { received: true };
};

// --- Tool: getSubscriptionStatus ---
export const getSubscriptionStatus = async (input: { userId: string }) => {
    const userDoc = await collections.users.doc(input.userId).get();
    const data = userDoc.data();

    return {
        tier: data?.subscription_tier || 'free',
        status: data?.subscription_status || 'inactive',
        next_billing_date: data?.subscription_current_period_end || null,
    };
};

// --- Tool: cancelSubscription ---
export const cancelSubscription = async (input: { userId: string }) => {
    const userDoc = await collections.users.doc(input.userId).get();
    const subId = userDoc.data()?.stripe_subscription_id;

    if (!subId) throw new Error('No active subscription found');

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

    await userDoc.ref.update({
        subscription_status: 'cancelling'
    });

    return { success: true, message: 'Subscription will cancel at period end' };
};

// --- Tool: trackPayment ---
export const trackPayment = async (input: { operation: string; amount: number; status: string }) => {
    const fee = 0.029 * (input.amount / 100) + 0.30; // Approx fee logic

    collections.costTracking.add({
        operation: 'stripe_fee',
        estimated_cost_usd: fee,
        metadata: { operation: input.operation, amount_cents: input.amount },
        timestamp: Timestamp.now()
    }).catch(console.error);

    return { success: true };
};
