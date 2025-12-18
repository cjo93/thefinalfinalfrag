
/**
 * Astrology Service
 * Wraps `swisseph` to provide accurate planetary data for the Family Systems Vector Engine.
 */

import swisseph from 'swisseph';

// Configuration
// Ephemeris files should ideally be downloaded/located.
// For this implementation, we rely on swisseph's default or bundled mosaic if available,
// or accept that it might default to Moshier (less accurate but fine for this level).
// Note: swisseph-node often requires a path to .se1 files.
// If missing, we might need to point to a local dir or rely on limited calculations.

const BODIES = {
    Sun: swisseph.SE_SUN,
    Moon: swisseph.SE_MOON,
    Mercury: swisseph.SE_MERCURY,
    Venus: swisseph.SE_VENUS,
    Mars: swisseph.SE_MARS,
    Jupiter: swisseph.SE_JUPITER,
    Saturn: swisseph.SE_SATURN,
    Uranus: swisseph.SE_URANUS,
    Neptune: swisseph.SE_NEPTUNE,
    Pluto: swisseph.SE_PLUTO,
    NorthNode: swisseph.SE_TRUE_NODE
};

const ZODIAC = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

interface PlanetPosition {
    body: string;
    sign: string;
    degree: number; // 0-29.99 within sign
    absDegree: number; // 0-360
    retrograde: boolean;
}

const getSign = (lon: number) => {
    const index = Math.floor(lon / 30);
    return {
        sign: ZODIAC[index % 12],
        degree: lon % 30
    };
};

export const calculatePlanetaryPositions = (date: Date): Promise<PlanetPosition[]> => {
    return new Promise((resolve, reject) => {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + (date.getUTCMinutes() / 60);

        // Convert to Julian Day
        const julday = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);

        const results: PlanetPosition[] = [];
        const flags = swisseph.SEFLG_SPEED; // Calculate speed to detect retrograde

        let completed = 0;
        const keys = Object.keys(BODIES);

        keys.forEach(name => {
            const bodyId = BODIES[name as keyof typeof BODIES];
            swisseph.swe_calc_ut(julday, bodyId, flags, (data: any) => {
                if (data.error) {
                    console.warn(`Error calculating ${name}:`, data.error);
                } else {
                    const { longitude, longitudeSpeed } = data;
                    const { sign, degree } = getSign(longitude);
                    results.push({
                        body: name,
                        sign,
                        degree,
                        absDegree: longitude,
                        retrograde: longitudeSpeed < 0
                    });
                }
                completed++;
                if (completed === keys.length) {
                    resolve(results);
                }
            });
        });
    });
};


// Simplified Human Design Gate Wheel (Starting from roughly 0 Aries)
// Note: Real HD Mandala is offset. 0 Aries is in Gate 25.
const HD_GATES_ORDER = [
    25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4,
    29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54,
    61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36
];

export const getHumanDesignGate = (absDegree: number) => {
    // 0 Aries = ~Gate 25 (Line 3).
    // The wheel goes counter-clockwise relative to the zodiac? No, usually follows it.
    // Each gate is 5.625 degrees.

    // Aligning 0 Aries to the start of the sequence for simplicity in this version.
    // In a rigorous engine, we'd add the exact offset (approx 0 Aries is 88 degrees from G41 start of year).

    // Effectively index 0 of our array roughly corresponds to a sector in Aries context
    const sectorSize = 360 / 64;
    const index = Math.floor(absDegree / sectorSize) % 64;

    // We wrap to ensure safety
    const gateStr = HD_GATES_ORDER[index] || 1;

    return {
        gate: gateStr,
        channel: 'UNLINKED', // Would require calculating Earth/Moon connectivity
        center: 'UNDEFINED'
    };
};

/**
 * Generates the full AstrologyProfile for the VectorEngine
 */
export const generateAstrologyProfile = async (date: Date = new Date()) => {
    try {
        const positions = await calculatePlanetaryPositions(date);

        // Simple Aspect Calculation (Conjunctions/Squares/Oppositions)
        // Hard aspect orb: 6 degrees
        const aspects: any[] = [];
        const ORB = 6;

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const p1 = positions[i];
                const p2 = positions[j];
                const diff = Math.abs(p1.absDegree - p2.absDegree);
                const angle = Math.min(diff, 360 - diff);

                let type = '';
                if (Math.abs(angle - 0) < ORB) type = 'CONJUNCTION';
                else if (Math.abs(angle - 90) < ORB) type = 'SQUARE';
                else if (Math.abs(angle - 180) < ORB) type = 'OPPOSITION';
                else if (Math.abs(angle - 120) < ORB) type = 'TRINE';

                if (type) {
                    aspects.push({
                        a: p1.body,
                        b: p2.body,
                        type,
                        orb: Math.abs(angle - (type === 'CONJUNCTION' ? 0 : type === 'SQUARE' ? 90 : type === 'OPPOSITION' ? 180 : 120))
                    });
                }
            }
        }

        // Calculate Astro Prior Vector
        // Logic: Hard aspects create tension (Chaos/Agency), Trines create flow (Order/Connection)
        let biasX = 0; // Connection vs Hostility
        let biasY = 0; // Agency vs Submission
        let biasZ = 0; // Meaning vs Survival

        aspects.forEach(a => {
            const weight = (10 - a.orb) / 10; // Stronger aspect = higher weight

            if (['SQUARE', 'OPPOSITION'].includes(a.type)) {
                // Tension -> Agency (+Y), Hostility (-X)
                biasY += 0.2 * weight;
                biasX -= 0.1 * weight;
            }
            if (['TRINE', 'CONJUNCTION'].includes(a.type)) {
                // Flow -> Connection (+X), Meaning (+Z)
                biasX += 0.2 * weight;
                biasZ += 0.1 * weight;
            }
        });

        // Normalize roughly
        const normalize = (v: number) => Math.max(-1, Math.min(1, v));

        // Get Sun Gate
        const sunPos = positions.find(p => p.body === 'Sun');
        const sunGate = sunPos ? getHumanDesignGate(sunPos.absDegree) : { gate: 0 };

        return {
            natal: { placements: positions, aspects }, // Mocking natal as current for now, or this is transit profile
            transits: [], // Could list specific transit events here
            astroPrior: {
                x: normalize(biasX),
                y: normalize(biasY),
                z: normalize(biasZ)
            },
            transitGain: 0, // Will be calc'd by engine or here
            humanDesign: {
                sunGate: sunGate.gate
            }
        };

    } catch (e) {
        console.error("Astrology calculation failed", e);
        return null;
    }
};
