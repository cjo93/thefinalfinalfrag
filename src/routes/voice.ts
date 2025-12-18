
import { Router } from 'express';
import { voiceAgent } from '../agents/instances';

const router = Router();

import { verifyAuthToken } from '../middleware/auth';
import { requireFeature } from '../middleware/subscription.guard';

router.post('/synthesize',
    verifyAuthToken,
    requireFeature({ feature: 'voice', incrementUsage: true }),
    async (req, res) => {
        try {
            const { text, voiceId } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const audioBuffer = await voiceAgent.synthesizeText(text, voiceId);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', audioBuffer.length);
            res.send(audioBuffer);

        } catch (error: any) {
            console.error("Voice API Error:", error);
            res.status(500).json({ error: error.message || 'Synthesis failed' });
        }
    });

export default router;
