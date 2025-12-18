declare module '@google/antigravity-sdk' {
    export type AntigravityConfig = {
        backend: {
            endpoint?: string;
            timeoutMs: number;
        };
        firestore: {
            projectId?: string;
            databaseId: string;
            connectionPooling: {
                min: number;
                max: number;
            };
        };
        auth: {
            provider: string;
            persistence: string;
        };
        costTracking: {
            enabled: boolean;
            budgetEnforcement: string;
            currency: string;
        };
        monitoring: {
            logLevel: string;
            traceEnabled: boolean;
        };
    }
}
