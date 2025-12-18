
import { Router } from 'express';
import { collections } from '../services/firestore';
import { verifyAuthToken } from '../middleware/auth';
import { auth as admin } from '../config/firebase';
import { generateAstrologyProfile } from '../services/astrology';

const router = Router();

// --- Types ---

interface RelationalGeometry {
    architecture: string;
    tension_node: string;
    resolution: string;
}

interface TimelineEvent {
    id: string;
    time: string;
    type: 'SYNC' | 'SOMATIC' | 'RELATIONAL' | 'SYSTEM';
    recurrenceScore: number;
    importance: number;
    labels: string[];
    narrative: string;
}

// --- Helpers ---

const mapVectorsToGeometry = (vectors: any): RelationalGeometry => {
    if (!vectors) {
        return {
            architecture: 'UNINITIALIZED',
            tension_node: 'AWAITING_CALIBRATION',
            resolution: 'PENDING',
        };
    }

    const orderPos = vectors.order_chaos?.position || 0.5;
    const architecture = orderPos < 0.3 ? 'CHAOTIC_FRACTAL' :
        orderPos > 0.7 ? 'RIGID_LATTICE' :
            'FLEXIBLE_MESH';

    const controlScore = vectors.control_isolation?.position || 0.5;
    // 0 = Isolation (Ghost), 1 = Control (Crusader)
    const tension_node = controlScore > 0.6 ? 'CONTROL_NEXUS' :
        controlScore < 0.4 ? 'ISOLATION_VOID' :
            'BOUNDED_FIELD';

    const idealizationScore = vectors.idealization_devaluation?.position || 0.5;
    const resolution = idealizationScore > 0.6 ? 'IDEALIZATION_PEAK' :
        idealizationScore < 0.4 ? 'DEVALUATION_TROUGH' :
            'INTEGRATED_BASELINE';

    return { architecture, tension_node, resolution };
};

// --- Routes ---

/**
 * GET /api/terminal/topology/:userId
 * Returns the Relational Geometry (Topology) for the user's family system.
 */
router.get('/topology/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await collections.users.doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const geometry = mapVectorsToGeometry(userData?.family_system_vectors);

        res.json(geometry);
    } catch (error) {
        console.error('Topology Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/terminal/timeline/:userId
 * Returns the Timeline Events for the user's history.
 */
router.get('/timeline/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch real events if they exist
        const eventsSnapshot = await collections.users.doc(userId).collection('events').orderBy('time', 'desc').limit(50).get();

        let events: TimelineEvent[] = eventsSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        } as TimelineEvent));

        // If no events, generate synth data for visualization
        if (events.length === 0) {
            const now = new Date();
            events = [
                {
                    id: 'init_01',
                    time: now.toISOString(),
                    type: 'SYSTEM',
                    recurrenceScore: 0,
                    importance: 10,
                    labels: ['BOOT', 'INIT'],
                    narrative: 'Defrag System Initialized. User session started.'
                },
                {
                    id: 'scan_01',
                    time: new Date(now.getTime() - 86400000).toISOString(),
                    type: 'SYNC',
                    recurrenceScore: 2,
                    importance: 5,
                    labels: ['PATTERN_RECOGNITION'],
                    narrative: 'Initial pattern scan completed. Baseline established.'
                }
            ];
        }

        res.json(events);
    } catch (error) {
        console.error('Timeline Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/terminal/wallet/sign
 * Scaffolding for Apple Wallet pass generation/signing.
 */
// Secured Wallet Sign & Generate
router.post('/wallet/sign', verifyAuthToken, async (req: any, res: any) => {
    try {
        const userId = req.user.uid;

        // Dynamic import if needed, but we can import the service directly at top level if build allows
        // Since we are likely in a Node env here:
        const { generateApplePass } = await import('../services/appleWallet');

        const buffer = await generateApplePass(userId);

        // Return Stream
        res.set('Content-Type', 'application/vnd.apple.pkpass');
        res.set('Content-Disposition', `attachment; filename=defrag_artifact.pkpass`);
        res.send(buffer);

    } catch (error) {
        console.error('Wallet Sign Error:', error);
        res.status(500).json({ error: 'Signing failed: ' + (error as any).message });
    }
});

/**
 * GET /api/terminal/curriculum
 * Returns the 30-day curriculum JSON.
 */
router.get('/curriculum', async (req, res) => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const curriculumPath = path.resolve(__dirname, '../content/defrag_curriculum_30.json');

        if (fs.existsSync(curriculumPath)) {
            const data = fs.readFileSync(curriculumPath, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Curriculum data not found. Initiate Jules generation.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load curriculum' });
    }
});

/**
 * GET /api/terminal/calendar/:userId/transits.ics
 * Generates an iCal calendar with upcoming genealogical/astrological transits.
 */
router.get('/calendar/:userId/transits.ics', async (req, res) => {
    try {
        const { userId } = req.params;
        const { calculatePlanetaryPositions } = await import('../services/astrology');

        // Strategy: Calculate for today and next 4 weeks to find "Significant Shifts"
        const events: any[] = [];
        const DAYS_TO_SCAN = 30;

        const scanDates = [0, 3, 7, 10, 14, 18, 22, 26, 30]; // Sample points

        const results = await Promise.all(scanDates.map(async (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            const pos = await calculatePlanetaryPositions(date);
            return { date, pos };
        }));

        // Detect major shifts between samples
        for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];

            curr.pos.forEach(p => {
                const prevP = prev.pos.find(pp => pp.body === p.body);
                if (prevP && prevP.sign !== p.sign) {
                    // Sign Ingress!
                    events.push({
                        summary: `${p.body.toUpperCase()}_INGRESS // ${p.sign.toUpperCase()}`,
                        description: `Significant shift in ${p.body} resonance as it enters ${p.sign}. Recalibrate your ${p.body === 'Sun' ? 'core identity' : 'communication'} protocols.`,
                        start: curr.date,
                        duration: 1440 // All day
                    });
                }
            });
        }

        // Add some "System-Wide" mandatory events
        events.push({
            summary: 'SYSTEM_SYNC // MANDATORY',
            description: 'Weekly alignment check. Review lineage vectors and update biometric logs.',
            start: new Date(Date.now() + 86400000 * 7),
            duration: 60
        });

        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//DEFRAG//SYSTEM_CAL//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:DEFRAG // TRANSITS',
            'X-WR-TIMEZONE:UTC',
        ];

        events.forEach((evt, i) => {
            const startStr = evt.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const endStr = new Date(evt.start.getTime() + evt.duration * 60000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            icsContent.push(
                'BEGIN:VEVENT',
                `UID:defrag_evt_${userId}_${i}_${evt.summary.substring(0, 5)}`,
                `DTSTAMP:${nowStr}`,
                `DTSTART:${startStr}`,
                `DTEND:${endStr}`,
                `SUMMARY:${evt.summary}`,
                `DESCRIPTION:${evt.description}`,
                'URL;VALUE=URI:https://defrag.app/terminal',
                'END:VEVENT'
            );
        });

        icsContent.push('END:VCALENDAR');

        res.set('Content-Type', 'text/calendar; charset=utf-8');
        res.set('Content-Disposition', 'attachment; filename="defrag_transits.ics"');
        res.send(icsContent.join('\r\n'));

    } catch (error) {
        console.error("Calendar Gen Error", error);
        res.status(500).send("Error generating calendar.");
    }
});

export const terminalRoutes = router;
