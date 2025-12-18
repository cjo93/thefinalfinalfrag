
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTierContext } from '../src/context/TierContext';

export const useTier = () => {
    const { user, upgradeTier } = useAuth();
    const { openPricing } = useTierContext();

    // Unified Tier Logic
    // Frontend UI: "Observer" (Free) | "Operator" (Mid) | "Architect" (High)
    // Backend Enum: "ACCESS_SIGNAL" | "HELIX_PROTOCOL" | "ARCHITECT_NODE"

    const tierLower = user?.tier?.toLowerCase() || 'access_signal';

    // Determine current visual tier
    const tier =
        tierLower === 'architect_node' ? 'architect' :
            tierLower === 'helix_protocol' ? 'operator' :
                'observer';

    const triggerCheckout = useCallback((targetTier: 'observer' | 'operator' | 'architect') => {
        let tierEnum: 'ACCESS_SIGNAL' | 'HELIX_PROTOCOL' | 'ARCHITECT_NODE' = 'ACCESS_SIGNAL';

        switch (targetTier) {
            case 'architect':
                tierEnum = 'ARCHITECT_NODE';
                break;
            case 'operator':
                tierEnum = 'HELIX_PROTOCOL';
                break;
            default:
                tierEnum = 'ACCESS_SIGNAL';
        }

        // This directly initiates the upgrade flow (backend checkout)
        upgradeTier(tierEnum);
    }, [upgradeTier]);

    const showUpgrade = useCallback((_targetTier?: unknown) => {
        openPricing();
    }, [openPricing]);

    return {
        tier,
        isObserver: tier === 'observer',
        isOperator: tier === 'operator' || tier === 'architect', // Inclusive (Operator+)
        isArchitect: tier === 'architect',
        showUpgrade,       // Opens Modal
        triggerCheckout    // Redirects to Stripe
    };
};
