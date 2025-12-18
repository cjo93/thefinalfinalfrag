// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    archiveOldData,
    exportToBigQuery,
    enforceRetentionPolicy,
    getUserDataExport,
    deleteUserData,
    logComplianceAction
} from '../tools/archival';

export const archivalAgent = new JulesAgent({
    name: 'ArchivalAgent',
    description: 'Manages data archival and compliance',
    model: 'gemini-2.0-flash',
    tools: [
        archiveOldData,
        exportToBigQuery,
        enforceRetentionPolicy,
        getUserDataExport,
        deleteUserData,
        logComplianceAction,
    ]
});
