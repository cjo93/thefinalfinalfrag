import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'defrag-api'
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export function requestLogger(req: any, res: any, next: any) {
  const rid = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  res.setHeader('x-request-id', rid);
  req.log = logger.child({ req_id: rid, path: req.path, method: req.method });
  next();
}

