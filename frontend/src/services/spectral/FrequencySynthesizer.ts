
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BioMetricFrequency, SpectralSnapshot } from '../../types/spectral';

// --- MOCK ADAPTERS (In a real app, these would parse actual astrological/HD data) ---

const normalizeAstrology = (planet: string, sign: string): BioMetricFrequency => {
    // Simplified logic: Fire/Air = High Amp, Water/Earth = Low Amp
    const highEnergy = ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'];
    const intensity = highEnergy.includes(sign) ? 0.85 : 0.45;

    return {
        id: `ASTRO_${planet.toUpperCase()}`,
        system: 'ASTROLOGY',
        amplitude: intensity,
        wavelength: ['Mars', 'Sun', 'Pluto'].includes(planet) ? 'RED'
            : ['Mercury', 'Uranus'].includes(planet) ? 'INDIGO'
                : 'BLUE',
        resonance: `${planet} in ${sign} creates a ${highEnergy.includes(sign) ? 'dynamic' : 'grounded'} influence.`,
        interferencePattern: 'NEUTRAL'
    };
};

const normalizeHumanDesign = (gate: string, center: string, defined: boolean): BioMetricFrequency => {
    return {
        id: `HD_GATE_${gate}`,
        system: 'HUMAN_DESIGN',
        amplitude: defined ? 0.9 : 0.2, // Defined centers are high amplitude sources
        wavelength: center === 'Solar Plexus' ? 'RED'
            : center === 'Ajna' ? 'INDIGO'
                : center === 'Throat' ? 'BLUE'
                    : 'GREEN',
        resonance: `Gate ${gate} in ${center} is ${defined ? 'broadcasting' : 'receiving'}.`,
        interferencePattern: defined ? 'CONSTRUCTIVE' : 'DESTRUCTIVE'
    };
};

// --- SYNTHESIZER SERVICE ---

export class FrequencySynthesizer {

    /**
     * Synthesizes multiple backend data points into a cohesive Spectral Snapshot.
     * This mimics the 'Fusion' of the white light.
     */
    public static synthesize(
        astroData: { planet: string, sign: string }[],
        hdData: { gate: string, center: string, defined: boolean }[]
    ): SpectralSnapshot {

        const frequencies: BioMetricFrequency[] = [];

        // 1. Process Astrology
        astroData.forEach(d => {
            frequencies.push(normalizeAstrology(d.planet, d.sign));
        });

        // 2. Process Human Design
        hdData.forEach(d => {
            frequencies.push(normalizeHumanDesign(d.gate, d.center, d.defined));
        });

        // 3. Calculate Coherence (Simulated)
        // High coherence if wavelengths align (e.g. lots of RED + INDIGO)
        const coherence = Math.min(100, Math.floor(Math.random() * 20) + 70); // Mock: Always fairly high for demo

        return {
            timestamp: new Date().toISOString(),
            frequencies,
            coherenceScore: coherence,
            dominantWavelength: this.calculateDominant(frequencies)
        };
    }

    private static calculateDominant(freqs: BioMetricFrequency[]): any {
        // Simple mode calculation
        // Returns the most frequent wavelength or 'ULTRAVIOLET'
        return 'INDIGO'; // Placeholder logic
    }
}
