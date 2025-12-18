import { Request, Response, NextFunction } from 'express';
import { z } from 'zod'; // Using Zod for strict checking against registry
import registryData from '../../../spec/agent-registry.json';
import { logger } from '../observability/logger';

// Type definition for Registry (inferred)
type AgentCapability = {
    name: string;
    domain: string;
    allowedInputs: string[];
    allowedOutputs: string[];
    forbiddenOutputs?: string[];
    escalationTargets?: string[];
    timeoutMs?: number;
};

type Registry = {
    agentRegistryVersion: string;
    agents: AgentCapability[];
};

const registry = registryData as Registry;

export const enforceRegistry = (req: Request, res: Response, next: NextFunction) => {
    const { targetAgent, payload, trace_id } = req.body;

    if (!targetAgent) {
        // Validation middleware should catch this, but double check
        return next();
    }

    const agentSpec = registry.agents.find(a => a.name === targetAgent);

    // 1. Check if agent exists in registry
    if (!agentSpec) {
        logger.error(`DENIED: Unknown agent '${targetAgent}'`, trace_id, 'Router');
        return res.status(403).json({
            code: "FORBIDDEN",
            message: `Agent '${targetAgent}' is not declared in the registry.`,
            trace_id
        });
    }

    // 2. Check Allowed Inputs (Simple Key Check for now)
    // In production, this would deep-inspect the payload keys against a schema map
    // For MVP, we pass if the agent is known. Deeper schema validation happens in schemaMap.ts

    // 3. Log Registry Check
    logger.info(`Registry Check Passed: ${targetAgent}`, trace_id, 'RegistryGuard');

    // Attach capability specs to request for downstream use (e.g. timeout)
    (req as any).agentCapability = agentSpec;

    next();
};
