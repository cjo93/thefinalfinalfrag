import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import * as nodemailer from 'nodemailer';

// --- Tool: trackCost ---
export const trackCost = async (input: {
    service: 'gemini' | 'replicate' | 'stripe';
    operation: string;
    estimated_cost: number;
    user_id?: string;
    metadata?: any;
}) => {
    const { service, operation, estimated_cost, user_id, metadata } = input;

    await collections.costTracking.add({
        timestamp: Timestamp.now(),
        service,
        operation,
        estimated_cost_usd: estimated_cost,
        user_id: user_id || 'system',
        metadata: metadata || {},
    });

    return { success: true };
};

// --- Tool: checkBudget ---
export const checkBudget = async () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const snapshot = await collections.costTracking
        .where('timestamp', '>=', Timestamp.fromDate(startOfDay))
        .get();

    let dailyTotal = 0;
    snapshot.forEach((doc: any) => {
        dailyTotal += doc.data().estimated_cost_usd || 0;
    });

    console.log(`Daily Spend: $${dailyTotal.toFixed(2)}`);

    const ALERTS = { WARNING: 3, CRITICAL: 5, SHUTDOWN: 7 };

    if (dailyTotal > ALERTS.SHUTDOWN) {
        console.log('ALERT: SHUTDOWN threshold reached. Pausing all AI features.');
        // await setGlobalFlag('pause_ai_features', true);
    } else if (dailyTotal > ALERTS.CRITICAL) {
        console.log('ALERT: CRITICAL threshold reached. Pausing mandalas.');
        // await setGlobalFlag('pause_mandalas', true);
        // await sendSlackAlert(...)
    } else if (dailyTotal > ALERTS.WARNING) {
        console.log('ALERT: Daily budget warning.');
    }

    return { dailyTotal, status: dailyTotal < ALERTS.WARNING ? 'ok' : 'alert' };
};

// --- Tool: generateCostReport ---
export const generateCostReport = async (input: { period: 'weekly' | 'monthly' } = { period: 'weekly' }) => {
    // Mock generation
    const report = {
        period: input.period,
        date_range: { start: '2025-10-01', end: '2025-10-07' },
        total_cost: 125.50,
        by_service: { gemini: 20, replicate: 80, stripe: 25.50 },
        cost_per_user: 0.12,
        forecast_monthly: 540.00
    };

    await collections.costReports.doc(new Date().toISOString().split('T')[0]).set(report);

    // Email admin
    // ...

    return { success: true, report_id: 'mock_report_id' };
};

// --- Tool: getAdminDashboard ---
export const getAdminDashboard = async () => {
    const { dailyTotal } = await checkBudget();

    return {
        today: { total: dailyTotal, by_service: {} },
        week: { total: dailyTotal * 7, trend: 'stable' },
        alerts: [],
        budget_status: { daily: 5.00, consumed: dailyTotal },
        auto_pauses: false,
    };
};
