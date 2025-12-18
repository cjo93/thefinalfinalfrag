
/**
 * Cognitive Geometry & Sensory Surfaces
 * Types for the Consciousness Cube, Emotion Cone, and Mandala Card pipelines.
 */

// --- 1. CONSCIOUSNESS CUBE ---

export interface CubeCoordinates {
    x: number; // Love (1.0) <-> Hate (-1.0)
    y: number; // High Energy (1.0) <-> Low Energy (-1.0)
    z: number; // High Meaning (1.0) <-> Low Meaning/Nihilism (-1.0)
}

export type RiskLevel = 'STABLE' | 'DRIFT' | 'CRITICAL' | 'FRAGMENTED';

export interface CubeNode {
    id: string; // e.g., "THE_CRUSADER"
    label: string; // Display name
    position: CubeCoordinates;
    archetype: string; // Jungian archetype reference
    color: string; // Hex code
    riskAssessment: RiskLevel;
    interventions: string[]; // Recommended actions e.g., "Grounding breath", "Seek social contact"
}

export interface CubeState {
    currentPosition: CubeCoordinates;
    nearestNode: CubeNode;
    driftVectors: CubeNode[]; // Neighboring nodes representing potential drift
    lastUpdated: string; // ISO Date
}

// --- 2. EMOTION CONE (Plutchik Model) ---

export interface ConeVector {
    angle: number; // 0-360 degrees (Sector)
    intensity: number; // 0.0 (Center/Calm) -> 1.0 (Edge/Intense)
}

export interface EmotionState {
    vector: ConeVector;
    arousalIndex: number; // Derived from HRV
    valenceEstimate: number; // Derived from Text/Tonal analysis (-1.0 to 1.0)
    primaryEmotion: string; // e.g., "Rage", "Terror", "Ecstasy"
    secondaryChart: string[]; // Adjacent mix, e.g., "Contempt" (Anger + Disgust)
    safetyFlags: string[]; // e.g., "HIGH_AROUSAL_NEGATIVE_VALENCE"
}

// --- 3. MANDALA CARD PIPELINE ---

// Expanded Natal Data for detailed visual construction
export interface NatalBlueprint {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    // Radial Axes for visual mapping (0-360 degrees)
    sunAngle: number;
    moonAngle: number;
    ascendantAngle: number;
    // Human Design or other overlay keys
    humanDesignType?: string;
    profile?: string; // e.g., "Reflector 4/6"
}

export interface TransitData {
    aspects: string[]; // e.g., ["Sun Square Mars", "Venus Trine Pluto"]
    activePlanets: string[]; // Planets currently forming major aspects
}

export interface SymmetryProfile {
    radialSegments: number; // e.g., 12 (Zodiac) or 24
    dominantAxes: number;
    colorScheme: 'MONOCHROME' | 'DUAL_TENSION' | 'PRISMATIC_FADE';
    style: 'DEFRAG_OS' | 'SACRED_GEO' | 'CYBER_NOIR';
}

export interface MandalaGenerationInput {
    userId: string;
    natalData: NatalBlueprint;
    currentTransits: TransitData;
    cubeState: CubeState;
    emotionState: EmotionState;
    intention?: string; // Optional user-supplied focus
}

export interface MandalaArtifact {
    id: string;
    userId: string;
    imageUrl: string;
    highResUrl?: string;
    timestamp: string; // ISO Date

    // Inputs preserved for reproducibility
    natalChart: NatalBlueprint;
    currentTransits: TransitData;
    cubeState: { position: CubeCoordinates; label: string };
    emotionVector: ConeVector;

    symmetryProfile: SymmetryProfile;

    // Generation Metadata
    prompt: string; // The exact prompt used
    interpretation: string; // Human readable synthesis
    generationParams: {
        model: string; // e.g., "stable-diffusion-xl-refiner"
        seed: number;
        guidanceScale: number;
        steps: number;
    };

    safetyStatus: 'PASS' | 'FLAGGED' | 'BLOCKED';
}

// --- API REQ/RES INTERFACES ---

export interface LocateCubeRequest {
    hrvMetrics: {
        rmssd: number;
        sdnn: number;
    };
    selfReport?: {
        mood: number; // 1-10
        energy: number; // 1-10
    };
}

export interface LocateCubeResponse {
    state: CubeState;
}

export interface VectorizeEmotionRequest {
    hrvIndex: number;
    textSentiment?: number;
    recentLogs?: string[];
}

export interface VectorizeEmotionResponse {
    state: EmotionState;
}
