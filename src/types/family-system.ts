
/**
 * Family System Engine - Data Contracts
 * Based on "Accuracy check and integration brief"
 */

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface UserState {
    t: string; // ISO timestamp
    vector: Vector3; // [-1, 1] Normalized position
    intensity: number; // [0, 1] Emotional/Systemic load
    giftScores: Vector3;
    shadowScores: Vector3;
    radius: number;
    archetypeWeights: Record<string, number>;
    flags: {
        orderLoop: boolean;
        chaosLoop: boolean;
        rotationEvent: boolean;
    };
    notes?: string; // Generated clinical/systemic description
}

export interface LineageMember {
    id: string;
    role: string; // e.g., "Mother", "Father"
    lifePath?: number;
    humanDesign?: string;
    vector?: Vector3; // [NEW] Position in the cube
    bioMetrics?: {
        birthDate: string;
        birthTime: string;
        birthLocation: string;
    };
    relationshipType?: 'close' | 'conflict' | 'distant' | 'cutoff'; // [NEW] Vector Type
    name?: string; // [NEW] Optional display name
}

export interface LineageProfile {
    lifePaths: Array<{ memberId: string; value: number }>;
    humanDesign: Array<{ memberId: string; type: string }>;
    relations: Array<{ sourceId: string; targetId: string; type: 'CONFLICT' | 'FUSION' | 'DISTANCE' | 'NEUTRAL' }>;
    priors: { orderScore: number; chaosScore: number };
    amplifiers: { lpMatch: boolean; reflectorPresent: boolean };
    biasVector: Vector3;
}

export interface AstrologyProfile {
    natal: {
        placements: Array<{ body: string; sign: string; degree: number }>;
        aspects: Array<{ a: string; b: string; type: string; orb: number }>;
    };
    transits: Array<{
        body: string;
        aspectTo?: string; // made optional
        type: string;
        orb?: number;
        start?: string;
        end?: string;
    }>;
    astroPrior: Vector3;
    transitGain: number; // Multiplier for intensity
}

export interface Intervention {
    trigger: string; // condition expression
    principle: 'UPR' | 'Acceptance' | 'Relationship' | 'Dialectics' | 'ZeroJargon';
    copyId: string;
    axisTargets: { x?: string; y?: string; z?: string };
    narrationCue?: string;
}

// --- Schema Evolution Model Types ---
export interface SchemaNode {
    id: string;
    content: string;
    affectWeight: number; // 0-1 emotional intensity
}

export interface SchemaEdge {
    sourceId: string;
    targetId: string;
    valence: 'positive' | 'negative' | 'neutral';
    strength: number; // 0-1
}

export interface SchemaObject {
    nodes: SchemaNode[];
    edges: SchemaEdge[];
    coherenceScore: number;
}

// --- Adaptive Depth Types ---
export enum PassLevel {
    DETECTION = 1,  // Surface scan
    MAPPING = 2,    // Build schema
    INTEGRATION = 3, // Cycle detection
    CALIBRATION = 4  // Full synthesis
}

// --- Mirror State Types ---
export enum MirrorState {
    CLEAR = "CLEAR",         // Aligned
    FOGGED = "FOGGED",       // Projecting
    CRACKED = "CRACKED"      // Trauma reflection
}
