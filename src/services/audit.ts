// T1-4: Audit Logging
import { collections } from './firestore';

interface AuditLogEntry {
    audit_id: string;
    user_id: string;
    feature_name: string;
    action: 'accessed' | 'denied' | 'expired';
    tier_at_time: string;
    timestamp: string;
    metadata?: any;
}

export const logFeatureAccess = async (
    userId: string,
    feature: string,
    action: 'accessed' | 'denied' | 'expired',
    tier: string,
    metadata: any = {}
) => {
    try {
        const logEntry: AuditLogEntry = {
            audit_id: crypto.randomUUID(),
            user_id: userId,
            feature_name: feature,
            action,
            tier_at_time: tier,
            timestamp: new Date().toISOString(),
            metadata
        };

        // Fire and forget - don't block main thread
        // In real prod, this goes to BigQuery/Datadog. For now, Firestore.
        collections.auditLogs.add(logEntry).catch((e: any) => console.error("Audit log failed", e));

    } catch (e) {
        console.error("Audit Logic Error", e);
    }
};
