import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';

export interface BioMetricProfile {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    designType?: string; // e.g. "Projector 2/4"
    enneagram?: string; // e.g. "5w4"
    geneKeys?: string[]; // e.g. ["24", "61"]
}

export interface DefragAnalysis {
    system_status: 'OPTIMAL' | 'RECALIBRATING' | 'ANALYZING';
    integrity_score: number; // 0-100
    headline: string; // Engaging, magazine-style title
    narrative: string; // Main analysis

    // Educational Component
    daily_lesson: {
        topic: string; // e.g. "The Art of Waiting (Projector Strategy)"
        content: string; // 2-3 sentences explaining the 'WHY' behind their type/specs
        visual_symbol: 'SPIRAL' | 'TUNNEL' | 'LATTICE' | 'WEB' | 'MANDALA'; // Drives the Bressloff-Cowan visualizer
        knowledge_key?: string; // Links to Deep Dive Knowledge Base
        day?: number;
        phase?: string;
    };

    protocol: string; // Actionable task

    // Refined Relational Geometry (Clinical/Architectural)
    relational_geometry: {
        architecture: string;   // Structural description (e.g. "Distanced Triangulation")
        tension_node: string;   // Where the stress is (e.g. "Misalignment of Mental Expectations")
        resolution: string;     // The fix (e.g. "Differentiation of Self")
    };
    audio_url?: string; // ElevenLabs audio overview
    forecast?: {
        date: string;
        title: string;
        description: string;
        intensity: number;
        type: string;
    }[];
}

// High-Fidelity Mock Data for Fallback/Demo (Aligned with Bressloff/Cowan + Jung Framework)
const MOCK_ANALYSIS: DefragAnalysis = {
    system_status: 'ANALYZING',
    integrity_score: 87,
    headline: "The Spiral and the Shadow: A Bifurcation Point",
    narrative: "The form constant emerging in your current state is the **spiral**—the geometry of emotional processing, cyclical return, and recursive depth. Your Sun in Gate 57 (The Gentle) creates an acoustic frequency that hears truth before it speaks. This is not intuition in the colloquial sense; it is pattern recognition operating below conscious threshold, a V1 cortical resonance that detects dissonance in tone, timing, and micro-expression.\n\nThe unintegrated archetype creating friction is the **Wise Old Man/Woman shadowed into the Critic**. You possess genuine insight, but the shadow form weaponizes it—turning perception into judgment, awareness into anxiety. The pattern manifests as over-analysis: running logical loops on intuitive data, a bifurcation where the system oscillates between knowing and doubting.\n\nRecalibration requires a phase transition: from spiral (endless return) to **mandala** (centered integration). The conscious action is deceptively simple—stop explaining your insights. When you explain, you invite debate. When you simply know, you create magnetic authority. Today's individuation work: practice silence as a form of communication.",
    daily_lesson: {
        topic: "Gate 57: The Geometry of Necessity",
        content: "This gate represents the bifurcation point between instinct and intellect. When the wave function collapses, trust the first signal—before the mind can introduce noise.",
        visual_symbol: 'SPIRAL' // Maps to SPIRAL form constant
    },
    protocol: "Pattern Interrupt Protocol: When you feel the urge to explain or justify an intuitive knowing, physically pause. Place your hand on your solar plexus. Count to three. If the knowing persists without words, it is signal. If it requires justification, it is noise. Proceed accordingly.",
    relational_geometry: {
        architecture: "Enmeshed Web",
        tension_node: "Over-identification with Other's emotional states",
        resolution: "Differentiate Self: Your awareness is not responsibility. Observation ≠ Obligation."
    }
};

/**
 * Generates the "Daily Defrag" analysis by calling the backend API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateDefragAnalysis = async (profile: BioMetricProfile, members: any[] = []): Promise<DefragAnalysis> => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.ANALYZE, { state: profile, members: members });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Backend Analysis Failed (Falling back to Simulation Mode):", error);
        // Fail-safe: Return high-fidelity mock data if backend is offline or errors
        return MOCK_ANALYSIS;
    }
};