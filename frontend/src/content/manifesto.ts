
/**
 * DEFRAG_OS
 * Central Manifesto & Content Repository
 */

export interface SectionContent {
    id: string;
    title: string;
    shortTitle: string;
    stage: string; // e.g., "Stage 01"
    descriptor: string; // e.g., "Identification"
    headline: string;
    body: string;
    buttonText: string;
    visualLabel: string; // e.g., "FIG.01: SIGNAL NOISE"
}

export interface PricingPlan {
    name: string;
    price: string;
    tagline: string; // e.g., "PASSIVE AWARENESS"
    emotionalDesc: string;
    technicalDesc: string;
    features: string[];
    recommended?: boolean;
    tierId: 'ACCESS_SIGNAL' | 'HELIX_PROTOCOL' | 'ARCHITECT_NODE';
}

export const MANIFESTO = {
    meta: {
        version: "SYS_VER.2.4.1",
        status: "OPERATIONAL",
        tagline: "Spectral Architecture • Coherent Light",
        subtext: "Refract your reality. Align the dispersed spectrum of the self."
    },
    sections: [
        {
            id: 'memory',
            title: 'I. Scatter',
            shortTitle: 'Scatter',
            stage: 'Stage 01',
            descriptor: 'Diffraction',
            headline: 'SCATTER',
            body: "Anxiety is spectral scatter. Your consciousness is a coherent beam of light striking the 'dirty lens' of conditioning. The result isn't a defect—it's diffraction. The signal disperses into noise, anxiety, and static. We do not suppress the noise; we clean the lens.",
            buttonText: 'Analyze Spectrum',
            visualLabel: 'FIG.01: CHROMATIC ABERRATION'
        },
        {
            id: 'trust',
            title: 'II. Distortion',
            shortTitle: 'Distortion',
            stage: 'Stage 02',
            descriptor: 'Refraction',
            headline: 'DISTORTION',
            body: "Trauma changes the refractive index of your psyche. Like light bending through water, your perception of 'safety' and 'danger' shifts, creating optical illusions in your relationships. We map these refractive errors, allowing you to see the object, not just the bent image.",
            buttonText: 'Correct Optics',
            visualLabel: 'FIG.02: REFRACTIVE INDEX'
        },
        {
            id: 'neural',
            title: 'III. Interference',
            shortTitle: 'Interference',
            stage: 'Stage 03',
            descriptor: 'Topology',
            headline: 'INTERFERENCE',
            body: "Relationships are wave mechanics. When two signals meet, they either amplify (constructive interference) or cancel out (destructive interference). You aren't 'bad at love'; you are trapped in a destructive interference pattern. We map the wave-forms to locate the node of silence.",
            buttonText: 'Map Waveforms',
            visualLabel: 'FIG.03: WAVE TOPOLOGY'
        },
        {
            id: 'ethos',
            title: 'IV. Synthesis',
            shortTitle: 'Synthesis',
            stage: 'Stage 04',
            descriptor: 'Coherence',
            headline: 'SYNTHESIS',
            body: "We don't just stack modalities. We merge the wavelengths of Human Design, Gene Keys, Numerology, and Astrology into a single, laser-focused beam. This is the defragmentation of the psyche: identifying every scattered fragment of potential and aligning them into a state of perfect temporal coherence.",
            buttonText: 'Initiate Fusion',
            visualLabel: 'FIG.04: LASER COHERENCE'
        }
    ] as SectionContent[],
    pricing: [
        {
            name: 'Observer',
            price: '0',
            tierId: 'ACCESS_SIGNAL',
            tagline: 'PASSIVE REFLECTION',
            emotionalDesc: "Observe the light. See where your spectrum is hitting the wall.",
            technicalDesc: "Basic surface-level spectral analysis.",
            features: [
                'Daily Light Forecast',
                'Spectrum Overview',
                'Public Archives'
            ]
        },
        {
            name: 'Operator',
            price: '19',
            tierId: 'HELIX_PROTOCOL',
            tagline: 'ACTIVE ALIGNMENT',
            recommended: true,
            emotionalDesc: "Clean the lens. Sharpen the image of who you actually are.",
            technicalDesc: "Daily calibration to reduce signal noise.",
            features: [
                'Daily Refractive Correction',
                'Transit Spectroscopy',
                'Human Design Alignment',
                'Coherence Protocols'
            ]
        },
        {
            name: 'Architect',
            price: '99',
            tierId: 'ARCHITECT_NODE',
            tagline: 'HIGH COHERENCE',
            emotionalDesc: "Burn through the illusion. High-intensity structural mapping.",
            technicalDesc: "Full-spectrum relational and causal topology.",
            features: [
                'Relational Interference Mapping',
                'Family System Genogram',
                '1:1 Optical Tuning',
                'Composite Waveform Access'
            ]
        }
    ] as PricingPlan[]
};
