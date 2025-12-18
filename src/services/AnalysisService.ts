
import { GoogleGenerativeAI } from '@google/generative-ai';
import { astronomyService } from './astronomy';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export interface AnalysisContext {
    userId: string;
    day: number;
    phase: string;
    topic: string;
    curriculumContent: string;
    vectorState: any; // { order_chaos, control_isolation, etc }
    astrology?: any;
}

export class AnalysisService {

    private model: any;

    constructor() {
        // Use flash for speed, or pro for depth.
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    /**
     * Synthesizes a personalized "Logic Core" analysis by merging the static curriculum
     * with dynamic user vectors and live astrological data.
     */
    async generateInsight(context: AnalysisContext) {
        try {
            // 1. Fetch Real Astro Data if not provided (Live Transits)
            let astroNarrative = "Planetary resonance is nominal.";
            try {
                // T0-2: Use Ground Truth Service
                astroNarrative = await astronomyService.getGroundTruthString(new Date());
            } catch (e) {
                console.warn("Astro fetch failed in AnalysisService", e);
            }

            // 2. Construct Hyper-Personalized Prompt
            const prompt = `
            ROLE: You are the DEFRAG OS CORE, a clinical, mystical, and high-tech AI analyzing a human "bio-unit" processing a 30-day psychological defragmentation protocol.

            CONTEXT:
            - User Day: ${context.day} / 30
            - Phase: ${context.phase}
            - Today's Curriculum Topic: "${context.topic}"
            - Base Content: "${context.curriculumContent}"

            - USER VECTOR STATE (Internal Psychological Geometry):
              ${JSON.stringify(context.vectorState || "No vector data - assume baseline")}

            - COSMIC WEATHER:
              ${astroNarrative}

            TASK:
            Generate a personalized "Daily Insight" JSON payload that adapts the base content to the user's specific vector state and cosmic weather.

            TONE:
            Cyber-Jungian, Analytical, Emotive, Direct. Use terms like "Latency," "Bandwidth," "Archetype," "Recursive," "Signal."

            OUTPUT JSON SCHEMA (Strict):
            {
                "headline": "Short, punchy magazine-style title (max 6 words)",
                "narrative": "3-4 sentences synthesizing the vector state with the topic. Explain WHY this topic is critical for them right now.",
                "action_adaptation": "A specific adaptation of the protocol action item suitable for their current state.",
                "integrity_score": 85 (integer 60-99 based on vector alignment)
            }
            `;

            // 3. Execute
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const responseText = result.response.text();

            return JSON.parse(responseText);

        } catch (error) {
            console.error("Gemini Analysis Failed:", error);
            // Fallback to static content if AI fails
            return {
                headline: context.topic.toUpperCase(),
                narrative: context.curriculumContent,
                action_adaptation: "Proceed with standard protocol.",
                integrity_score: 85
            };
        }
    }
}

export const analysisService = new AnalysisService();
