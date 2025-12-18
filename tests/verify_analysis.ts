
import { apiClient } from '../src/config/apiClient';
import { API_ENDPOINTS } from '../src/config/api';

/**
 * Script to verify the System Analysis Generation End-to-End.
 * Usage: npx ts-node tests/verify_analysis.ts
 */

const verifyAnalysis = async () => {
    console.log("🔍 Verifying System Analysis Pipeline...");

    try {
        // 1. Mock Data Setup
        const mockUserId = "test_user_" + Date.now();
        const mockVectorState = {
            order_chaos: { position: 0.2 }, // Low Chaos
            control_isolation: { position: 0.8 }, // High Control
            idealization_devaluation: { position: 0.5 }
        };

        console.log(`\n➡️  Triggering Analysis for User: ${mockUserId}`);
        console.log(`    Vector State: ${JSON.stringify(mockVectorState)}`);

        // 2. Call API (using fetch directly if apiClient relies on browser env,
        //    but apiClient uses fetch which is avail in Node 18+)

        // Use raw fetch to avoid dependency issues in standalone script
        const response = await fetch('http://localhost:3002/api/simulation/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: mockUserId,
                day: 1,
                topic: "Test Protocol",
                content: "Testing the neural uplink.",
                vectorState: mockVectorState,
                tier: "ARCHITECT_NODE"
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // 3. Validate Response
        if (data.success && data.data?.insights) {
            const insights = data.data.insights;
            console.log("\n✅ Analysis Successful!");
            console.log("---------------------------------------------------");
            console.log(`HEADLINE:  ${insights.headline}`);
            console.log(`NARRATIVE: ${insights.narrative}`);
            console.log(`STATUS:    ${insights.system_status}`);
            console.log(`INTEGRITY: ${insights.integrity_score}%`);
            console.log("---------------------------------------------------");
        } else {
            console.error("❌ Analysis returned valid JSON but missing 'insights' data.");
            console.log("Raw Response:", JSON.stringify(data, null, 2));
        }

    } catch (error: any) {
        console.error("\n❌ Verification Failed:", error.message);
        if (error.cause) console.error(error.cause);
    }
};

verifyAnalysis();
