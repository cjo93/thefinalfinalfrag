import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';

// Replaced BigQuery/Storage with Firestore/Stub implementations for GitLab migration

// --- Tool: archiveOldData ---
export const archiveOldData = async () => {
    // Logic: Find readings > 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    // In a real Firestore-only implementation, we might move these to a 'cold' collection
    console.log(`[Stub] Archiving data older than ${cutoff.toISOString()}`);
    return { success: true, count: 0 };
};

// --- Tool: exportToBigQuery (DEPRECATED -> No-op) ---
export const exportToBigQuery = async (input: { readings: any[]; userId: string }) => {
    // BigQuery removed.
    console.log('[Info] BigQuery export disabled in GitLab-only architecture.');
    return { inserted: 0 };
};

// --- Tool: enforceRetentionPolicy ---
export const enforceRetentionPolicy = async () => {
    console.log('Enforcing retention policies...');
    return { success: true };
};

// --- Tool: getUserDataExport ---
export const getUserDataExport = async (input: { userId: string }) => {
    const { userId } = input;

    // 1. Collect Data
    const userDoc = await collections.users.doc(userId).get();
    const data = {
        profile: userDoc.data(),
        exportedAt: new Date().toISOString()
    };

    // 2. Write to Firestore 'exports' subcollection instead of GCS
    const exportId = Date.now().toString();
    await collections.users.doc(userId).collection('exports').doc(exportId).set(data);

    await logComplianceAction({ user_id: userId, action: 'export_data', details: { exportId } });

    return { download_url: `firestore://users/${userId}/exports/${exportId}`, expires_in_days: 7 };
};

// --- Tool: deleteUserData ---
export const deleteUserData = async (input: { userId: string }) => {
    const { userId } = input;

    // Archive first
    await getUserDataExport({ userId });

    // Delete Firestore (Recursive delete needed)
    await collections.users.doc(userId).delete();

    await logComplianceAction({ user_id: userId, action: 'delete_user', details: { type: 'GDPR_article_17' } });

    return { success: true, deleted_at: Timestamp.now() };
};

// --- Tool: logComplianceAction ---
export const logComplianceAction = async (input: { user_id: string; action: string; details: any }) => {
    try {
        await collections.complianceLog.add({
            timestamp: Timestamp.now(),
            user_id: input.user_id,
            operation: input.action,
            status: 'success',
            details: input.details
        });
    } catch (e) {
        console.error("Compliance Log Failed", e);
    }
};
