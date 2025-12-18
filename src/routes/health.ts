
import { Router } from 'express';
import { envDoctorAgent } from '../agents/instances';

const router = Router();

// Standard Liveness Check (Kubernetes/Docker style)
router.get('/', (req, res) => {
    res.send('DEFRAG Agent System / Jules Runtime Active');
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed System Report
router.get('/status', async (req, res) => {
    try {
        const report = await envDoctorAgent.checkHealth();
        // Return 503 if Critical, otherwise 200
        const code = report.status === 'CRITICAL' ? 503 : 200;
        res.status(code).json(report);
    } catch (error: any) {
        res.status(500).json({ error: 'Doctor Failed', message: error.message });
    }
});

export default router;
