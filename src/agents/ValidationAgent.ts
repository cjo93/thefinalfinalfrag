// @ts-ignore
import { JulesAgent } from '@google/jules-sdk';
import { astronomyService } from '../services/astronomy';
import { ValidationResult, ValidationStatus } from '../types/validation';

/**
 * T0-1: ValidationAgent Architecture
 * Implements the 3-Layer Validation Protocol.
 */
class ValidationAgent extends JulesAgent {
    constructor() {
        super({
            name: 'ValidationAgent',
            description: 'Validates astrological content against distinct ground truth data.',
            model: 'gemini-2.0-flash',
            tools: []
        });
    }

    /**
     * T0-4: Confidence Scoring Logic
     * @param validScore (0-100) from LLM checking Ground Truth
     */
    private determineStatus(score: number): ValidationStatus {
        if (score >= 90) return 'PASS';
        if (score >= 75) return 'PASS_WITH_WARNINGS';
        if (score >= 60) return 'PARTIAL';
        return 'FAILED';
    }

    /**
     * T0-5: Main Validation Pipeline
     */
    async validateBriefing(briefingText: string, targetDate: Date = new Date()): Promise<ValidationResult> {
        // Layer 1: Ground Truth
        const groundTruthData = await astronomyService.getGroundTruthString(targetDate);

        // Layer 2: Framework Coherence (TODO: Add secondary LLM check here)
        // For now, we combine Ground Truth + Coherence into one prompt for speed/cost.

        const prompt = `
        ROLE: Expert Fact-Checker for Astrological Data.

        GROUND TRUTH:
        ${groundTruthData}

        BRIEFING TO VALIDATE:
        "${briefingText}"

        TASK:
        1. Fact-Check: Compare claims in briefing vs Ground Truth.
        2. Coherence: Does the briefing make logical sense?

        OUTPUT JSON:
        {
            "score": 0-100 (Accuracy Score),
            "issues": ["List of factorial errors found"],
            "coherence_score": 0-100 (Internal consistency)
        }
        `;

        try {
            const response = await this.generateResponse(prompt);
            const jsonStr = response.replace(/^```json/, '').replace(/```$/, '').trim();
            const result = JSON.parse(jsonStr);

            const score = result.score || 0;
            const status = this.determineStatus(score);

            return {
                validationId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                groundTruth: {
                    score: score / 100,
                    details: result.issues || []
                },
                framework: {
                    score: (result.coherence_score || 100) / 100,
                    details: []
                },
                overallConfidence: score / 100,
                status: status,
                userFacingMessage: this.getUserFacingMessage(status, score),
                flags: {
                    showFullContent: status !== 'FAILED',
                    showWarnings: status === 'PASS_WITH_WARNINGS' || status === 'PARTIAL',
                    showConfidenceScore: true,
                    fallbackToGroundTruth: status === 'FAILED'
                }
            };

        } catch (error: any) {
            console.error("Validation Failed:", error);
            return {
                validationId: 'error',
                timestamp: new Date().toISOString(),
                groundTruth: { score: 0, details: [error.message] },
                framework: { score: 0, details: [] },
                overallConfidence: 0,
                status: 'FAILED',
                userFacingMessage: "Validation System Error",
                flags: {
                    showFullContent: false,
                    showWarnings: true,
                    showConfidenceScore: false,
                    fallbackToGroundTruth: true
                }
            };
        }
    }

    private getUserFacingMessage(status: ValidationStatus, score: number): string {
        switch (status) {
            case 'PASS': return `${score}% Verified - High Trust`;
            case 'PASS_WITH_WARNINGS': return `${score}% Verified - Some Caveats`;
            case 'PARTIAL': return `${score}% Verified - Standard Check`;
            default: return "Unverified Content - Facts Only";
        }
    }
}

export const validationAgent = new ValidationAgent();
