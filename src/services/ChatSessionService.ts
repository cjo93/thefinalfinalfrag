import { db } from './firestore';
import { ChatSession } from '../types/session';
import { logger } from '../backend/observability/logger';
import { v4 as uuidv4 } from 'uuid';

export class ChatSessionService {
    private static COLLECTION = 'chat_sessions';

    static async startSession(userId: string, entitlementId: string, credits: number): Promise<ChatSession> {
        const session: ChatSession = {
            session_id: uuidv4(),
            user_id: userId,
            entitlement_id: entitlementId,
            start_time: new Date().toISOString(),
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 Hour TTL example
            remaining_credits: credits,
            status: 'ACTIVE',
            current_regime: 'NOMINAL',
            context_stack: []
        };

        await db.collection(this.COLLECTION).doc(session.session_id).set(session);
        return session;
    }

    static async getSession(sessionId: string): Promise<ChatSession | null> {
        const doc = await db.collection(this.COLLECTION).doc(sessionId).get();
        if (!doc.exists) return null;
        return doc.data() as ChatSession;
    }

    static async decrementCredit(sessionId: string, amount: number = 1): Promise<void> {
        // Atomic decrement
        // In Firestore, use transaction or FieldValue.increment
        // For MVP, simple read-write
        const sessionRef = db.collection(this.COLLECTION).doc(sessionId);

        await db.runTransaction(async (t: any) => {
            const doc = await t.get(sessionRef);
            if (!doc.exists) return;

            const data = doc.data() as ChatSession;
            if (data.remaining_credits < amount) {
                // Should have been caught by check, but force status update
                t.update(sessionRef, { status: 'EXHAUSTED' });
                return;
            }

            t.update(sessionRef, {
                remaining_credits: data.remaining_credits - amount,
                status: (data.remaining_credits - amount <= 0) ? 'EXHAUSTED' : 'ACTIVE'
            });
        });
    }

    static async holdSession(sessionId: string): Promise<void> {
        // HOLD does not decrement credit, but updates heartbeat/regime
        // This method keeps session alive/active without cost
        const sessionRef = db.collection(this.COLLECTION).doc(sessionId);
        await sessionRef.update({
            last_activity: new Date().toISOString() // Keep alive
        });
    }
}
