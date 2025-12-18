import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import fetch from 'node-fetch';

// --- Types ---
interface ErrorInput {
    error: any;
    context?: any;
    severity: 'warning' | 'error' | 'critical';
    user_id?: string;
    operation?: string;
}

// --- Tool: logError ---
export const logError = async (input: ErrorInput) => {
    const { error, context, severity, user_id, operation } = input;

    const errorData = {
        timestamp: Timestamp.now(),
        error_message: error.message || String(error),
        error_stack: error.stack || null,
        severity,
        operation: operation || 'unknown',
        user_id: user_id || 'system',
        duration_ms: context?.duration_ms || 0,
        environment: process.env.NODE_ENV || 'development'
    };

    const docRef = await collections.errorLogs.add(errorData);

    // If Critical, trigger alert logic
    if (severity === 'critical') {
        await sendAlert(input);
    }

    return { success: true, error_id: docRef.id };
};

// --- Tool: sendAlert ---
export const sendAlert = async (input: ErrorInput) => {
    const { error, operation, severity } = input;

    // Send to Slack
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
    if (SLACK_WEBHOOK) {
        try {
            await fetch(SLACK_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🚨 CRITICAL ERROR in ${operation}`,
                    attachments: [{
                        color: 'danger',
                        fields: [
                            { title: 'Error', value: error.message, short: false },
                            { title: 'Severity', value: severity, short: true }
                        ]
                    }]
                })
            });
        } catch (e) {
            console.error('Failed to send Slack alert', e);
        }
    }

    // Admin alert in Firestore
    // (Assuming 'admin_alerts' collection or similar)
    await db.collection('admin_alerts').add({
        timestamp: Timestamp.now(),
        type: 'critical_error',
        severity,
        operation,
        error_message: error.message,
        read: false
    });

    return { success: true, alerted: true };
};

// --- Tool: trackMetric ---
export const trackMetric = async (input: { operation: string; duration_ms: number; success: boolean }) => {
    const { operation, duration_ms, success } = input;

    await collections.metrics.doc(operation).collection('values').add({
        metric: 'operation_duration',
        value: duration_ms,
        labels: { operation, success },
        timestamp: Timestamp.now()
    });

    return { success: true };
};

// --- Tool: generateErrorReport ---
export const generateErrorReport = async () => {
    // Mock aggregation logic
    const report = {
        timestamp: Timestamp.now(),
        total_errors: 42,
        critical_count: 2,
        top_errors: ['ValidationError'],
        trends: 'stable'
    };

    await collections.errorReports.doc(new Date().toISOString().split('T')[0]).set(report);
    return { success: true };
};
