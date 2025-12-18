import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request } from 'express';

const useRedis = process.env.USE_REDIS === 'true';
const redis = useRedis ? new Redis(process.env.REDIS_URL || 'redis://localhost:6379') : null;

// Helper to get store
const getStore = (prefix: string) => {
    if (useRedis && redis) {
        return new RedisStore({
            // @ts-expect-error - Redis client type mismatch between ioredis and rate-limit-redis
            sendCommand: (...args: string[]) => redis.call(...args),
            client: redis,
            prefix: prefix
        });
    }
    return undefined; // Defaults to MemoryStore
};

// Define interface locally to ensure type safety if global declaration is missed
interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
    };
}

// Global rate limit: 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    store: getStore('rl:global:'),
    windowMs: 15 * 60 * 1000,
    max: 100,
    // Use default keyGenerator which handles IP safely
    validate: { ip: false },
    skip: (req) => {
        const ip = req.ip;
        return ip === '::1' || ip === '127.0.0.1' || process.env.NODE_ENV === 'development';
    },
    message: {
        error: 'ACCESS_THROTTLED',
        message: 'Too many requests. System coherence restoration in progress.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Tier-based rate limits
export const tierLimiter = (tier: 'observer' | 'operator' | 'architect') => {
    const limits = {
        observer: { windowMs: 60 * 60 * 1000, max: 20 },     // 20/hour
        operator: { windowMs: 60 * 60 * 1000, max: 100 },    // 100/hour
        architect: { windowMs: 60 * 60 * 1000, max: 1000 }   // 1000/hour
    };

    return rateLimit({
        store: getStore(`rl:${tier}:`),
        windowMs: limits[tier].windowMs,
        max: limits[tier].max,
        keyGenerator: (req: Request) => {
            const authReq = req as AuthenticatedRequest;
            return authReq.user?.uid || "anonymous";
        },
        validate: { ip: false },
        message: {
            error: 'TIER_LIMIT_EXCEEDED',
            message: `${tier.toUpperCase()} tier limit reached. Upgrade for higher throughput.`,
            upgradeUrl: 'https://defrag.app/pricing'
        }
    });
};

// Expensive operation limits (Mandala generation)
export const expensiveLimiter = rateLimit({
    store: getStore('rl:expensive:'),
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req: Request) => {
        const authReq = req as AuthenticatedRequest;
        return authReq.user?.uid || "anonymous";
    },
    validate: { ip: false },
    message: {
        error: 'GENERATION_LIMIT_EXCEEDED',
        message: 'Mandala generation limit reached. Next window opens in 1 hour.',
        remainingTime: '60 minutes'
    }
});
