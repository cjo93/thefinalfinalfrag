// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    logError,
    sendAlert,
    trackMetric,
    generateErrorReport
} from '../tools/errorHandling';

export const errorAgent = new JulesAgent({
    name: 'ErrorHandlingAgent',
    description: 'Manages errors, logging, and observability',
    model: 'gemini-2.0-flash',
    logging: {
        level: 'info',
        destination: 'firestore',
        retention: 90, // days
    },
    tools: [
        logError,
        sendAlert,
        trackMetric,
        generateErrorReport,
    ]
});
