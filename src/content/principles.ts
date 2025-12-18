
/**
 * Clinical Content Deck
 * Principles for Systemic Intervention & Narrative Generation.
 *
 * "The map is not the territory." - Alfred Korzybski
 */

export const PRINCIPLES = {
    UPR: {
        id: 'unconditional_positive_regard',
        trigger: 'shame_spiral', // When intensity is high (~1.0) but agency is low (-Y)
        copy: [
            "Your defenses are intelligent. They saved you once.",
            "There is no part of this system that is a mistake.",
            "You are doing the best you can with the data you have.",
            "Honor the survival strategy before asking it to change."
        ]
    },
    DIALECTICS: {
        id: 'dialectics',
        trigger: 'polarization', // When stuck on an axis extreme
        copy: [
            "You can be furious and loving at the same time.",
            "This is not an 'either/or' problem. It is a 'both/and' reality.",
            "Acceptance does not mean approval. It means acknowledging what is.",
            "The opposite of your truth is also true in this system."
        ]
    },
    ACCEPTANCE: {
        id: 'radical_acceptance',
        trigger: 'chaos_loop', // Low Meaning (-Z) + Low Connection (-X)
        copy: [
            "Stop fighting reality. It always wins.",
            "Pain is inevitable. Suffering is optional.",
            "Turn your mind towards what is actually happening right now.",
            "This moment is the only one you have to work with."
        ]
    },
    NON_JUDGMENT: {
        id: 'zero_jargon',
        trigger: 'intellectualization', // High Meaning (+Z) + Low Emotion
        copy: [
            "Drop the analysis. Feel the sensation.",
            "Naming the pattern is not the same as changing it.",
            "Where do you feel this in your body?",
            "Notice the urge to explain away the pain."
        ]
    }
};

export const getIntervention = (state: { x: number, y: number, z: number, intensity: number }): string => {
    // 1. High Intensity + Low Agency = UPR / Shame Work
    if (state.intensity > 0.7 && state.y < -0.3) {
        return getRandom(PRINCIPLES.UPR.copy);
    }

    // 2. High Polarization (Any axis > 0.8) = Dialectics
    if (Math.abs(state.x) > 0.8 || Math.abs(state.y) > 0.8 || Math.abs(state.z) > 0.8) {
        return getRandom(PRINCIPLES.DIALECTICS.copy);
    }

    // 3. Chaos Loop (Low X, Low Z) = Acceptance
    if (state.x < -0.3 && state.z < -0.3) {
        return getRandom(PRINCIPLES.ACCEPTANCE.copy);
    }

    // 4. Intellectualization (High Z, Low Intensity)
    if (state.z > 0.5 && state.intensity < 0.3) {
        return getRandom(PRINCIPLES.NON_JUDGMENT.copy);
    }

    // Default
    return "Observe the vector. Notice where it pulls you.";
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
