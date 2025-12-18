// T0-1: Validation Types
export type ValidationStatus = 'PASS' | 'PASS_WITH_WARNINGS' | 'PARTIAL' | 'FAILED';

export interface ValidationResult {
    validationId: string;
    briefingId?: string;
    timestamp: string;

    // Layer 1: Ground Truth
    groundTruth: {
        score: number; // 0.0 - 1.0
        details: string[]; // "Mars in Aries Verified", "Moon match failed"
        rawPositions?: any;
    };

    // Layer 2: Framework Coherence
    framework: {
        score: number;
        details: string[]; // "Contradiction found in Para 2"
    };

    // Layer 3: Final Decision
    overallConfidence: number;
    status: ValidationStatus;
    userFacingMessage: string;

    // Action Flags (T0-4)
    flags: {
        showFullContent: boolean;
        showWarnings: boolean;
        showConfidenceScore: boolean;
        fallbackToGroundTruth: boolean;
    };
}

export interface BriefingCandidate {
    userId: string;
    date: Date;
    content: {
        headline: string;
        narrative: string;
        actionItem: string;
    };
}
