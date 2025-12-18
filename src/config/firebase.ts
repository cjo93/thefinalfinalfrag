import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log(`[FIREBASE] Initialized: ${process.env.FIREBASE_PROJECT_ID}`);
    } catch (error) {
        console.error("[FIREBASE] Initialization Error - Running in Offline/Mock Mode for Dev");
    }
}

// Safely export service instances
const isInitialized = admin.apps.length > 0;

export const auth = isInitialized ? admin.auth() : {
    verifyIdToken: async (token: string) => {
        console.warn("[MOCK AUTH] Verifying token:", token.substring(0, 10));
        return { uid: 'mock_uid', email: 'mock@defrag.os', email_verified: true };
    },
    getUser: async (uid: string) => ({ uid, email: 'mock@defrag.os' })
} as any;

const mockCollection = () => ({
    doc: (id: string) => ({
        get: async () => ({ exists: false, data: () => undefined }),
        set: async (data: any) => console.log("[MOCK DB] Set:", id, data),
        update: async (data: any) => console.log("[MOCK DB] Update:", id, data),
        collection: mockCollection
    }),
    where: () => ({ get: async () => ({ empty: true, docs: [] }) }),
    add: async (data: any) => ({ id: 'mock_id', ...data })
});

export const db = isInitialized ? admin.firestore() : {
    collection: mockCollection,
    listCollections: async () => []
} as any;
