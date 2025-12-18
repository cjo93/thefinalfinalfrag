import { AgentRunnable } from '../../types/agent-runtime';
import { logger } from '../observability/logger';

// Import Instances
import { vectorAgent, analystAgent, voiceAgent, familySystemAgent } from '../../agents/instances';

// Map Registry Names (from agent-registry.json) to Instances
const agentMap: Record<string, any> = {
    'vector-dynamics-agent': vectorAgent,
    'analyst-agent': analystAgent,
    'voice-agent': voiceAgent,
    'family-system-agent': familySystemAgent,
};

export const getAgent = (targetAgent: string): AgentRunnable | null => {
    const rawAgent = agentMap[targetAgent];
    if (!rawAgent) return null;

    // ADAPTER LOGIC:
    // If agent has a .run() method, return it wrapped as AgentRunnable
    // If agent has a .process() method (legacy), wrapper
    // If agent is a JulesAgent (familySystemAgent), wrap .run() or .process()

    return {
        name: targetAgent,
        run: async (payload: any, ctx: any) => {
            try {
                // Check for various invocation patterns in existing codebase
                if (typeof rawAgent.run === 'function') {
                    // JulesAgent typically uses .run({ prompt: ... }) or similar
                    // We may need to map payload to prompt if it's a JulesAgent
                    return await rawAgent.run({ ...payload, ...ctx });
                } else if (typeof rawAgent.process === 'function') {
                    // Our Antigravity Agents might use .process()
                    return await rawAgent.process(payload, ctx);
                } else if (typeof rawAgent.execute === 'function') {
                    return await rawAgent.execute(payload);
                } else {
                    throw new Error(`Agent ${targetAgent} has no executable method (run/process/execute)`);
                }
            } catch (err: any) {
                logger.error(`Agent Runtime Error: ${err.message}`, ctx?.trace_id, targetAgent);
                throw err;
            }
        }
    };
};

export const invokeAgent = async (targetAgent: string, payload: any, ctx: { trace_id: string; userId?: string; tier?: string; regime?: any }): Promise<any> => {
    const agent = getAgent(targetAgent);
    if (!agent) {
        throw new Error(`Agent ${targetAgent} not found in Dispatch Map`);
    }
    return await agent.run(payload, ctx);
};
