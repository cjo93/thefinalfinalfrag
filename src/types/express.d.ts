import { SubscriptionTier, SubscriptionFeatures } from '../models/subscription';

declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                emailVerified?: boolean;
            };
            subscription?: {
                tier: SubscriptionTier;
                features: SubscriptionFeatures;
                userId: string;
            };
        }
    }
}
