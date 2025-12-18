
import { handleStripeWebhook } from '../src/tools/payment';
import { collections } from '../src/services/firestore';
import Stripe from 'stripe';

// Mock Firestore
jest.mock('../src/services/firestore', () => ({
    collections: {
        users: {
            doc: jest.fn().mockReturnValue({
                update: jest.fn(),
                get: jest.fn(),
                ref: { update: jest.fn() }
            }),
            where: jest.fn().mockReturnValue({
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: [{
                        ref: { update: jest.fn() },
                        data: jest.fn()
                    }]
                })
            })
        },
        costTracking: {
            add: jest.fn().mockResolvedValue({})
        }
    },
    db: {}
}));

// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        webhooks: {
            constructEvent: jest.fn().mockReturnValue({ type: 'unknown', data: { object: {} } })
        },
        checkout: {
            sessions: { create: jest.fn() }
        },
        subscriptions: {
            update: jest.fn()
        }
    }));
});

describe('Stripe Webhooks', () => {
    const OLD_ENV = process.env;
    let mockConstructEvent: jest.Mock;

    beforeAll(() => {
        // Access the RETURN VALUE of the constructor, not the 'this' instance
        const mockFn = (Stripe as unknown as jest.Mock);
        if (mockFn.mock.results.length > 0) {
            const instance = mockFn.mock.results[0].value;
            if (instance && instance.webhooks) {
                mockConstructEvent = instance.webhooks.constructEvent;
            }
        }

        if (!mockConstructEvent) {
            console.warn("Stripe mock return value not found. Calls made:", mockFn.mock.calls.length);
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...OLD_ENV, STRIPE_WEBHOOK_SECRET: 'whsec_test_secret' };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('should successfully handle checkout.session.completed', async () => {
        const mockEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_123',
                    customer: 'cus_test_999',
                    subscription: 'sub_test_888',
                    amount_total: 1900,
                    metadata: {
                        user_id: 'user_123',
                        tier: 'pro'
                    }
                }
            }
        };

        if (mockConstructEvent) mockConstructEvent.mockReturnValue(mockEvent);

        const result = await handleStripeWebhook({
            body: JSON.stringify(mockEvent),
            signature: 'mock_sig'
        });

        expect(result.received).toBe(true);
        expect(collections.users.doc).toHaveBeenCalledWith('user_123');
    });

    it('should successfully handle customer.subscription.deleted', async () => {
        const mockEvent = {
            type: 'customer.subscription.deleted',
            data: {
                object: {
                    id: 'sub_test_888',
                    customer: 'cus_test_999',
                    status: 'canceled'
                }
            }
        };

        if (mockConstructEvent) mockConstructEvent.mockReturnValue(mockEvent);

        const result = await handleStripeWebhook({
            body: JSON.stringify(mockEvent),
            signature: 'mock_sig'
        });

        expect(result.received).toBe(true);
        expect(collections.users.where).toHaveBeenCalledWith('stripe_subscription_id', '==', 'sub_test_888');
    });

    it('should throw error on invalid signature', async () => {
        if (mockConstructEvent) {
            mockConstructEvent.mockImplementation(() => {
                throw new Error('Signature verification failed');
            });
        }

        await expect(handleStripeWebhook({
            body: 'bad_body',
            signature: 'bad_sig'
        })).rejects.toThrow('Webhook Error: Signature verification failed');
    });
});
