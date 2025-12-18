// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import {
    applyMigration,
    autoMigrateOnRead,
    batchMigrate,
    validateSchema,
    rollback
} from '../tools/migration';

export const migrationAgent = new JulesAgent({
    name: 'MigrationAgent',
    description: 'Manages schema versioning and migrations',
    model: 'gemini-2.0-flash',
    tools: [
        applyMigration,
        autoMigrateOnRead,
        batchMigrate,
        validateSchema,
        rollback,
    ]
});
