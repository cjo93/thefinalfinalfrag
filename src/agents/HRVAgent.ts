// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    ingestHRVReading,
    classifyHRVState,
    storeReading,
    trackCost,
    triggerBriefingGeneration
} from '../tools/hrv';

export const hrvAgent = new JulesAgent({
    name: 'HRVAgent',
    description: 'Processes HRV readings and manages state classification',
    model: 'gemini-2.0-flash',
    tools: [
        ingestHRVReading,
        classifyHRVState,
        storeReading,
        trackCost,
        triggerBriefingGeneration,
    ]
});
