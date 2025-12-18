// This file mocks the modules for compilation purposes in this environment.
// In a real Antigravity environment, these would be installed packages.

declare module '@google/jules-sdk' {
    export interface JulesConfig {
        project: any;
        ai: any;
        agents?: any;
    }

    export class JulesAgent {
        constructor(config: {
            name: string;
            description: string;
            model?: string;
            tools?: any[];
            caching?: any;
            budget?: any;
            logging?: any;
        });
    }
}

declare module '@google/antigravity-sdk' {
    export interface AntigravityConfig {
        backend: any;
        firestore: any;
        auth: any;
        costTracking: any;
        monitoring: any;
    }
}
