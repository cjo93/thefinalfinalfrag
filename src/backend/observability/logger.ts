import fs from 'fs';
import path from 'path';

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    trace_id?: string;
    agent?: string;
    meta?: Record<string, any>;
}

class Logger {
    private static instance: Logger;

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private log(level: LogLevel, message: string, trace_id?: string, agent?: string, meta?: Record<string, any>) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            trace_id,
            agent,
            meta
        };

        // Standard Output (for Cloud Logging)
        console.log(JSON.stringify(entry));

        // PII Check (Double Guardrail)
        if (JSON.stringify(entry).match(/\b(email|phone|ssn)\b/i)) {
            console.error("FATAL: PII LEAK DETECTED IN LOGS");
            // In real production, this would trigger an alert
        }
    }

    public info(msg: string, trace_id?: string, agent?: string, meta?: any) {
        this.log(LogLevel.INFO, msg, trace_id, agent, meta);
    }

    public warn(msg: string, trace_id?: string, agent?: string, meta?: any) {
        this.log(LogLevel.WARN, msg, trace_id, agent, meta);
    }

    public error(msg: string, trace_id?: string, agent?: string, meta?: any) {
        this.log(LogLevel.ERROR, msg, trace_id, agent, meta);
    }
}

export const logger = Logger.getInstance();
