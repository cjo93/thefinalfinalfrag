import { MandalaAgent } from './MandalaAgent';
import { VoiceSynthesisAgent } from './VoiceAgent';
import { VectorDynamicsAgent } from './VectorDynamicsAgent';
import { EnvironmentDoctorAgent } from './EnvironmentDoctorAgent';
import { AnalystAgent } from './AnalystAgent';
import { familySystemAgent as familySysInstance } from './FamilySystemAgent'; // Imported const
import { AgentContext } from '../framework/AgentBase';

const context: AgentContext = {
    config: {}
};

export const mandalaAgent = new MandalaAgent(context);
export const voiceAgent = new VoiceSynthesisAgent(context);
export const vectorAgent = new VectorDynamicsAgent(context);
export const envDoctorAgent = new EnvironmentDoctorAgent(context);
export const analystAgent = new AnalystAgent();
export const familySystemAgent = familySysInstance; // Export standardized name

// Export a helper to get agent by name if needed, or just export instances
export const getAgent = (name: string) => {
    if (name === 'MandalaAgent') return mandalaAgent;
    if (name === 'VoiceSynthesisAgent') return voiceAgent;
    if (name === 'VectorDynamicsAgent') return vectorAgent;
    if (name === 'EnvironmentDoctorAgent') return envDoctorAgent; // [NEW]
    if (name === 'AnalystAgent') return analystAgent;
    throw new Error(`Agent ${name} not found`);
};
