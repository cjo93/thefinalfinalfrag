import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

function getCredential() {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        return applicationDefault();
    }
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as any);
    }
    // Fallback for local dev if serviceAccountKey.json exists
    if (fs.existsSync('./serviceAccountKey.json')) {
        const sa = require('../serviceAccountKey.json');
        return cert(sa);
    }
    throw new Error('No Google credentials available');
}

const app = initializeApp({
    credential: getCredential(),
    projectId: process.env.GOOGLE_PROJECT_ID || process.env.GCLOUD_PROJECT,
});

const db = getFirestore(app);

(async () => {
    try {
        const snap = await db.collection('_health').limit(1).get();
        console.log('✓ Firestore connection successful');
        console.log('Docs in _health:', snap.size);
        process.exit(0);
    } catch (e) {
        console.error('✗ Firestore connection failed:', e);
        process.exit(1);
    }
})();
