// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    addFamilyMember,
    updateFamilyMemberRole,
    analyzeFamilySystem,
    calculateVectors,
    updateIntegrationScore
} from '../tools/familySystem';

export const familySystemAgent = new JulesAgent({
    name: 'FamilySystemAgent',
    description: 'Tracks and analyzes family system dynamics',
    model: 'gemini-2.0-flash',
    tools: [
        addFamilyMember,
        updateFamilyMemberRole,
        analyzeFamilySystem,
        calculateVectors,
        updateIntegrationScore,
    ]
});
