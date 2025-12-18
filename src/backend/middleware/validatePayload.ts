import { Request, Response, NextFunction } from 'express';
import { z } from 'zod'; // Using Zod for implementation, mapped to JSON schema concepts

// Envelope Schema Definition
const EnvelopeSchema = z.object({
    schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    trace_id: z.string().uuid(),
    timestamp: z.string().datetime(),
    sourceAgent: z.string(),
    targetAgent: z.string(),
    regime: z.enum(["NOMINAL", "SILENCE", "HOLD", "HIGH_LATENCY"]).optional(),
    payload: z.record(z.any())
}).strict();

export const validateEnvelope = (req: Request, res: Response, next: NextFunction) => {
    try {
        EnvelopeSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: "Invalid Envelope Schema",
                details: error.errors,
                timestamp: new Date().toISOString()
            });
            return;
        }
        next(error);
    }
};

export const validateAgentCapability = (targetAgent: string) => {
    // In a real impl, this would load spec/agent-registry.json
    // For now, it's a stub placeholder
    return (req: Request, res: Response, next: NextFunction) => {
        // Logic to check if targetAgent can handle the payload
        // If not, 403 Forbidden
        next();
    };
};
