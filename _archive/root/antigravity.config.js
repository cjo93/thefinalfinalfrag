"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    backend: {
        endpoint: process.env.ANTIGRAVITY_ENDPOINT,
        timeoutMs: 30000,
    },
    firestore: {
        projectId: process.env.JULES_PROJECT_ID,
        databaseId: '(default)',
        connectionPooling: {
            min: 1,
            max: 10,
        },
    },
    auth: {
        provider: 'firebase',
        persistence: 'none', // Managed by agent session
    },
    costTracking: {
        enabled: true,
        budgetEnforcement: 'strict',
        currency: 'USD',
    },
    monitoring: {
        logLevel: 'info',
        traceEnabled: true,
    }
};
exports.default = config;
