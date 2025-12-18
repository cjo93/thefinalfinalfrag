import { Router } from 'express';
import { vectorAgent } from '../agents/instances';

const router = Router();

// POST /api/simulation/run
// Trigger a backend physics simulation
router.post('/run', async (req, res) => {
    try {
        const { nodes = 10, iterations = 100 } = req.body;

        // 1. Spawn
        await vectorAgent.simulatePopulation(nodes);

        // 2. Run
        const stats = await vectorAgent.runPhysicsLoop(iterations);

        res.json({
            success: true,
            stats
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/simulation/stats
// Get live cosmic state
router.get('/stats', (req, res) => {
    try {
        const state = vectorAgent.getCosmicState();
        res.json(state);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Logic for the analyze endpoint, separated for use in middleware callback
const analyzeLogic = async (req: any, res: any) => {
    try {
        const { state, members, userId } = req.body;
        const fs = await import('fs');
        const path = await import('path');
        const { collections } = await import('../services/firestore');

        // 1. Determine Day
        let day = 1;
        if (userId) {
            const userDoc = await collections.users.doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData?.protocolStartedAt) {
                    const startedAt = new Date(userData.protocolStartedAt).getTime();
                    const now = new Date().getTime();
                    day = Math.floor((now - startedAt) / 86400000) + 1;
                    if (day > 30) day = 30; // Cap at 30
                    if (day < 1) day = 1;
                }
            }
        }

        // 2. Fetch Curriculum Node
        const curriculumPath = path.resolve(__dirname, '../content/defrag_curriculum_30.json');
        let dailyNode = {
            day: 1,
            topic: "Baseline Observation",
            content: "Observe the patterns without judgment. Calibration starts with awareness.",
            action_item: "Sit for 5 minutes in silence.",
            visual_symbol: "CORE",
            phase: "INITIATION"
        };

        if (fs.existsSync(curriculumPath)) {
            const data = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
            dailyNode = data.find((d: any) => d.day === day) || data[0];
        }

        // 3. Synthesize Insights (Live Gemini Integration)
        let processedInsight = {
            headline: `PROTOCOL_DAY_${day}: ${dailyNode.topic.toUpperCase()}`,
            narrative: dailyNode.content,
            action_adaptation: dailyNode.action_item,
            integrity_score: 88
        };

        try {
            const { analysisService } = await import('../services/AnalysisService');
            // Mock vector state if missing (for first run)
            const vectorState = state || { order_chaos: 0.5, control_isolation: 0.5 };

            const aiResult = await analysisService.generateInsight({
                userId: userId || 'anonymous',
                day: dailyNode.day,
                phase: dailyNode.phase || 'INITIATION',
                topic: dailyNode.topic,
                curriculumContent: dailyNode.content,
                vectorState: vectorState
            });

            if (aiResult) {
                processedInsight = aiResult;
            }
        } catch (e) {
            console.error("AI Insight Gen failed, using static:", e);
        }

        // 4. Validate Content (The Trust Layer)
        // [v4.0 Cleanup] Use correct T0-1 types
        let validationResult: any = {
            status: 'UNKNOWN',
            overallConfidence: 1,
            userFacingMessage: 'Unchecked',
            groundTruth: { details: [] }
        };

        try {
            const { validationAgent } = await import('../agents/ValidationAgent');
            // Check only the narrative for hallucinations
            validationResult = await validationAgent.validateBriefing(processedInsight.narrative);

            // Log issues
            if (validationResult.status === 'FAILED') {
                console.warn(`[ValidationAgent] Content Failed: ${validationResult.userFacingMessage}`, validationResult.groundTruth?.details);
            }
        } catch (e) {
            console.error("Validation failed:", e);
        }

        res.json({
            success: true,
            data: {
                insights: {
                    system_status: 'PROCESSING',
                    integrity_score: processedInsight.integrity_score,
                    validation: {
                        score: Math.floor((validationResult.overallConfidence || 1) * 100),
                        status: validationResult.status,
                        issues: validationResult.groundTruth?.details || [],
                        message: validationResult.userFacingMessage
                    },
                    headline: processedInsight.headline,
                    narrative: processedInsight.narrative,
                    daily_lesson: {
                        ...dailyNode,
                    },
                    protocol: processedInsight.action_adaptation || dailyNode.action_item
                }
            }
        });

    } catch (error: any) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// POST /api/simulation/analyze
// [v4.0] Tier Gated
router.post('/analyze', async (req, res, next) => {
    try {
        const { requireTier } = await import('../middleware/auth');
        const middleware = requireTier('premium_analysis'); // T1-1: Feature Gate
        middleware(req, res, () => {
            // Proceed to logic
            analyzeLogic(req, res);
        });
    } catch (e) { next(e); }
});

// GET /api/simulation/curriculum
// Serve the 30-Day Protocol Structure
router.get('/curriculum', async (req, res) => {
    try {
        const path = await import('path');
        const fs = await import('fs');
        const curriculumPath = path.resolve(__dirname, '../content/defrag_curriculum_30.json');

        if (fs.existsSync(curriculumPath)) {
            const data = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
            res.json(data);
        } else {
            res.status(404).json({ error: "Curriculum file not found" });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
