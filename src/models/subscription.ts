export enum SubscriptionTier {
    ACCESS_SIGNAL = 'ACCESS_SIGNAL',
    HELIX_PROTOCOL = 'HELIX_PROTOCOL',
    ARCHITECT_NODE = 'ARCHITECT_NODE'
}

export interface FeatureLimits {
    enabled: boolean;
    monthlyLimit: number; // -1 = unlimited
}

export interface SubscriptionFeatures {
    simulations: FeatureLimits;
    mandala: FeatureLimits;
    voice: FeatureLimits;
    walletPass: { enabled: boolean };
    therapistPortal: { enabled: boolean };
    artifactPacks: { enabled: boolean };
    prioritySupport: boolean;
    longitudinalInsights: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
    [SubscriptionTier.ACCESS_SIGNAL]: {
        simulations: { enabled: true, monthlyLimit: 3 },
        mandala: { enabled: false, monthlyLimit: 0 },
        voice: { enabled: false, monthlyLimit: 0 },
        walletPass: { enabled: false },
        therapistPortal: { enabled: false },
        artifactPacks: { enabled: false },
        prioritySupport: false,
        longitudinalInsights: false
    },
    [SubscriptionTier.HELIX_PROTOCOL]: { // Was EXPLORER/NAVIGATOR hybrid
        simulations: { enabled: true, monthlyLimit: 100 },
        mandala: { enabled: true, monthlyLimit: 20 },
        voice: { enabled: true, monthlyLimit: 10 },
        walletPass: { enabled: true },
        therapistPortal: { enabled: false },
        artifactPacks: { enabled: true },
        prioritySupport: false,
        longitudinalInsights: true
    },
    [SubscriptionTier.ARCHITECT_NODE]: { // Was ORACLE
        simulations: { enabled: true, monthlyLimit: -1 },
        mandala: { enabled: true, monthlyLimit: -1 },
        voice: { enabled: true, monthlyLimit: -1 },
        walletPass: { enabled: true },
        therapistPortal: { enabled: true },
        artifactPacks: { enabled: true },
        prioritySupport: true,
        longitudinalInsights: true
    }
};

export const TIER_PRICING = {
    [SubscriptionTier.ACCESS_SIGNAL]: { monthly: 0, annual: 0 },
    [SubscriptionTier.HELIX_PROTOCOL]: { monthly: 29.99, annual: 299 },
    [SubscriptionTier.ARCHITECT_NODE]: { monthly: 79.99, annual: 799 }
};
