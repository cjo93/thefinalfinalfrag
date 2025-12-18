import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import {
    MandalaGenerationInput,
    NatalBlueprint,
    TransitData,
    CubeState,
    EmotionState
} from '../types/geometry';

/**
 * MandalaAgent
 * Logic for constructing the Visual and Conceptual prompt for the generative Mandala.
 */

export const buildMandalaPrompt = (
    natalChart: NatalBlueprint,
    transits: TransitData,
    cubeState: CubeState,
    emotionVector: EmotionState['vector'],
    symmetryProfile: { radialSegments: number; dominantAxes: number; colorScheme: string; style: string } = {
        radialSegments: 12,
        dominantAxes: 4,
        colorScheme: 'MONOCHROME',
        style: 'DEFRAG_OS'
    }
): string => {

    // 1. Structure & Symmetry (Base Layer)
    const structure = `Subject: A perfectly symmetric radial mandala.Structure: ${symmetryProfile.radialSegments} -fold radial symmetry representing the Zodiac.style: ${symmetryProfile.style}, technical drawing, architectural blueprint aesthetic.Background: Infinite black continuum.`;

    // 2. Core Identity (Center)
    // Explicitly encoding Sun/Moon/Ascendant into the geometry
    const centerLayer = `Center Core: A precise geometric glyph synthesizing ${natalChart.sunSign} Sun(radiant), ${natalChart.moonSign} Moon(reflective), and ${natalChart.risingSign} Ascendant(directional).No text, no faces, pure abstract geometry.`;

    // 3. Natal Ring (Middle Layer)
    // Encoding the fixed nature of the birth chart
    const natalLayer = `Middle Ring: A static, crystalline lattice representing the Natal Chart.${symmetryProfile.dominantAxes} dominant axes anchoring the structure.Heavy, permanent lines.`;

    // 4. Current Transits (Outer Ring)
    // Dynamic, glowing, influential elements
    const activeAspects = transits.activePlanets.slice(0, 3).join(' and '); // Limit to top 3 for clarity
    const transitLayer = transits.activePlanets.length > 0
        ? `Outer Ring: Dynamic, glowing nodes representing active transits(${activeAspects}).Connected to the center by thin, luminous data streams.High contrast against the black void.`
        : `Outer Ring: A calm, unbroken void ring representing a lack of turbulence.`;

    // 5. Aesthetic & Emotional Texture
    // Mapping Emotion Vector to Visuals
    const intensity = emotionVector.intensity;
    // Monochrome base is a hard constraint, we only tint the "Energy"
    const basePalette = "Monochrome, Grayscale, Silver on Black";
    const accentColor = intensity > 0.6 ? (cubeState.nearestNode.color || "Electric Red") : "Pale Blue";
    const tension = intensity > 0.5 ? "jagged interference patterns, high visual tension" : "smooth gradients, harmonious balance";

    const aesthetic = `Aesthetic: DEFRAG OS style.Minimal, precise, vector lines. 8k resolution.Lighting: Volumetric rim lighting.Color Palette: ${basePalette} with sparse ${accentColor} accents for active nodes.Texture: ${tension}.`;

    // 6. Conceptual Anchor
    const concept = `Concept: The archetype of "${cubeState.nearestNode.label}" manifested as geometry.`;

    // Final Assembly with strong negative constraints
    return `
        ${structure}
        ${centerLayer}
        ${natalLayer}
        ${transitLayer}
        ${aesthetic}
        ${concept}
--no text, --no letters, --no faces, --no organic curves, --no blur, --no watermark.
    `.trim().replace(/\s+/g, ' ');
};

/**
 * Generate Mandala via Backend API
 * Connects to the python /api/mandala/generate endpoint
 */
export const generateMandala = async (input: MandalaGenerationInput) => {
    try {
        console.log("Requesting Mandala Generation:", input);

        const response = await apiClient.post(API_ENDPOINTS.MANDALA_GENERATE, input);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Mandala generation failed');
        }

        const data = await response.json();
        return {
            prompt: data.prompt,
            imageUrl: data.imageUrl,
            timestamp: data.timestamp
        };

    } catch (e) {
        console.error("Mandala API Error:", e);
        // Fallback for demo if API fails
        return {
            prompt: "FALLBACK: NETWORK_ERROR // CONNECTION_LOST",
            imageUrl: "https://replicate.delivery/pbxt/MockMandalaImageUUID/mandala.png",
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * @deprecated Use generateMandala instead
 */
export const simulateMandalaGeneration = generateMandala;
