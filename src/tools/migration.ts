import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';

const CURRENT_VERSION = 3;

// --- Tool: applyMigration ---
export const applyMigration = async (input: { data: any; from_version: number; to_version: number }) => {
    let { data, from_version, to_version } = input;
    let migratedData = { ...data };

    // Sequential migration logic
    if (from_version < 1 && to_version >= 1) {
        // v0 -> v1: Add integration_score
        migratedData.integration_score = 0;
    }
    if (from_version < 2 && to_version >= 2) {
        // v1 -> v2: Restructure family_system_vectors
        if (!migratedData.family_system_vectors) {
            migratedData.family_system_vectors = {
                order_chaos: { position: 0.5, confidence: 0 },
                control_isolation: { position: 0.5, confidence: 0 },
                idealization_devaluation: { position: 0.5, confidence: 0 }
            };
        }
    }
    if (from_version < 3 && to_version >= 3) {
        // v2 -> v3: Rename baseline -> baseline_rmssd
        if (migratedData.baseline !== undefined) {
            migratedData.baseline_rmssd = migratedData.baseline;
            delete migratedData.baseline;
        }
    }

    migratedData.schema_version = to_version;
    return migratedData;
};

// --- Tool: autoMigrateOnRead ---
export const autoMigrateOnRead = async (input: { userId: string }) => {
    const userRef = collections.users.doc(input.userId);
    const doc = await userRef.get();

    if (!doc.exists) return null;
    const data = doc.data() || {};

    if ((data.schema_version || 0) < CURRENT_VERSION) {
        console.log(`Migrating user ${input.userId} from v${data.schema_version || 0} to v${CURRENT_VERSION}`);
        const migrated = await applyMigration({
            data,
            from_version: data.schema_version || 0,
            to_version: CURRENT_VERSION
        });

        // Background save
        userRef.set(migrated).catch((err: any) => console.error('Background migration save failed', err));

        return migrated;
    }

    return data;
};

// --- Tool: batchMigrate ---
export const batchMigrate = async () => {
    // Query users with old version (Requires index)
    const snapshot = await collections.users.where('schema_version', '<', CURRENT_VERSION).limit(100).get();

    let count = 0;
    // Use Promise.all for parallel processing in batch
    const promises = snapshot.docs.map(async (doc: any) => {
        const data = doc.data();
        const migrated = await applyMigration({
            data,
            from_version: data.schema_version || 0,
            to_version: CURRENT_VERSION
        });
        await doc.ref.set(migrated);
        count++;
    });

    await Promise.all(promises);
    console.log(`Batch migrated ${count} users.`);

    return { success: true, count };
};

// --- Tool: validateSchema ---
export const validateSchema = async (input: { document: any; expected_version: number }) => {
    const { document, expected_version } = input;

    const errors = [];
    if (document.schema_version !== expected_version) {
        errors.push(`Version mismatch. Expected ${expected_version}, got ${document.schema_version}`);
    }
    // Add more Zod-like validation here...

    return { valid: errors.length === 0, errors };
};

// --- Tool: rollback ---
export const rollback = async (input: { userId: string; target_version: number }) => {
    // Dangerous operation - Mock implementation
    console.warn(`Rolling back user ${input.userId} to v${input.target_version}. Logic not fully implemented.`);
    return { success: true, warning: 'Mock rollback' };
};
