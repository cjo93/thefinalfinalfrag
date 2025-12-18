import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Types ---
interface BriefingInput {
    userId: string;
    classification: string;
    rmssd?: number;
    baseline?: number;
    family_patterns?: string[];
    integration_score?: number;
}

// Initialize Gemini (In real app, Jules might inject this)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- Tool: generateFreeBriefing ---
export const generateFreeBriefing = async (input: BriefingInput) => {
    const { classification } = input;

    const templates: Record<string, string> = {
        excellent_recovery: "Your nervous system is in excellent recovery mode. You are primed for deep work and connection today. Capitalize on this resonance.",
        baseline: "Your nervous system is at baseline. You have a solid foundation for today's challenges. Maintain your rhythm.",
        mild_stress: "Your nervous system is activated but manageable. Prioritize grounding practices. A 5-minute coherence session is recommended.",
        significant_stress: "Your nervous system is significantly activated. Focus entirely on recovery. Reduce load where possible."
    };

    const text = templates[classification] || templates['baseline'];

    return { text, tier: 'free', cost: 0 };
};

// --- Tool: generateProBriefing ---
export const generateProBriefing = async (input: BriefingInput) => {
    const { userId, rmssd, baseline, classification, family_patterns, integration_score } = input;

    // Cache key construction (concept)
    // const cacheKey = JSON.stringify({ rmssd, baseline, classification });
    // In Jules, caching is handled by the framework/model layer natively (?)
    // We'll proceed with the generation call.

    const prompt = `
     You are a warmth-focused family systems therapist. Create a personalized, encouraging daily briefing.

     User data:
     - HRV: ${rmssd}ms (baseline: ${baseline}ms)
     - Classification: ${classification}
     - Family patterns being worked with: ${family_patterns?.join(', ') || 'None'}
     - Integration score: ${integration_score || 0} (0-1)

     Write 2-3 warm, encouraging paragraphs that:
     1. Acknowledge their HRV state with nuance
     2. Connect to one family pattern they're working with
     3. Suggest one micro-practice (2-5 minutes) aligned to their state

     Tone: Warm, non-alarmist, empowering. Use "pattern," "dynamic," "inherited" not "broken" or "toxic."
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Estimate tokens (Mock)
        const tokens = text.length / 4;
        const cost = tokens * 0.0001; // Mock rate

        return { text, tier: 'pro', cost, cacheHit: false }; // Assuming no cache hit in manual implementation
    } catch (error) {
        console.error('Gemini Config Error:', error);
        return generateFreeBriefing(input); // Fallback
    }
};

// --- Tool: generatePremiumBriefing ---
export const generatePremiumBriefing = async (input: BriefingInput) => {
    // Similar to Pro but more elaborate prompt
    const result = await generateProBriefing(input);
    return { ...result, tier: 'premium' }; // Just mocking the tier difference for now
};

// --- Tool: storeBriefing ---
export const storeBriefing = async (input: {
    userId: string;
    briefingText: string;
    tier: string;
    cacheHit?: boolean
}) => {
    const { userId, briefingText, tier, cacheHit } = input;
    const dateStr = new Date().toISOString().split('T')[0];

    const docRef = collections.users.doc(userId).collection('briefings').doc(dateStr);

    await docRef.set({
        date: Timestamp.now(),
        generated_text: briefingText,
        tier,
        cache_hit: !!cacheHit,
        created_at: Timestamp.now()
    });

    return { success: true, path: docRef.path };
};

// --- Tool: trackCost ---
export const trackCost = async (input: { tier: string, tokens_used?: number, cacheHit?: boolean }) => {
    // Implementation similar to HRV trackCost
    collections.costTracking.add({
        operation: 'generate_briefing',
        tier: input.tier,
        timestamp: Timestamp.now()
    }).catch(console.error);
    return { success: true };
};
