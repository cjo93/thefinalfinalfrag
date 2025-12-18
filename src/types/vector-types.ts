
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface SimulationStats {
    nodeCount: number;
    iterations: number;
    maxVelocity: number;
    stabilityScore: number;
    timestamp: string;
}

export interface PhysicsState {
    nodes: any[];
    globalEntropy: number;
}
