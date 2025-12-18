import { Firestore } from '@google-cloud/firestore';

// In a real Antigravity env, this might be injected or managed differently.
let firestore: any;

// Helper to determine if we should use the real Firestore or the Mock
const shouldUseRealFirestore = () => {
    // Check for explicit Project ID
    if (process.env.JULES_PROJECT_ID) return true;
    // Check for standard Google Auth (used in production/cloud-run)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return true;
    // Otherwise, default to Mock for safety in dev/offline
    return false;
};

if (shouldUseRealFirestore()) {
    try {
        console.log('[Firestore] Initializing real Firestore connection...');
        firestore = new Firestore({
            projectId: process.env.JULES_PROJECT_ID,
            databaseId: '(default)',
        });
    } catch (error) {
        console.error('[Firestore] Native Initialization failed. Falling back to Mock.');
        firestore = null;
    }
}

// If firestore is null (fallback) or we decided to use Mock...
if (!firestore) {
    console.warn('[Firestore] Using MOCK Firestore (Offline/Dev Mode).');

    // Minimal Mock Implementation to prevent crashes
    // Robust Recursive Mock Implementation
    const createMockChain = (id: string = 'mock_id') => {
        const chain: any = {
            // Data Methods
            get: async () => ({
                exists: true,
                id,
                data: () => ({
                    uid: id,
                    tier: 'ARCHITECT_NODE',
                    email: 'mock@defrag.app',
                    displayName: 'Mock User',
                    family_system_vectors: {
                        order_chaos: { position: 0.5 },
                        control_isolation: { position: 0.5 },
                        idealization_devaluation: { position: 0.5 }
                    },
                    events: [], // For terminal/timeline
                    analysis_history: [],
                    protocolStartedAt: new Date().toISOString(),
                    gamification: { xp: 1200, level: 3, rank: 'OPERATOR' },
                    birthDate: "1989-11-04",
                    birthTime: "12:00",
                    birthLocation: "Mock City, Data Void"
                }),
                docs: [], // For collection queries
                empty: true,
                forEach: (cb: any) => [] // For query snapshots
            }),
            set: async (data: any) => console.log(`[MockDB] Set ${id}:`, data),
            update: async (data: any) => console.log(`[MockDB] Update ${id}:`, data),
            add: async (data: any) => ({ id: 'new_mock_id', ...data }),

            // Chaining Methods (return self)
            collection: (name: string) => createMockChain(name),
            doc: (docId: string) => createMockChain(docId),
            userId: (uid: string) => createMockChain(uid), // Edge case
            where: () => chain,
            orderBy: () => chain,
            limit: () => chain,
            startAfter: () => chain,
            endBefore: () => chain
        };
        return chain;
    };

    firestore = {
        collection: (name: string) => createMockChain(name),
        doc: (path: string) => createMockChain(path),
        batch: () => ({
            set: () => { },
            update: () => { },
            commit: async () => { }
        }),
        runTransaction: async (cb: any) => cb({
            get: async (ref: any) => ref.get(),
            set: () => { },
            update: () => { }
        })
    };
}

export const db = firestore;

export const collections = {
    users: db.collection('users'),
    costTracking: db.collection('cost_tracking'),
    complianceLog: db.collection('compliance_log'),
    errorLogs: db.collection('error_logs'),
    metrics: db.collection('metrics'),
    costReports: db.collection('cost_reports'),
    errorReports: db.collection('error_reports'),
    // New TIER 0/1 Collections
    validations: db.collection('validations'),
    auditLogs: db.collection('feature_audit_logs'),
};
