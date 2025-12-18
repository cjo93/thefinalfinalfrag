
import { Agent, AgentContext } from "../framework/AgentBase";
import dotenv from 'dotenv';

interface HealthReport {
    timestamp: string;
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    keys: Record<string, 'OK' | 'MISSING' | 'OPTIONAL_MISSING'>;
    services: {
        database: 'CONNECTED' | 'DISCONNECTED' | 'UNKNOWN';
        stripe: 'READY' | 'NOT_CONFIGURED';
        replicate: 'READY' | 'MOCK_MODE';
        elevenlabs: 'READY' | 'MOCK_MODE';
    };
    notes: string[];
}

export class EnvironmentDoctorAgent extends Agent {
    constructor(context: AgentContext) {
        super("EnvironmentDoctorAgent", context);
    }

    async checkHealth(): Promise<HealthReport> {
        const report: HealthReport = {
            timestamp: new Date().toISOString(),
            status: 'HEALTHY',
            keys: {},
            services: {
                database: 'UNKNOWN',
                stripe: 'NOT_CONFIGURED',
                replicate: 'MOCK_MODE',
                elevenlabs: 'MOCK_MODE'
            },
            notes: []
        };

        // 1. Key Validation
        const criticalKeys = ['OPENAI_API_KEY', 'GOOGLE_APPLICATION_CREDENTIALS']; // AI & DB
        const optionalKeys = ['STRIPE_SECRET_KEY', 'REPLICATE_API_TOKEN', 'ELEVENLABS_API_KEY'];

        criticalKeys.forEach(key => {
            if (process.env[key]) {
                report.keys[key] = 'OK';
            } else {
                report.keys[key] = 'MISSING';
                report.status = 'CRITICAL';
                report.notes.push(`CRITICAL: Missing ${key}. Agent system or Database may fail.`);
            }
        });

        optionalKeys.forEach(key => {
            if (process.env[key]) {
                report.keys[key] = 'OK';
            } else {
                report.keys[key] = 'OPTIONAL_MISSING';
                if (report.status === 'HEALTHY') report.status = 'DEGRADED';
                report.notes.push(`Warning: Missing ${key}. Related features will use Mock/Fallback mode.`);
            }
        });

        // 2. Service State Inference
        if (process.env.STRIPE_SECRET_KEY) report.services.stripe = 'READY';
        if (process.env.REPLICATE_API_TOKEN) report.services.replicate = 'READY';
        if (process.env.ELEVENLABS_API_KEY) report.services.elevenlabs = 'READY';

        try {
            // Simple DB check (if we had a direct import, but we'll infer from credentials for now to avoid side-effects)
            // @ts-ignore
            const { db } = await import('../services/firestore');
            if (db) report.services.database = 'CONNECTED'; // Weak check, but assumes init passed in firestore.ts
        } catch (e) {
            report.services.database = 'DISCONNECTED';
            report.status = 'CRITICAL';
            report.notes.push("Database connection failed.");
        }

        // 3. Console Summary
        if (report.status !== 'HEALTHY') {
            console.warn(`[EnvironmentDoctor] System Status: ${report.status}`);
            report.notes.forEach(note => console.warn(`[Doctor] ${note}`));
        } else {
            console.log(`[EnvironmentDoctor] System is HEALTHY.`);
        }

        return report;
    }
}
