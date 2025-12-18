// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    createTherapistShare,
    revokeTherapistShare,
    getSharedDataForTherapist,
    logComplianceAction
} from '../tools/therapistSharing';

export const therapistAgent = new JulesAgent({
    name: 'TherapistSharingAgent',
    description: 'Manages HIPAA-compliant therapist data access',
    model: 'gemini-2.0-flash',
    tools: [
        createTherapistShare,
        revokeTherapistShare,
        getSharedDataForTherapist,
        logComplianceAction,
    ]
});
