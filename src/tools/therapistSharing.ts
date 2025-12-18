import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';

// --- Tool: createTherapistShare ---
export const createTherapistShare = async (input: {
    userId: string;
    therapist_email: string;
    access_type: 'read_only' | 'read_write';
    expires_at: Timestamp;
}) => {
    const { userId, therapist_email, access_type, expires_at } = input;

    if (expires_at.toMillis() < Date.now()) {
        throw new Error('Expiration date cannot be in the past');
    }

    // Verify therapist (Mock check)
    // In real app: const therapistUser = await collections.users.where('email', '==', therapist_email).where('is_verified_therapist', '==', true).get();
    // if (therapistUser.empty) throw new Error('Therapist not found or not verified');
    const therapist_uid = 'mock_therapist_uid';

    const shareData = {
        therapist_uid,
        therapist_email,
        access_type,
        created_at: Timestamp.now(),
        expires_at,
        revoked_at: null,
    };

    const docRef = await collections.users.doc(userId).collection('therapist_shares').add(shareData);

    await logComplianceAction({
        user_id: userId,
        action: 'share_created',
        details: { share_id: docRef.id, therapist_email, access_type }
    });

    return { share_id: docRef.id, expires_at, access_type };
};

// --- Tool: revokeTherapistShare ---
export const revokeTherapistShare = async (input: { userId: string; share_id: string }) => {
    const { userId, share_id } = input;

    await collections.users.doc(userId).collection('therapist_shares').doc(share_id).update({
        revoked_at: Timestamp.now()
    }); // Using delete here would lose audit trail? Prompt says "Delete share record" but "Log revocation".
    // HIPAA usually prefers soft delete or audit trail.
    // Prompt requirement 3 says: "Delete share record".
    // But Prompt requirement 7 says: "Share deletion prevents future access".
    // I'll opt for soft delete (revoked_at) as it is safer for compliance audit, OR stick to "delete" if strict prompt compliance.
    // Wait, Requirement 3 explicitly says "Delete share record".
    // Requirement 8 Schema says: "revoked_at: Timestamp | null".
    // This implies SOFT DELETE. I will use update revoked_at.

    await logComplianceAction({
        user_id: userId,
        action: 'share_revoked',
        details: { share_id }
    });

    return { success: true, revoked_at: Timestamp.now() };
};

// --- Tool: getSharedDataForTherapist ---
export const getSharedDataForTherapist = async (input: { therapist_uid: string }) => {
    const { therapist_uid } = input;

    // This query is complex in Firestore (Collection Group Query).
    // db.collectionGroup('therapist_shares').where('therapist_uid', '==', ...).where('revoked_at', '==', null)
    // Assuming 'therapist_shares' is a subcollection name.

    const sharesSnapshot = await db.collectionGroup('therapist_shares')
        .where('therapist_uid', '==', therapist_uid)
        .where('revoked_at', '==', null)
        .get();

    const results = [];

    for (const doc of sharesSnapshot.docs) {
        const share = doc.data();
        if (share.expires_at && share.expires_at.toMillis() < Date.now()) continue;

        // Get parent user
        // doc.ref.parent.parent is the user doc
        const userDocRef = doc.ref.parent.parent;
        if (!userDocRef) continue;

        const userDoc = await userDocRef.get();
        const userData = userDoc.data();
        if (!userData) continue;

        // Fetch limited data
        const hrvReadings = await userDocRef.collection('hrv_readings').orderBy('timestamp', 'desc').limit(30).get();
        const briefings = await userDocRef.collection('briefings').orderBy('date', 'desc').limit(7).get();
        const familyMembers = await userDocRef.collection('family_members').get();

        results.push({
            user_profile: { firstName: userData.firstName, lastName: userData.lastName }, // No PII email/phone
            hrv_readings: hrvReadings.docs.map((d: any) => d.data()),
            briefings: briefings.docs.map((d: any) => d.data()),
            family_members: familyMembers.docs.map((d: any) => d.data())
        });

        await logComplianceAction({
            user_id: userDoc.id,
            action: 'share_accessed',
            details: { therapist_uid, share_id: doc.id }
        });
    }

    return results;
};

// --- Tool: logComplianceAction ---
export const logComplianceAction = async (input: { user_id: string; action: string; details: any }) => {
    await collections.complianceLog.add({
        timestamp: Timestamp.now(),
        user_id: input.user_id,
        action: input.action,
        details: input.details,
        // therapist_id? details might contain it
    });
};
