"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    project: {
        id: 'defrag-daily',
        region: 'us-central1',
        environment: process.env.NODE_ENV || 'development',
    },
    ai: {
        defaultModel: 'gemini-2.0-flash',
        apiKey: process.env.GEMINI_API_KEY,
        caching: {
            enabled: true,
            defaultTtl: 3600, // 1 hour
            maxCacheSize: '1GB',
        },
        rateLimiting: {
            tokensPerMinute: 1000000,
            requestsPerMinute: 600,
        }
    },
    agents: {
        dir: './src/agents',
        autoRegister: true,
    },
};
exports.default = config;
