
// import * as Horizons from '@nasa-jpl/horizons-api';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer'; // For email sending mentioned in guide

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// MOCK Horizons since package is unavailable/private
const Horizons = {
    query: async (opts: any) => {
        return {
            date: opts.start_date,
            target: opts.target,
            ra: Math.random() * 360,
            dec: (Math.random() * 180) - 90,
            delta: Math.random() * 5 // distance
        };
    }
};

export class BriefingService {
    async generateDailyBriefing(userId: string, userData: any) {
        try {
            const ephemerisData = await this.getEphemerisData();
            const transits = await this.calculateTransits(userData.natalChart, ephemerisData);
            const briefing = await this.generateBriefingNarrative(userData, ephemerisData, transits);
            const emailHtml = this.formatBriefingEmail(briefing);

            // Store in Firestore
            await admin.firestore().collection('users').doc(userId).collection('briefings').add({
                date: new Date(),
                content: briefing,
                ephemerisData,
                transits
            });

            return emailHtml; // Return content for email sender
        } catch (error) {
            console.error('Briefing generation failed:', error);
            throw error;
        }
    }

    private async getEphemerisData() {
        const today = new Date().toISOString().split('T')[0];
        const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        const positions: any = {};

        for (const planet of planets) {
            try {
                const result = await Horizons.query({
                    target: planet,
                    start_date: today,
                    end_date: today,
                    step_size: '1d'
                });
                positions[planet] = result;
            } catch (error) {
                console.warn(`Failed to fetch ${planet} ephemeris:`, error);
            }
        }
        return positions;
    }

    private async calculateTransits(natalChart: any, ephemerisData: any) {
        const transits = [];
        const sunSign = natalChart?.sun?.sign || 'Aries'; // Fallback

        transits.push({
            type: 'SUN_TRANSIT',
            description: `Sun in ${sunSign} (Transit)`,
            significance: 'moderate'
        });

        return transits;
    }

    private async generateBriefingNarrative(userData: any, ephemerisData: any, transits: any) {
        const prompt = `
Generate a daily calibration briefing interpreting real-time planetary movements.
User: ${userData.firstName}, ${userData?.natalChart?.sun?.sign || 'Unknown'}
Include: significant planetary influence, relevance to natal chart, practical action for day.
Format: 150-200 word plain text with natural paragraphs.
    `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    formatBriefingEmail(content: string) {
        return `
      <div style="font-family: monospace; background: #000; color: #fff; padding: 20px;">
        <h1>// DEFRAG DAILY SIGNAL</h1>
        <hr/>
        <div style="white-space: pre-wrap;">${content}</div>
        <hr/>
        <small>System Coherence Re-established.</small>
      </div>
      `;
    }
}
