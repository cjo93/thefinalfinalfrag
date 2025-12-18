
import express from 'express';
import { collections } from '../services/firestore';
import { mandalaAgent } from '../agents/instances';


const router = express.Router();

/**
 * POST /api/users/init
 * Initialize or update a user's profile, including biometrics and family members.
 * Used by the frontend during login and background syncs.
 */
router.post('/init', async (req, res) => {
    try {
        const { userId, email, name, bioMetrics, familyMembers } = req.body;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: "Invalid userId" });
        }

        // Check if user already exists to preserve protocolStartedAt
        const existingDoc = await collections.users.doc(userId).get();
        const existingData = existingDoc.data();

        const userData: any = {
            id: userId,
            email: email || '',
            name: name || 'Anonymous',
            bioMetrics: bioMetrics || {},
            familyMembers: familyMembers || [],
            updatedAt: new Date().toISOString()
        };

        // Initialize Protocol if not already started
        if (!existingData?.protocolStartedAt) {
            userData.protocolStartedAt = new Date().toISOString();
        }

        await collections.users.doc(userId).set(userData, { merge: true });

        console.log(`[Users] User initialized/updated: ${userId}`);

        // --- BACKGROUND AGENT ACTIVATION ---
        // Fire-and-forget: Trigger Mandala Generation if biometrics are present
        if (bioMetrics && bioMetrics.birthDate && bioMetrics.birthLocation) {
            (async () => {
                try {
                    // Use Singleton Instance from agents/instances.ts
                    await mandalaAgent.generateUserMandala(userId);
                    console.log(`[Users] Mandala generation triggered for ${userId}`);
                } catch (bgError) {
                    console.error(`[Users] Background Mandala generation failed for ${userId}:`, bgError);
                }
            })();
        }

        return res.json({
            status: 'success',
            message: 'User profile synced',
            user: userData
        });

    } catch (error: any) {
        console.error("[Users] Init failed:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

/**
 * GET /api/users/:userId
 * Fetch a user's profile.
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const doc = await collections.users.doc(userId).get();

        if (!doc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(doc.data());
    } catch (error: any) {
        console.error("[Users] Fetch failed:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
