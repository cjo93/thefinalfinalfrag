import { Request, Response, NextFunction } from 'express';
// import { getUserSubscription } from '../../services/billing'; // Mock for now
import { logger } from '../observability/logger';

export const enforceEntitlement = async (req: Request, res: Response, next: NextFunction) => {
    // In production, this would check Stripe status via DB
    // Sub Guard:
    // const user = req.user;
    // if (!user.hasActiveSub) ...

    // For now, assume open or handled by existing 'subscription.guard.ts'
    // This file acts as the specific "Chat Turn" decrementer if we move to usage-based.

    // const trace_id = req.body.trace_id;
    // logger.info("Checking Entitlement...", trace_id, "EntitlementGuard");

    next();
};
