import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const allowedOrigins = (process.env.CORS_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);

export const securityMiddleware: RequestHandler = (req, res, next) => {
  next();
};

export function applySecurity(app: any) {
  // Basic secure headers
  app.use(helmet({
    contentSecurityPolicy: false // customize CSP in production settings if needed
  }));

  // CORS with whitelist
  if (allowedOrigins.length) {
    app.use(cors({
      origin: (origin: any, cb: any) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      credentials: true
    }));
  } else {
    app.use(cors({ origin: true, credentials: true }));
  }

  // Rate limiting
  app.use(rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false
  }));

  // WAF placeholder: add WAF checks or integrate cloud WAF (Cloud Armor, Cloudflare)
  app.use((req: any, res: any, next: any) => {
    // Example: block suspicious UA or call pattern
    const ua = req.get('user-agent') || '';
    if (ua.includes('sqlmap') || ua.includes('nikto')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  });
}

