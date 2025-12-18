import { db, collections } from '../services/firestore';
import * as nodemailer from 'nodemailer';
import { Timestamp, FieldValue } from '@google-cloud/firestore';

// --- Types ---
interface UserProfile {
    uid: string;
    email: string;
    firstName?: string;
    lastName?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    schema_version: number;
    baseline_rmssd: number;
    integration_score: number;
    subscription_tier: 'free' | 'pro' | 'premium';
    subscription_status: 'active' | 'cancelling' | 'cancelled' | 'past_due';
}

// --- Tool: createUserProfile ---
export const createUserProfile = async (input: { uid: string; email: string; firstName?: string; lastName?: string }) => {
    try {
        const { uid, email, firstName, lastName } = input;
        const userRef = collections.users.doc(uid);

        // Check if exists
        const doc = await userRef.get();
        if (doc.exists) {
            return { success: false, error: 'User already exists' };
        }

        const userData: UserProfile = {
            uid,
            email,
            firstName,
            lastName,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
            schema_version: 3,
            baseline_rmssd: 50,
            integration_score: 0.0,
            subscription_tier: 'free',
            subscription_status: 'active',
        };

        await userRef.set(userData);

        // Log success
        /* await collections.errorLogs.add({ ... }); */ // (Assuming logging is handled separately or by agent wrapper)

        return { success: true, user_id: uid, created_at: userData.created_at };
    } catch (error: any) {
        console.error('createUserProfile error:', error);
        // In a real Jules agent, we might throw or return structured error
        throw new Error(`Failed to create user profile: ${error.message}`);
    }
};

// --- Tool: sendWelcomeEmail ---
// Mock transporter for now if no auth provided
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

export const sendWelcomeEmail = async (input: { email: string; firstName?: string }) => {
    const { email, firstName } = input;
    console.log(`Sending welcome email to ${email}`);

    // In production, load template from file. For now, inline or simple read.
    const html = `<h1>Welcome to DEFRAG Daily${firstName ? ', ' + firstName : ''}!</h1><p>Your journey begins now.</p>`;

    try {
        if (process.env.NODE_ENV === 'production') {
            await transporter.sendMail({
                from: '"DEFRAG Daily" <noreply@defragdaily.com>',
                to: email,
                subject: 'Welcome to the Resonance',
                html
            });
        } else {
            console.log('Dev mode: Email simulation successful');
        }
        return { success: true, recipient: email };
    } catch (error: any) {
        console.error('sendWelcomeEmail error:', error);
        return { success: false, error: error.message };
    }
};

// --- Tool: updateUserProfile ---
export const updateUserProfile = async (input: { uid: string; updates: Partial<UserProfile> }) => {
    const { uid, updates } = input;

    // Validate
    if (updates.baseline_rmssd !== undefined) {
        if (updates.baseline_rmssd < 0 || updates.baseline_rmssd > 200) {
            throw new Error('Invalid baseline_rmssd: must be 0-200');
        }
    }

    const userRef = collections.users.doc(uid);
    await userRef.update({
        ...updates,
        updated_at: Timestamp.now()
    });

    const updatedDoc = await userRef.get();
    return { success: true, data: updatedDoc.data() };
};

// --- Tool: deleteUserAccount ---
export const deleteUserAccount = async (input: { uid: string; reason?: string }) => {
    const { uid, reason } = input;
    console.log(`Deleting user ${uid}, reason: ${reason}`);

    // Archive data (Mock)
    // await archiveUserDataToStorage(uid);

    // Delete from Firestore
    await collections.users.doc(uid).delete();

    // Delete from Auth (requires firebase-admin, assumed available)
    /* await admin.auth().deleteUser(uid); */

    // Log
    await collections.complianceLog.add({
        action: 'delete_account',
        uid,
        reason,
        timestamp: Timestamp.now()
    });

    return { success: true, archived_at: Timestamp.now() };
};

// --- Tool: logAuthEvent ---
export const logAuthEvent = async (input: { uid: string; event: string }) => {
    console.log(`Auth Event: ${input.event} for ${input.uid}`);
    // Implementation details skipped for brevity
    return { success: true };
};
