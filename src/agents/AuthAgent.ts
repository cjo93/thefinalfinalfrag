// @ts-ignore
import { JulesAgent, AgentTool } from '@google/jules-sdk';
import {
    createUserProfile,
    sendWelcomeEmail,
    updateUserProfile,
    deleteUserAccount,
    logAuthEvent
} from '../tools/auth';

export const authAgent = new JulesAgent({
    name: 'AuthAgent',
    description: 'Handles user authentication and onboarding',
    model: 'gemini-2.0-flash',
    tools: [
        createUserProfile,
        sendWelcomeEmail,
        updateUserProfile,
        deleteUserAccount,
        logAuthEvent,
    ]
});
