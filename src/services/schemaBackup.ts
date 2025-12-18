import * as admin from 'firebase-admin';

/**
 * Backs up the user's schema/topology state to a Firestore subcollection.
 * Replaces Previous Google Cloud Storage implementation.
 */
export const backupSchemaToFirestore = async (userId: string, schema: any) => {
    const timestamp = Date.now();

    try {
        // Store in Firestore subcollection
        // Path: users/{userId}/schema_backups/{timestamp}
        await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('schema_backups')
            .doc(`${timestamp}`)
            .set({
                schema,
                timestamp,
                version: '1.0',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        console.log(`[Backup] Schema saved for user ${userId} at ${timestamp}`);
        return { success: true, timestamp };
    } catch (error) {
        console.error(`[Backup] Failed to save schema for user ${userId}`, error);
        throw error;
    }
};

/**
 * Exports schema to a local file path (for artifacts).
 * Useful for CI/CD or manual specialized exports.
 */
export const exportSchemaToArtifact = async (userId: string, schema: any) => {
    const fs = require('fs');
    const dir = './exports';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const path = `${dir}/${userId}_${Date.now()}.json`;

    fs.writeFileSync(path, JSON.stringify(schema, null, 2));

    return path;
};
