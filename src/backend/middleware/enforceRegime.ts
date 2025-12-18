import { Request, Response, NextFunction } from 'express';
import { logger } from '../observability/logger';
import regimes from '../../../spec/regimes.json';

// Minimal Regime Logic for MVP
// In a full system, this would read from a shared Redis state or System Monitor
// For now, we simulate a check or read a 'mock' system state.

export const computeRegime = (): string => {
    // Mock Logic: Return NOMINAL usually, but could return HIGH_LATENCY based on load
    return "NOMINAL";
};

export const enforceRegime = (req: Request, res: Response, next: NextFunction) => {
    const trace_id = req.body.trace_id;
    const currentRegime = computeRegime();

    // Attach regime to request
    (req as any).regime = currentRegime;

    // Check Regime Spec
    const regimeSpec = regimes.regimes.find((r: any) => r.name === currentRegime);

    if (regimeSpec && !regimeSpec.narrativeAllowed) {
        // If narrative is strictly forbidden, we might modify the request
        // to tell the agent to output Action-Only, or reject it.
        // For 'Router' phase, we just log it. The Agent Router will decide outcome.
        logger.warn(`Regime ${currentRegime} active. Narrative suppressed.`, trace_id, 'RegimeGuard');
    }

    logger.info(`Regime Computed: ${currentRegime}`, trace_id, 'RegimeGuard');
    next();
};
