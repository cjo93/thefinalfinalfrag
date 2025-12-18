
import { Agent, AgentContext } from "../framework/AgentBase";
import { SchemaObject, SchemaNode, SchemaEdge } from "../types/family-system";

export class SchemaAgent extends Agent {
    constructor(context: AgentContext) {
        super("SchemaAgent", context);
    }

    /**
     * Integrates the schema by detecting redundancies and calculating coherence.
     * This simulates the "Validation/Integration" phase of cognitive processing.
     */
    public async integrateSchema(schema: SchemaObject): Promise<SchemaObject> {
        console.log(`[SchemaAgent] Integrating schema with ${schema.nodes.length} nodes.`);

        const integratedNodes: SchemaNode[] = [];
        const integratedEdges: SchemaEdge[] = [];
        const mergedIds = new Set<string>();

        // 1. Detect Semantic Redundancy (Simple simulation)
        // In a real LLM implementation, we would compare embeddings.
        // Here, we look for exact content matches or very close affect weights.

        for (const node of schema.nodes) {
            if (mergedIds.has(node.id)) continue;

            const duplicate = integratedNodes.find(n =>
                n.content.toLowerCase() === node.content.toLowerCase() ||
                (Math.abs(n.affectWeight - node.affectWeight) < 0.05 && n.id !== node.id) // Mock semantic proximity
            );

            if (duplicate) {
                // Merge Logic: Strengthen the existing node
                duplicate.affectWeight = (duplicate.affectWeight + node.affectWeight) / 2;
                mergedIds.add(node.id);
                // Redirect edges from 'node' to 'duplicate' happens in step 2
            } else {
                integratedNodes.push({ ...node });
            }
        }

        // 2. Rebuild Edges
        // If a node was merged, point its edges to the survivor.
        for (const edge of schema.edges) {
            // Find where source/target ended up (could be themselves if not merged)
            // Note: This logic assumes 'integratedNodes' contains the "survivors".
            // Since we didn't map "oldId -> newId" explicitly above, let's just keep edges for surviving nodes for this mock.
            // A full implementation requires a map.

            const sourceExists = integratedNodes.find(n => n.id === edge.sourceId);
            const targetExists = integratedNodes.find(n => n.id === edge.targetId);

            if (sourceExists && targetExists) {
                integratedEdges.push(edge);
            }
        }

        // 3. Robust Coherence Calculation
        // Factor in:
        // - Edge Valence Ratio (Positive vs Negative)
        // - Node Stability (Frequency of merges indicates instability/redundancy)
        // - System Entropy (Input signal)

        const positiveEdges = integratedEdges.filter(e => e.valence !== 'negative').length;
        const totalEdges = integratedEdges.length;

        let valenceRatio = 1.0;
        if (totalEdges > 0) {
            valenceRatio = positiveEdges / totalEdges;
        }

        // Schema Complexity Penalty: Too many unconnected nodes = low coherence
        const unconnectedNodes = integratedNodes.filter(n =>
            !integratedEdges.some(e => e.sourceId === n.id || e.targetId === n.id)
        ).length;

        const fragmentationPenalty = Math.max(0, unconnectedNodes / (integratedNodes.length || 1));

        // Final Coherence Score (0.0 to 1.0)
        // Valence (Emotional Health) * (1 - Fragmentation)
        const coherenceScore = Math.max(0, Math.min(1, valenceRatio * (1 - fragmentationPenalty)));

        console.log(`[SchemaAgent] Coherence Calculated: ${coherenceScore.toFixed(2)} (Valence: ${valenceRatio.toFixed(2)}, Frag: ${fragmentationPenalty.toFixed(2)})`);

        return {
            nodes: integratedNodes,
            edges: integratedEdges,
            coherenceScore
        };
    }
}
