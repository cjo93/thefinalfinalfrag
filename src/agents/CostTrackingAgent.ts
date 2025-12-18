// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    trackCost,
    checkBudget,
    generateCostReport,
    getAdminDashboard
} from '../tools/costTracking';

export const costAgent = new JulesAgent({
    name: 'CostTrackingAgent',
    description: 'Tracks and enforces budget limits',
    model: 'gemini-2.0-flash',
    budget: {
        daily: 5.00,
        weekly: 30.00,
        monthly: 100.00,
    },
    tools: [
        trackCost,
        checkBudget,
        generateCostReport,
        getAdminDashboard,
    ]
});
