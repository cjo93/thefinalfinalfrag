import { Body, Equator, Observer, Ecliptic } from 'astronomy-engine';

const PLANETS = [
    Body.Sun,
    Body.Moon,
    Body.Mercury,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn,
    Body.Uranus,
    Body.Neptune,
    Body.Pluto,
];

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

interface PlanetPosition {
    name: string;
    longitude: number;
    sign: string;
    isRetrograde: boolean;
}

export interface Aspect {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    exactness: number;
}

export class AstronomyService {

    constructor() { }

    /**
     * Calculate planetary positions for a specific date.
     */
    public async calculatePositions(date: Date = new Date()): Promise<PlanetPosition[]> {
        const observer = new Observer(0, 0, 0);

        return PLANETS.map(body => {
            const equator = Equator(body, date, observer, true, true);
            const ecliptic = Ecliptic(equator.vec);

            const nextHour = new Date(date.getTime() + 3600 * 1000);
            const eqNext = Equator(body, nextHour, observer, true, true);
            const ecNext = Ecliptic(eqNext.vec);

            let speed = ecNext.elon - ecliptic.elon;
            if (speed < -300) speed += 360;
            if (speed > 300) speed -= 360;

            const signIndex = Math.floor(ecliptic.elon / 30);
            const sign = ZODIAC_SIGNS[signIndex];

            return {
                name: body,
                longitude: ecliptic.elon,
                sign: sign,
                isRetrograde: speed < 0
            };
        });
    }

    /**
     * Calculate Aspects (Conjunction, Square, etc).
     */
    public async calculateAspects(date: Date = new Date()): Promise<Aspect[]> {
        const positions = await this.calculatePositions(date);
        const aspects: Aspect[] = [];
        const ORB = 8; // Major Aspect Orb

        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const p1 = positions[i];
                const p2 = positions[j];

                let diff = Math.abs(p1.longitude - p2.longitude);
                if (diff > 180) diff = 360 - diff;

                const checkAspect = (angle: number, name: string) => {
                    const orb = Math.abs(diff - angle);
                    if (orb <= ORB) {
                        aspects.push({
                            planet1: p1.name,
                            planet2: p2.name,
                            type: name,
                            orb: orb,
                            exactness: 1 - (orb / ORB)
                        });
                    }
                };

                checkAspect(0, 'Conjunction');
                checkAspect(60, 'Sextile');
                checkAspect(90, 'Square');
                checkAspect(120, 'Trine');
                checkAspect(180, 'Opposition');
            }
        }
        return aspects;
    }

    public async getGroundTruthString(date: Date = new Date()): Promise<string> {
        const positions = await this.calculatePositions(date);
        const aspects = await this.calculateAspects(date);

        const posStr = positions.map(p =>
            `${p.name}: ${p.sign} (${p.longitude.toFixed(2)}°) ${p.isRetrograde ? '[Rx]' : ''}`
        ).join('\n');

        const aspectStr = aspects.map(a =>
            `${a.planet1} ${a.type} ${a.planet2} (orb ${a.orb.toFixed(1)}°)`
        ).join('\n');

        return `PLANETARY POSITIONS:\n${posStr}\n\nMAJOR ASPECTS:\n${aspectStr}`;
    }
}

export const astronomyService = new AstronomyService();
