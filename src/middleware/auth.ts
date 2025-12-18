// T1-1: Backend Tier Enforcement
import { Request, Response, NextFunction } from 'express';
import { logFeatureAccess } from '../services/audit';

// Tier Hierarchy configuration
const TIER_HIERARCHY: Record<string, number> = {
    'signal': 0,      // Free
    'calibration': 1, // $9.99
    'integration': 2, // $24.99
    'mastery': 3      // $49.99
};

// Feature Gate Registry
export const FEATURE_GATES = {
    'comprehension_dial': 'calibration',
    'integration_forge': 'integration',
    'relational_cartography': 'integration',
    'api_access': 'mastery',
    'premium_analysis': 'calibration', // The main /analyze endpoint
    'unlimited_logs': 'integration',
    'priority_support': 'mastery'
};

export const requireTier = (feature: keyof typeof FEATURE_GATES | 'signal') => {
    return async (req: any, res: Response, next: NextFunction) => {
        const user = req.user;

        // 1. Check Auth
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Cast to string to avoid TS intersection issues with literals
        const featureKey = feature as string;

        // 'signal' just means "is a user", so we pass if user exists
        if (featureKey === 'signal') {
            return next();
        }

        const userTier = user.subscription_tier || 'signal';
        // We know it's not signal here due to check above
        const requiredTier = FEATURE_GATES[feature as keyof typeof FEATURE_GATES];

        // 2. Logic Check
        const userLevel = TIER_HIERARCHY[userTier] || 0;
        const requiredLevel = TIER_HIERARCHY[requiredTier];
        const isAllowed = userLevel >= requiredLevel;

        // 3. Audit Log (T1-4 hook)
        // We log every attempt regardless of success
        if (featureKey !== 'signal') {
            logFeatureAccess(
                user.uid || 'unknown',
                featureKey,
                isAllowed ? 'accessed' : 'denied',
                userTier,
                { path: req.path, method: req.method }
            );
        }

        if (isAllowed) {
            next();
        } else {
            res.status(403).json({
                error: 'Tier Insufficient',
                required: requiredTier,
                current: userTier,
                upgrade_url: '/upgrade'
            });
        }
    };
};

// Backward compatibility for routes just needing "Any Auth"
// Signal is the base (free) tier, so this effectively checks "Is Authenticated"
export const verifyAuthToken = requireTier('signal');
