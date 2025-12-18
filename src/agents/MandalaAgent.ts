import { Agent, AgentContext } from "../framework/AgentBase";
import { generateMandalaCard } from "../tools/mandala";
import { db } from "../services/firestore";

export class MandalaAgent extends Agent {
    constructor(context: AgentContext) {
        super("MandalaAgent", context);
    }

    async generateUserMandala(userId: string) {
        console.log(`[MandalaAgent] Generating for user: ${userId}`);

        // In dev, we might not have a real firestore connection or user
        // Fallback logic if db is missing or user missing
        let birthDate: string;
        let birthTime: string;
        let birthLocation: string;

        try {
            const doc = await db.collection("users").doc(userId).get();
            if (!doc.exists) {
                // Production: Throw error if user not found
                throw new Error(`User ${userId} not found in DB`);
            } else {
                const data = doc.data() || {};
                birthDate = data.birthDate;
                birthTime = data.birthTime;
                birthLocation = data.birthLocation;
            }
        } catch (e) {
            console.warn("Firestore error:", e);
            throw e; // Propagate error
        }

        if (!birthDate || !birthTime || !birthLocation) {
            throw new Error("Missing birth data for mandala generation. Please complete onboarding.");
        }

        const result = await generateMandalaCard({
            userId,
            birthDate,
            birthTime,
            birthLocation,
        });

        try {
            await db
                .collection("users")
                .doc(userId)
                .collection("mandalas")
                .doc("current")
                .set(
                    {
                        imageUrl: result.imageUrl,
                        modelVersion: result.modelVersion,
                        generatedAt: new Date().toISOString(),
                    },
                    { merge: true }
                );
        } catch (e) {
            console.warn("Failed to save to Firestore:", e);
        }

        return result;
    }
}
