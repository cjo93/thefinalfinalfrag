
/**
 * Family System Vector Engine
 * Implements the core logic for calculating and updating user state within the relational geometry.
 * Based on "Accuracy check and integration brief".
 */

import { Vector3, UserState, LineageProfile, AstrologyProfile, Intervention } from '../types/family-system';
import { getIntervention } from '../content/principles';

// --- Constants & Config ---

const CONFIG = {
    // Normalization Factors (Personalized sensitivity stubs)
    Mx: 1.0, My: 1.0, Mz: 1.0,

    // Coupling & Blending
    ALPHA_BASE: 0.4,
    LAMBDA_USER: 0.7,
    LAMBDA_LINEAGE: 0.6, // Weight of lineage vs astro in prior blend
    LAMBDA_ASTRO: 0.4,

    // Softmax Sharpness for Archetypes
    BETA: 2.0,

    // Thresholds
    THETA_X: 0.4,
    THETA_Y: 0.4,
    THETA_Z: 0.4,
    LOOP_DURATION_MS: 180000, // 3 mins stub
};

// Fixed Archetype Coordinates (Poles)
const ARCHETYPES: Record<string, Vector3> = {
    'THE_PROTAGONIST': { x: 1, y: 1, z: 1 },  // Connection, Agency, Meaning
    'THE_ANCHOR': { x: 1, y: -0.5, z: 0.5 },
    'THE_DRIFTER': { x: 0, y: -1, z: -1 },
    'THE_GHOST': { x: -1, y: -1, z: 0 },
    'THE_CRUSADER': { x: -0.5, y: 1, z: -0.5 },
    'THE_MARTYR': { x: 1, y: -1, z: 1 },
    'THE_DESTROYER': { x: -1, y: 1, z: -1 }, // Hostility, Agency, Nihilism
};

// --- Math Helpers ---

const addVectors = (a: Vector3, b: Vector3): Vector3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const scaleVector = (v: Vector3, s: number): Vector3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const normVector = (v: Vector3): number => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
const distVector = (a: Vector3, b: Vector3): number => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));

const normalizeScores = (val: number): number => Math.max(-1, Math.min(1, val)); // Clamp -1 to 1

// --- Core Logic ---

/**
 * blendedPrior = λ_lineage * p_lineage + λ_astro * p_astro
 */
const blendPriors = (lineagePrior: Vector3, astroPrior: Vector3 = { x: 0, y: 0, z: 0 }): Vector3 => {
    // If no astro data, just return lineage
    if (astroPrior.x === 0 && astroPrior.y === 0 && astroPrior.z === 0) return lineagePrior;

    const pLineage = scaleVector(lineagePrior, CONFIG.LAMBDA_LINEAGE);
    const pAstro = scaleVector(astroPrior, CONFIG.LAMBDA_ASTRO);

    // Re-normalize sum to maintain magnitude similar to inputs
    // (Simplified blend)
    return addVectors(pLineage, pAstro);
};

/**
 * Calculates 'Gain' from active transits to amplify intensity.
 */
const calculateTransitGain = (profile?: AstrologyProfile): number => {
    if (!profile || !profile.transits) return 0;
    // Simple mock logic: Hard aspects to inner planets add gain
    let gain = 0;
    profile.transits.forEach(t => {
        if (['CONJUNCTION', 'SQUARE', 'OPPOSITION'].includes(t.type)) {
            if (['Sun', 'Moon', 'Mars', 'Saturn'].includes(t.body)) {
                gain += 0.15; // K_transit
            }
        }
    });
    return Math.min(gain, 1.0); // Cap gain
};

/**
 * Softmax over inverse distances to find nearest archetypes
 */
const calculateArchetypeWeights = (v: Vector3): Record<string, number> => {
    const weights: Record<string, number> = {};
    let sumExp = 0;

    // Calculate exponentials
    for (const [name, coord] of Object.entries(ARCHETYPES)) {
        const d = distVector(v, coord);
        // Inverse distance weighted by beta
        const weight = Math.exp(-CONFIG.BETA * d);
        weights[name] = weight;
        sumExp += weight;
    }

    // Normalize
    for (const name in weights) {
        weights[name] = weights[name] / sumExp;
    }

    return weights;
};

/**
 * Detects Order/Chaos loops based on vector state.
 * (Simplified snapshot version - real version would need history array)
 */
const detectLoops = (v: Vector3): { orderLoop: boolean; chaosLoop: boolean; rotationEvent: boolean } => {
    // Order Loop: High Agency (+Y), Low Connection (-X) -> Isolation
    const orderLoop = v.y > CONFIG.THETA_Y && v.x < -CONFIG.THETA_X;

    // Chaos Loop: Low Connection (-X), Low Meaning (-Z) -> Nihilism
    const chaosLoop = v.x < -CONFIG.THETA_X && v.z < -CONFIG.THETA_Z;

    return { orderLoop, chaosLoop, rotationEvent: false };
};

export class VectorEngine {

    static updateState(
        inputVector: Vector3,
        profile: LineageProfile,
        astro?: AstrologyProfile,
        currentIntensity: number = 0.5
    ): UserState {
        // 1. Blend Priors
        const pPrior = blendPriors(profile.biasVector, astro?.astroPrior);

        // 2. Calculate Baseline Vector (b)
        // b = λ_user * u + (1 - λ_user) * p_prior
        const userPart = scaleVector(inputVector, CONFIG.LAMBDA_USER);
        const priorPart = scaleVector(pPrior, 1 - CONFIG.LAMBDA_USER);
        const b = addVectors(userPart, priorPart);

        // 3. Intensity Scaling
        // alpha = α_base * (1 + transitGain)
        const alpha = CONFIG.ALPHA_BASE * (1 + calculateTransitGain(astro));

        // v = b * (1 + alpha * I) -> Emotion amplifies vector magnitude
        const magnitudeScale = 1 + alpha * currentIntensity;
        const v = scaleVector(b, magnitudeScale);

        // Clamp to [-1, 1] Box for safety (though magnitude can exceed 1 slightly, coordinates shouldn't drift too far)
        v.x = normalizeScores(v.x);
        v.y = normalizeScores(v.y);
        v.z = normalizeScores(v.z);

        // 4. Analysis
        const scores = {
            gift: {
                x: Math.max(0, v.x),
                y: Math.max(0, v.y),
                z: Math.max(0, v.z)
            },
            shadow: {
                x: Math.min(0, v.x),
                y: Math.min(0, v.y),
                z: Math.min(0, v.z)
            }
        };

        const flags = detectLoops(v);
        const archetypeWeights = calculateArchetypeWeights(v);

        // 5. Narrative Generation
        const primaryArchetype = Object.entries(archetypeWeights).reduce((a, b) => a[1] > b[1] ? a : b)[0];

        // Use Clinical Principles based on vector state
        const intervention = getIntervention({ ...v, intensity: currentIntensity });

        const notes = `Target: ${primaryArchetype}. ${intervention} ${flags.orderLoop ? "[ORDER TRAP]" : ""} ${flags.chaosLoop ? "[CHAOS TRAP]" : ""}`;

        return {
            t: new Date().toISOString(),
            vector: v,
            intensity: currentIntensity, // Input intensity passed through or updated
            giftScores: scores.gift,
            shadowScores: scores.shadow,
            radius: normVector(v),
            archetypeWeights,
            flags,
            notes
        };
    }
}
