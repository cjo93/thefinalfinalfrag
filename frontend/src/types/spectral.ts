
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModalitySystem = 'HUMAN_DESIGN' | 'ASTROLOGY' | 'GENE_KEYS' | 'NUMEROLOGY';

export type SpectralWavelength =
    | 'INFRARED'   // Deep Somatic / Survival
    | 'RED'        // Emotional / Volatile
    | 'ORANGE'     // Creative / Sexual
    | 'YELLOW'     // Identity / Ego
    | 'GREEN'      // Love / Direction
    | 'BLUE'       // Communication / Expression
    | 'INDIGO'     // Mental / Conceptual
    | 'VIOLET'     // Spiritual / Pressure
    | 'ULTRAVIOLET'; // Transcendent / Undefined

export interface BioMetricFrequency {
    /** The unique identifier of the source signal (e.g., "Mars", "Gate 36") */
    id: string;

    /** The system this signal originates from */
    system: ModalitySystem;

    /** The normalized intensity of the signal (0.0 to 1.0) */
    amplitude: number;

    /** The qualitative "color" or frequency band of the signal */
    wavelength: SpectralWavelength;

    /** A brief, synthesized description of this frequency's effect */
    resonance: string;

    /** Constructive or Destructive interference with current transit field? */
    interferencePattern?: 'CONSTRUCTIVE' | 'DESTRUCTIVE' | 'NEUTRAL';
}

/**
 * A snapshot of the user's complete energetic spectrum at a specific moment in time.
 */
export interface SpectralSnapshot {
    timestamp: string;
    frequencies: BioMetricFrequency[];
    coherenceScore: number; // 0-100
    dominantWavelength: SpectralWavelength;
}
