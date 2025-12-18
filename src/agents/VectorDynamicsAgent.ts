import { Agent, AgentContext } from "../framework/AgentBase";
import { Vector3, PhysicsState, SimulationStats } from "../types/vector-types";

interface Node {
    id: string;
    position: Vector3;
    velocity: Vector3;
    mass: number;
    type: 'SELF' | 'FAMILY' | 'COSMIC';
    relationshipType?: 'close' | 'conflict' | 'distant' | 'cutoff';
}

export class VectorDynamicsAgent extends Agent {
    private nodes: Node[] = [];
    private fieldStrength: number = 0.5;

    constructor(context: AgentContext) {
        super("VectorDynamicsAgent", context);
    }

    /**
     * Spawns a mock population for stress testing
     */
    async simulatePopulation(size: number): Promise<void> {
        this.nodes = [];

        // Always add SELF at origin
        this.nodes.push({
            id: 'SELF',
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            mass: 10,
            type: 'SELF'
        });

        const types = ['close', 'conflict', 'distant', 'cutoff'] as const;

        for (let i = 0; i < size; i++) {
            this.nodes.push({
                id: `node_${i}`,
                position: {
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10,
                    z: (Math.random() - 0.5) * 10
                },
                velocity: { x: 0, y: 0, z: 0 },
                mass: 1 + Math.random(),
                type: 'FAMILY',
                relationshipType: types[Math.floor(Math.random() * types.length)]
            });
        }

        console.log(`[VectorAgent] Spawned ${size} nodes.`);
    }

    /**
     * Run a physics simulation loop (N iterations)
     */
    async runPhysicsLoop(iterations: number): Promise<SimulationStats> {
        let maxVelocity = 0;
        let stabilityScore = 1.0;
        let collisions = 0;

        for (let step = 0; step < iterations; step++) {
            // Reset max velocity for this step
            let stepMaxVel = 0;

            // Apply Forces
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                if (node.type === 'SELF') continue; // Static center

                // 1. Attraction to Center (Gravity)
                // F = -k * x
                const distSq = node.position.x ** 2 + node.position.y ** 2 + node.position.z ** 2;
                const dist = Math.sqrt(distSq);

                // Avoid singularity
                if (dist < 0.1) continue;

                const gravityStrength = 0.05 * this.fieldStrength;

                // Repulsion close range, Attraction long range
                let forceMagnitude = 0;
                if (dist < 2) {
                    forceMagnitude = 0.5; // Push away
                } else {
                    forceMagnitude = -gravityStrength; // Pull in
                }

                // Relationship Logic mod
                if (node.relationshipType === 'conflict') forceMagnitude *= 2.0; // High tension
                if (node.relationshipType === 'distant') forceMagnitude *= 0.1; // Weak pull

                // Apply updates
                const dir = { x: node.position.x / dist, y: node.position.y / dist, z: node.position.z / dist };

                node.velocity.x += dir.x * forceMagnitude;
                node.velocity.y += dir.y * forceMagnitude;
                node.velocity.z += dir.z * forceMagnitude;

                // Damping
                node.velocity.x *= 0.95;
                node.velocity.y *= 0.95;
                node.velocity.z *= 0.95;

                // Update Pos
                node.position.x += node.velocity.x;
                node.position.y += node.velocity.y;
                node.position.z += node.velocity.z;

                // Stats
                const velMag = Math.sqrt(node.velocity.x ** 2 + node.velocity.y ** 2 + node.velocity.z ** 2);
                if (velMag > stepMaxVel) stepMaxVel = velMag;
            }
            if (stepMaxVel > maxVelocity) maxVelocity = stepMaxVel;
        }

        // Final Stability Check relative to "Chaos"
        stabilityScore = Math.max(0, 1.0 - (maxVelocity / 2.0));

        return {
            nodeCount: this.nodes.length,
            iterations,
            maxVelocity,
            stabilityScore,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get the current cosmic state vector for frontend visualization
     */
    getCosmicState(): any {
        // [MOCK] Return dynamic entropy for the frontend visualizers
        return {
            entropy: 1 - Math.random() * 0.1,
            fieldStrength: this.fieldStrength,
            vectorMap: this.nodes.map(n => ({ id: n.id, pos: n.position }))
        };
    }
}
