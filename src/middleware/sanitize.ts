import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const sanitizeShareInput = [
    body('content').trim().escape().isLength({ max: 10000 }),
    body('expiresAt').optional().isISO8601(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                details: errors.array()
            });
        }
        next();
    }
];

export const sanitizeTerminalInput = [
    body('command').trim().isLength({ max: 500 }),
    body('args').optional().isArray({ max: 10 }),
    body('args.*').trim().escape(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                details: errors.array()
            });
        }
        next();
    }
];

export const sanitizeSimulationInput = [
    body('familyData').isObject(),
    body('familyData.members').isArray({ min: 2, max: 20 }),
    body('familyData.members.*.name').trim().escape().isLength({ min: 1, max: 100 }),
    body('familyData.members.*.birthDate').isISO8601(),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                details: errors.array()
            });
        }
        next();
    }
];
