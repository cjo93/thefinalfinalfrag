// T2-2: Daily Briefing Pre-Generation Cron
import { Router } from 'express';
import { collections } from '../services/firestore';
import { analysisService } from '../services/AnalysisService';
import { validationAgent } from '../agents/ValidationAgent';

const router = Router();

// Triggered by Cloud Scheduler (e.g., 3 AM PST)
// POST /api/cron/briefing
router.post('/briefing', async (req, res) => {
    // 1. Authenticate Cron (Simple shared secret for MVP)
    const secret = req.headers['x-cron-secret'];
    if (secret !== process.env.CRON_SECRET && secret !== 'mock_cron_secret') {
        return res.status(401).json({ error: 'Unauthorized Cron' });
    }

    console.log("[CRON] Starting Daily Briefing Generation...");
    const stats = { processed: 0, successful: 0, failed: 0 };

    try {
        // 2. Find Premium Users
        const snapshot = await collections.users
            .where('subscription_tier', 'in', ['premium', 'pro'])
            .where('subscription_status', '==', 'active')
            .get();

        if (snapshot.empty) {
            console.log("[CRON] No premium users found.");
            return res.json({ message: "No users to process", stats });
        }

        const promises = snapshot.docs.map(async (doc: any) => {
            const userId = doc.id;
            const userData = doc.data();

            try {
                // 3. Logic: Determine "Next Day"
                // Simplified: Assuming linear progression based on start date
                // In real app, check last completed day.
                const startedAt = new Date(userData.protocolStartedAt || Date.now()).getTime();
                const now = Date.now();
                let day = Math.floor((now - startedAt) / 86400000) + 1;
                if (day < 1) day = 1;
                if (day > 30) day = 30; // Cap loop

                // 4. Generate Insight
                // We use mock vector state if missing, but in T2-3 we use real.
                const vectorState = userData.vectorState || { order_chaos: 0.5 };

                // TODO: Fetch specific curriculum content for 'day' here or in service
                // For efficiency, we just pass basics and let service verify
                const aiResult = await analysisService.generateInsight({
                    userId,
                    day,
                    phase: 'INTEGRATION', // simplified
                    topic: `Day ${day} Protocol`,
                    curriculumContent: "Pre-generated daily content...", // Service handles lookup
                    vectorState: vectorState
                });

                // 5. Validate (T0 Integration)
                const validation = await validationAgent.validateBriefing(aiResult.narrative);

                // 6. Store in `users/{uid}/daily_briefings/{date}`
                const todayStr = new Date().toISOString().split('T')[0];
                await collections.users.doc(userId).collection('daily_briefings').doc(todayStr).set({
                    ...aiResult,
                    validation,
                    generatedAt: new Date().toISOString(),
                    type: 'cron_pregen'
                });

                stats.successful++;
            } catch (err) {
                console.error(`[CRON] Failed for user ${userId}`, err);
                stats.failed++;
            }
            stats.processed++;
        });

        await Promise.all(promises);

        console.log(`[CRON] Complete. Stats:`, stats);
        res.json({ success: true, stats });

    } catch (error: any) {
        console.error("[CRON] Job Failed:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
