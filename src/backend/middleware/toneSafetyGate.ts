/**
 * REPLACEMENT DICTIONARY (Node D "Rosetta Stone")
 * Maps clinical/mystical terms to structural/geometric terms to ensure "Antigravity" tone.
 */
const TONE_MAP: Record<string, string> = {
    "trauma": "legacy load",
    "healing": "integration",
    "anxiety": "high-frequency resonance",
    "depression": "low-velocity state",
    "chakra": "energy center",
    "aura": "field projection",
    "spirit": "animating force",
    "soul": "core metrics",
    "karma": "causal sequence",
    "happy": "optimal flow",
    "sad": "signal dampening"
    // Add more per Node D specs
};

const BANNED_TERMS = [
    "cure", "heal", "treat", "diagnose", "doctor", "physician", "prescription"
];

export const applyToneGate = (text: string): string => {
    let cleaned = text;

    // 1. Replacement
    Object.entries(TONE_MAP).forEach(([trigger, replacement]) => {
        const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
        cleaned = cleaned.replace(regex, replacement);
    });

    // 2. Safety / Banned Check (Redaction)
    BANNED_TERMS.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        cleaned = cleaned.replace(regex, "[REDACTED]");
    });

    return cleaned;
};
