
import express from 'express';
import { fetchLiveVectors } from '../services/jplHorizons';

const router = express.Router();

router.get('/live-vectors', async (req, res) => {
    try {
        const cosmicData = await fetchLiveVectors();

        // Calculate Entropy (Mock Field Tension Logic)
        const entropy = 0.67; // Placeholder per spec

        res.json({
            ...cosmicData,
            entropy,
            status: 'LIVE_FEED_ACTIVE'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
