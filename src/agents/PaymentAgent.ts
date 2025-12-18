// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    createCheckoutSession,
    handleStripeWebhook,
    getSubscriptionStatus,
    cancelSubscription,
    trackPayment
} from '../tools/payment';

export const paymentAgent = new JulesAgent({
    name: 'PaymentAgent',
    description: 'Manages Stripe subscriptions and payments',
    model: 'gemini-2.0-flash',
    tools: [
        createCheckoutSession,
        handleStripeWebhook,
        getSubscriptionStatus,
        cancelSubscription,
        trackPayment,
    ]
});
