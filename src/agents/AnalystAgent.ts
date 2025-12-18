import { LineageMember as FamilyMember, PassLevel, SchemaObject } from '../types/family-system';
import { SchemaAgent } from './SchemaAgent';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { COGNITIVE_OS_SYSTEM_PROMPT, DEEP_DIVE_TEMPLATE } from './prompts/structural';
// import { SimulationState } from '../types/family-system';

// Fallback if SimulationState isn't exported:
interface NodeState {
    id: string;
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
}
interface SimState {
    nodes: NodeState[];
}

export interface Insight {
    id: string;
    type: 'DRIFT_WARNING' | 'CLUSTER_DETECTED' | 'HIGH_ENTROPY' | 'PATTERN_RECOGNITION' | 'SCHEMA_COHERENCE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    title: string;
    description: string;
    relatedNodeIds: string[];
    timestamp: number;
    metrics?: {
        entropy?: number;
        passLevel?: PassLevel;
        coherence?: number;
    }
}

export class AnalystAgent {
    private schemaAgent: SchemaAgent;
    private model: any; // Type 'GenerativeModel' if available

    constructor() {
        // In a real DI setup, dependencies would be injected
        this.schemaAgent = new SchemaAgent({} as any);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    /**
     * Analyzes the current physics state of the family system to generate insights.
     */
    public async analyze(state: SimState, members: FamilyMember[], tier: 'BASIC' | 'PRO' | 'EXPERT' = 'BASIC'): Promise<Insight[]> {
        const insights: Insight[] = [];

        // 1. Calculate System Metrics (All Tiers)
        const entropy = this.calculateEntropy(state);
        const passLevel = this.calculatePassLevel(entropy);

        // 2. Heuristic Analysis (BASIC+)
        if (passLevel >= PassLevel.DETECTION) {
            this.detectDrift(state, members, insights);
        }

        // 3. Advanced Pattern Recognition (PRO+)
        if (tier !== 'BASIC' && passLevel >= PassLevel.MAPPING) {
            this.detectClusters(state, members, insights);
        }

        // 4. Schema Integration (PRO+ & High Pass Level)
        if (tier !== 'BASIC' && passLevel >= PassLevel.INTEGRATION) {
            // Mock Schema Construction from State
            const mockSchema: SchemaObject = {
                nodes: members.map(m => ({ id: m.id, content: m.role, affectWeight: 0.5 })),
                edges: [], // Would derive from vector distances
                coherenceScore: 0
            };

            const integratedSchema = await this.schemaAgent.integrateSchema(mockSchema);

            if (integratedSchema.coherenceScore < 0.5) {
                insights.push({
                    id: `coherence-${Date.now()}`,
                    type: 'SCHEMA_COHERENCE',
                    severity: 'HIGH',
                    title: 'Low Cognitive Coherence',
                    description: `Schema integration failed to resolve contradictions. Coherence Score: ${integratedSchema.coherenceScore.toFixed(2)}`,
                    relatedNodeIds: [],
                    timestamp: Date.now(),
                    metrics: { coherence: integratedSchema.coherenceScore, passLevel }
                });
            }
        }

        // 5. Narrative Synthesis (EXPERT ONLY - Always trigger if requested via high tier)
        if (tier === 'EXPERT') {
            try {
                const narrative = await this.generateDeepDive(state, members);
                insights.push(narrative);
            } catch (error) {
                console.error("Deep Dive Generation Failed:", error);
            }
        }

        return insights;
    }

    private calculatePassLevel(entropy: number): PassLevel {
        if (entropy > 0.8) return PassLevel.DETECTION; // User stressed/Chaos high -> Safety first
        if (entropy > 0.5) return PassLevel.MAPPING;
        if (entropy > 0.2) return PassLevel.INTEGRATION;
        return PassLevel.CALIBRATION; // User stable
    }

    private detectClusters(state: SimState, members: FamilyMember[], insights: Insight[]) {
        // Simple proximity clustering
        const clusters: string[][] = [];
        // O(N^2) check for demo
        for (let i = 0; i < state.nodes.length; i++) {
            for (let j = i + 1; j < state.nodes.length; j++) {
                const n1 = state.nodes[i];
                const n2 = state.nodes[j];
                const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2) + Math.pow(n1.z - n2.z, 2));
                if (dist < 2.0) { // Cluster threshold
                    insights.push({
                        id: `cluster-${n1.id}-${n2.id}`,
                        type: 'CLUSTER_DETECTED',
                        severity: 'MEDIUM',
                        title: 'Fusion/Enmeshment Risk',
                        description: `Nodes ${n1.id} and ${n2.id} are dangerously close.`,
                        relatedNodeIds: [n1.id, n2.id],
                        timestamp: Date.now()
                    });
                }
            }
        }
    }

    private calculateEntropy(state: SimState): number {
        if (!state.nodes || state.nodes.length === 0) return 0;
        let totalVelocity = 0;
        state.nodes.forEach((node: NodeState) => {
            totalVelocity += Math.sqrt(node.vx * node.vx + node.vy * node.vy + node.vz * node.vz);
        });
        // Normalize: assuming max reasonable velocity is ~0.5 per tick, map to 0-1
        const avgVel = totalVelocity / state.nodes.length;
        return Math.min(avgVel * 2, 1);
    }

    private detectDrift(state: SimState, members: FamilyMember[], insights: Insight[]) {
        state.nodes.forEach((node: NodeState) => {
            const distance = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
            if (distance > 300) { // Arbitrary boundary
                const member = members.find(m => m.id === node.id);
                if (member) {
                    // Check for Clinical Trigger
                    const principle = this.selectClinicalPrinciple({ distance, velocity: 0 /* mock */ });

                    insights.push({
                        id: `drift-${node.id}-${Date.now()}`,
                        type: 'DRIFT_WARNING',
                        severity: 'MEDIUM',
                        title: `Drift Detected: ${member.name || member.role}`,
                        description: `${member.role || 'Member'} is drifting to the periphery.`,
                        relatedNodeIds: [node.id],
                        timestamp: Date.now(),
                        metrics: { passLevel: PassLevel.DETECTION } // Added context
                    });

                    if (principle) {
                        insights.push({
                            id: `clinical-${node.id}-${Date.now()}`,
                            type: 'PATTERN_RECOGNITION',
                            severity: 'HIGH',
                            title: 'Clinical Intervention Trigger',
                            description: `Recommended Principle: ${principle}`,
                            relatedNodeIds: [node.id],
                            timestamp: Date.now()
                        });
                    }
                }
            }
        });
    }

    private selectClinicalPrinciple(metrics: { distance: number, velocity: number }): string | null {
        // Mock state-based logic
        if (metrics.distance > 500) return "RELATE_003: Choose bond over correctness";
        if (metrics.distance > 300) return "UPR_001: Safety container required";
        return null;
    }

    /**
     * Uses Generative AI to create a stylistic "Deep Dive" report.
     */
    private async generateDeepDive(state: SimState, members: FamilyMember[]): Promise<Insight> {
        const entropy = this.calculateEntropy(state);

        if (!process.env.GEMINI_API_KEY) {
            console.warn("AnalystAgent: Missing GEMINI_API_KEY. Returning offline state.");
            return {
                id: `offline-${Date.now()}`,
                type: 'PATTERN_RECOGNITION',
                severity: 'LOW',
                title: 'Cognitive Module Offline',
                description: "Deep Intelligence requires a neural link (API Key). Please configure system parameters.",
                relatedNodeIds: [],
                timestamp: Date.now()
            };
        }

        // Construct Prompt Data
        const systemData = {
            nodeCount: state.nodes.length,
            entropy: entropy.toFixed(2),
            members: members.map(m => `${m.role} (${m.name})`).join(', '),
            driftingNodes: state.nodes
                .filter(n => Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2) > 20) // Adjusted scale for d3-force
                .map(n => members.find(m => m.id === n.id)?.role || n.id)
                .join(', ')
        };

        const prompt = `
        ${COGNITIVE_OS_SYSTEM_PROMPT}

        SUBJECT DATA:
        ${JSON.stringify(systemData, null, 2)}

        TASK:
        Fill out the following template. Be concise but deep.
        ${DEEP_DIVE_TEMPLATE}

        Replace {{entropy}} with the actual value.
        Replace {{coherence_state}} with 'STABLE' or 'CRITICAL' based on entropy > 0.5.
        `;

        let content = "Analysis Unavailable (Signal Loss)";

        try {
            const result = await this.model.generateContent(prompt);
            content = result.response.text();
        } catch (e) {
            console.error("LLM Error:", e);
            content = "DEFRAG_OS::ERROR // COGNITIVE MODULE CONNECTION FAILED";
        }

        return {
            id: `deep-dive-${Date.now()}`,
            type: 'PATTERN_RECOGNITION',
            severity: 'HIGH',
            title: 'System Deep Scan',
            description: content, // The full markdown report
            relatedNodeIds: [], // Global
            timestamp: Date.now(),
            metrics: { entropy }
        };
    }
}
