import { db } from './firestore'; // Using existing Firestore service
import { DiagnosticsEvent } from '../types/diagnostics';
import { logger } from '../backend/observability/logger';

export class DiagnosticsLogService {
    private static COLLECTION = 'diagnostics_log';

    static async logEvent(event: DiagnosticsEvent): Promise<void> {
        try {
            // 1. Sanitize Payload (Double check redundancy with logger)
            const safeEvent = {
                ...event,
                timestamp: event.timestamp || new Date().toISOString()
            };

            // 2. Persist to Firestore (Async/Fire-and-forget for performance)
            // In high scale, use a buffer/queue.
            await db.collection(this.COLLECTION).add(safeEvent);

        } catch (error) {
            // Fallback to file/stdout if DB fails, don't crash the request
            logger.error("Failed to persist diagnostics log", event.trace_id, 'DiagnosticsService', { error });
        }
    }

    static async getRecentEvents(userId: string, limit: number = 50): Promise<DiagnosticsEvent[]> {
        try {
            const snapshot = await db.collection(this.COLLECTION)
                .where('user_id', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map((doc: any) => doc.data() as DiagnosticsEvent);
        } catch (error) {
            logger.error("Failed to fetch diagnostics", undefined, 'DiagnosticsService', { error });
            return [];
        }
    }
}
