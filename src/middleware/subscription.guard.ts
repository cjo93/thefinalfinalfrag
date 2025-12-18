import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { TIER_FEATURES, SubscriptionTier } from '../models/subscription';

export interface FeatureCheck {
    feature: keyof typeof TIER_FEATURES[SubscriptionTier.ACCESS_SIGNAL];
    incrementUsage?: boolean;
}

export function requireFeature(check: FeatureCheck) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'UNAUTHORIZED' });
        }

        try {
            // Fetch user subscription data
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();

            if (!userData) {
                return res.status(404).json({ error: 'USER_NOT_FOUND' });
            }

            const tier = (userData.subscriptionTier as SubscriptionTier) || SubscriptionTier.ACCESS_SIGNAL;
            const features = TIER_FEATURES[tier];
            // Safety check for invalid tier strings in DB
            if (!features) {
                console.warn(`Invalid tier ${tier} for user ${userId}, falling back to ACCESS_SIGNAL`);
                // Fallback logic for invalid tiers
                (req as any).subscription = { tier: SubscriptionTier.ACCESS_SIGNAL, features: TIER_FEATURES[SubscriptionTier.ACCESS_SIGNAL], userId };

                // Re-check feature on fallback
                const fallbackFeatures = TIER_FEATURES[SubscriptionTier.ACCESS_SIGNAL];
                const fallbackConfig = fallbackFeatures[check.feature];
                if (typeof fallbackConfig === 'object' && 'enabled' in fallbackConfig && !fallbackConfig.enabled) {
                    return res.status(403).json({ error: 'FEATURE_LOCKED', message: "Invalid Tier / Locked", upgradeUrl: '/pricing' });
                }
                return next();
            }

            const featureConfig = features[check.feature];

            // Check if feature is enabled
            if (typeof featureConfig === 'object' && 'enabled' in featureConfig && !featureConfig.enabled) {
                return res.status(403).json({
                    error: 'FEATURE_LOCKED',
                    message: `Upgrade to access ${check.feature}`,
                    currentTier: tier,
                    requiredTier: getMinimumTierForFeature(check.feature.toString()),
                    upgradeUrl: '/pricing'
                });
            }

            // Check usage limits (for features with monthlyLimit)
            if (typeof featureConfig === 'object' && 'monthlyLimit' in featureConfig && featureConfig.monthlyLimit !== -1) {
                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                const usageKey = `usage.${check.feature}.${currentMonth}`;
                const currentUsage = userData[usageKey] || 0;

                if (currentUsage >= featureConfig.monthlyLimit) {
                    return res.status(429).json({
                        error: 'LIMIT_EXCEEDED',
                        message: `Monthly ${check.feature} limit reached`,
                        limit: featureConfig.monthlyLimit,
                        used: currentUsage,
                        resetsAt: getNextMonthStart(),
                        upgradeUrl: '/pricing'
                    });
                }

                // Increment usage if requested
                if (check.incrementUsage) {
                    await db.collection('users').doc(userId).update({
                        [usageKey]: currentUsage + 1,
                        updatedAt: new Date()
                    });
                }
            }

            // Attach subscription info to request
            (req as any).subscription = {
                tier,
                features,
                userId
            };

            next();
        } catch (error) {
            console.error('Subscription check error:', error);
            return res.status(500).json({ error: 'SUBSCRIPTION_CHECK_FAILED' });
        }
    };
}

function getMinimumTierForFeature(feature: string): SubscriptionTier {
    for (const [tier, features] of Object.entries(TIER_FEATURES)) {
        const featureConfig = features[feature as keyof typeof features];
        if (typeof featureConfig === 'object' && 'enabled' in featureConfig && featureConfig.enabled) {
            return tier as SubscriptionTier;
        }
    }
    return SubscriptionTier.ARCHITECT_NODE;
}

function getNextMonthStart(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
}
