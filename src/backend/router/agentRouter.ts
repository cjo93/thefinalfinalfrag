import express, { Router, Request, Response } from 'express';
import { validateEnvelope } from '../middleware/validatePayload';
import { enforceRegistry } from '../middleware/enforceRegistry';
import { enforceRegime } from '../middleware/enforceRegime';
import { enforceEntitlement } from '../middleware/enforceEntitlement';
import { logger } from '../observability/logger';
import { applyToneGate } from '../middleware/toneSafetyGate';
import regimes from '../../../spec/regimes.json';

// Services
import { DiagnosticsLogService } from '../../services/DiagnosticsLogService';
import { ChatSessionService } from '../../services/ChatSessionService';
import { invokeAgent } from './agentDispatch'; // Adapter Import

const router = Router();

// --- ROUTER CHAIN ---
router.post(
    '/dispatch',
    validateEnvelope,    // 1. Zod Schema Check
    enforceRegistry,     // 2. Registry Capability Check
    enforceRegime,       // 3. Compute System State
    enforceEntitlement,  // 4. Check User Credits
    async (req: Request, res: Response) => {
        const { sourceAgent, targetAgent, payload, trace_id, session_id } = req.body;
        const start = Date.now();
        const regimeName = (req as any).regime || "NOMINAL";

        // --- DIAGNOSTICS: REQUEST ---
        DiagnosticsLogService.logEvent({
            trace_id,
            timestamp: new Date().toISOString(),
            event_type: 'agent_request',
            user_id: req.body.user_id, // Assuming in body or injected by auth
            payload_summary: { source: sourceAgent, target: targetAgent }, // Redacted logic here
            regime: regimeName
        });

        logger.info(`Dispatch: ${sourceAgent} -> ${targetAgent}`, trace_id, 'Router', { regime: regimeName });

        // --- SESSION VALIDATION (If Applicable) ---
        if (session_id) {
            const session = await ChatSessionService.getSession(session_id);
            if (!session || session.status !== 'ACTIVE' || session.remaining_credits <= 0) {
                logger.warn(`Dispatch BLOCKED: Invalid Session ${session_id}`, trace_id, 'Router');
                DiagnosticsLogService.logEvent({
                    trace_id,
                    timestamp: new Date().toISOString(),
                    event_type: 'error',
                    user_id: req.body.user_id,
                    payload_summary: { error: 'Session Expired/Exhausted' }
                });
                return res.status(402).json({
                    code: "ENTITLEMENT_EXHAUSTED",
                    message: "Session expired or credits exhausted.",
                    trace_id
                });
            }
        }

        // --- REGIME GATING ---
        const regimeSpec = regimes.regimes.find((r: any) => r.name === regimeName);
        if (regimeSpec && !regimeSpec.narrativeAllowed) {
            // IF regime forbids narrative (e.g. HIGH_LATENCY or SHUTDOWN)
            // RETURN "HOLD" immediately
            logger.warn(`Dispatch HALTED by Regime ${regimeName}`, trace_id, 'Router');

            // Log HOLD
            DiagnosticsLogService.logEvent({
                trace_id,
                timestamp: new Date().toISOString(),
                event_type: 'hold',
                user_id: req.body.user_id,
                regime: regimeName,
                payload_summary: { reason: regimeSpec.holdMessage }
            });

            if (session_id) await ChatSessionService.holdSession(session_id);

            return res.json({
                status: "HOLD",
                reason: regimeSpec.holdMessage || "System stabilizing.",
                retryAfterMs: 5000,
                uiMode: regimeSpec.uiMode
            });
        }

        try {
            let result;

            // --- AGENT DISPATCH ---
            // Using Adapter Pattern (Standardized via agentDispatch.ts)
            result = await invokeAgent(targetAgent, payload, {
                trace_id,
                userId: req.body.user_id,
                regime: regimeName
            });

            // --- TONE SAFETY GATE (Post-Processing) ---
            // If output contains text, apply Antigravity Tone
            if (result && result.insights && Array.isArray(result.insights)) {
                result.insights = result.insights.map((txt: string) => applyToneGate(txt));
            }
            if (result && result.message && typeof result.message === 'string') {
                result.message = applyToneGate(result.message);
            }

            // --- SESSION DECREMENT (If Success) ---
            if (session_id) {
                await ChatSessionService.decrementCredit(session_id, 1);
            }

            const latency = Date.now() - start;
            logger.info(`Dispatch Success (${latency}ms)`, trace_id, 'Router');

            // Log Response
            DiagnosticsLogService.logEvent({
                trace_id,
                timestamp: new Date().toISOString(),
                event_type: 'agent_response',
                user_id: req.body.user_id,
                metrics_snapshot: { latency },
                entitlement_delta: session_id ? -1 : 0
            });

            // Standardize Response
            res.json({
                schemaVersion: "1.0.0",
                trace_id,
                timestamp: new Date().toISOString(),
                sourceAgent: targetAgent,
                targetAgent: sourceAgent, // Reply back
                payload: result
            });

        } catch (err: any) {
            logger.error(`Dispatch Failed: ${err.message}`, trace_id, 'Router');

            DiagnosticsLogService.logEvent({
                trace_id,
                timestamp: new Date().toISOString(),
                event_type: 'error',
                user_id: req.body.user_id,
                payload_summary: { error: err.message }
            });

            res.status(500).json({
                code: "INTERNAL_ERROR",
                message: "Agent processing failed",
                trace_id
            });
        }
    }
);

export default router;
