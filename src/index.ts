/**
 * DEFRAG Daily - Jules/Antigravity Implementation
 * Main Entry Point & API Server
 */

import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env.validator';

// Add at top of file, before any other imports
validateEnv();

import express from 'express';
import cors from 'cors';

import julesConfig from '../jules.config';
import antigravityConfig from '../antigravity.config';

// Import Agents
import { authAgent } from './agents/AuthAgent';
import { hrvAgent } from './agents/HRVAgent';
import { briefingAgent } from './agents/BriefingAgent';
// Updated import for MandalaAgent (Class based singleton)
import { mandalaAgent, voiceAgent, vectorAgent, envDoctorAgent } from './agents/instances';
import { familySystemAgent } from './agents/FamilySystemAgent';
import { paymentAgent } from './agents/PaymentAgent';
import { therapistAgent } from './agents/TherapistSharingAgent';
import { costAgent } from './agents/CostTrackingAgent';
import { errorAgent } from './agents/ErrorHandlingAgent';
import { migrationAgent } from './agents/MigrationAgent';
import { archivalAgent } from './agents/ArchivalAgent';

// Middleware
import { globalLimiter } from './middleware/rateLimiter';

// Routes
// Routes
import mandalaRouter from './routes/mandala';
import paymentRoutes from './routes/payment';
import { terminalRoutes } from './routes/terminal';
import voiceRouter from './routes/voice'; // [NEW]
import simulationRouter from './routes/simulation'; // [NEW]
import healthRouter from './routes/health'; // [NEW]
import { shareRoutes } from './routes/share';
import usersRouter from './routes/users'; // [NEW]
import cosmicRouter from './routes/cosmic'; // [NEW]
// import integrationsRouter from './routes/integrations'; // [DEPRECATED]
import exportRouter from './routes/export'; // [NEW] Phase 11
import cronRouter from './routes/cron'; // [NEW] T2-2

console.log('Initializing DEFRAG Daily on Jules/Antigravity...');

const agents = [
    authAgent,
    hrvAgent,
    briefingAgent,
    mandalaAgent,
    voiceAgent,
    vectorAgent, // Added based on snippet
    envDoctorAgent, // [NEW]
    familySystemAgent,
    paymentAgent,
    therapistAgent,
    costAgent,
    errorAgent,
    migrationAgent,
    archivalAgent
];

console.log(`Loaded ${agents.length} agents.`);
console.log('Project:', julesConfig.project.id);

// Start Express Server
const app = express();
const PORT = process.env.PORT || 3002; // Avoid 3000 (React), 3001 (Vite HMR usually), and 8000 (FastAPI)

const allowedOrigins = [
    'https://defrag.app',
    'https://www.defrag.app',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // React default
    'http://localhost:3002'  // Self (sometimes needed for proxies)
];

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret']
}));

app.use('/api', globalLimiter);

// The Stripe webhook endpoint must receive the raw body for signature verification.
// Skip JSON parsing for that route while keeping it for all others.
const jsonMiddleware = express.json();
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
        return next();
    }
    return jsonMiddleware(req, res, next);
});

// import walletRouter from './routes/wallet';
import webhookRouter from './routes/payments/webhook';

import defragChatRouter from './routes/defragChat'; // [NEW] Backend Hardening

// Routes
app.use('/api/mandala', mandalaRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/voice', voiceRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/system', healthRouter);
app.use('/api/cosmic', cosmicRouter);
// app.use('/api/integrations', integrationsRouter);
app.use('/api/export', exportRouter);
app.use('/api/cron', cronRouter); // [NEW] T2-2
app.use('/api/defrag-chat', defragChatRouter); // [NEW] Perplexity Proxy

// Alias legacy /health
app.get('/health', (req, res) => res.redirect('/api/system'));
app.use('/api/share', shareRoutes);
app.use('/api/users', usersRouter);
// app.use('/api/wallet', walletRouter); // [DEPRECATED]
app.use('/api/payments', webhookRouter);

const start = async () => {
    // Run Environment Doctor
    const report = await envDoctorAgent.checkHealth();
    if (report.status === 'CRITICAL') {
        console.error("❌ CRITICAL SYSTEM ISSUES DETECTED. See logs above.");
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Mandala Endpoint: http://localhost:${PORT}/api/mandala/:userId`);
    });
};

start().catch(console.error);
