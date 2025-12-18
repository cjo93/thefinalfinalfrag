import express from "express";
import { getAgent } from "../agents/instances";
import { MandalaAgent } from "../agents/MandalaAgent";
import { verifyAuthToken } from "../middleware/auth";
import { requireFeature } from '../middleware/subscription.guard';

const router = express.Router();

// Protected Route: Generate Mandala
// Requires Firebase ID Token in "Authorization: Bearer <token>"
router.post("/generate",
    verifyAuthToken,
    requireFeature({ feature: 'mandala', incrementUsage: true }),
    async (req: any, res: any) => {
        try {
            const userId = req.user.uid;
            console.log(`[API] Request to generate mandala for ${userId}`);

            const mandalaAgent = getAgent("MandalaAgent") as MandalaAgent;
            const result = await mandalaAgent.generateUserMandala(userId);

            res.json(result);
        } catch (err: any) {
            console.error("Mandala error:", err);
            res.status(500).json({ error: err.message || "Mandala generation failed" });
        }
    });

/**
 * POST /api/mandala/card
 * Generates a mandala and redirects to the image URL.
 * Used by MandalaProfileCard in the frontend.
 */
router.post("/card",
    // verifyAuthToken, // Optional: strict auth
    async (req: any, res: any) => {
        try {
            const userId = req.body.user_id || req.user?.uid || "anonymous_mandala";
            console.log(`[API] Generation Request (Card) for ${userId}`);

            const mandalaAgent = getAgent("MandalaAgent") as MandalaAgent;
            const result = await mandalaAgent.generateUserMandala(userId);

            // Redirect to the image URL with 303 (See Other) so fetch switches to GET
            if (result && result.imageUrl) {
                return res.redirect(303, result.imageUrl);
            } else {
                throw new Error("No image URL returned");
            }

        } catch (err: any) {
            console.error("Mandala Card error:", err);
            res.status(500).json({ error: err.message || "Card generation failed" });
        }
    });

export default router;
