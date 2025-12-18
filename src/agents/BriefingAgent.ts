// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    generateFreeBriefing,
    generateProBriefing,
    generatePremiumBriefing,
    storeBriefing,
    trackCost
} from '../tools/briefing';

export const briefingAgent = new JulesAgent({
    name: 'BriefingAgent',
    description: 'Generates personalized daily HRV briefings',
    model: 'gemini-2.0-flash',
    caching: {
        enabled: true,
        ttl: 3600, // 1 hour
        maxCacheSize: '1M',
    },
    tools: [
        generateFreeBriefing,
        generateProBriefing,
        generatePremiumBriefing,
        storeBriefing,
        trackCost,
    ]
});
