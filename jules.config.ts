// import type { JulesConfig } from '@google/jules-sdk'; // Hypothetical SDK

const config: any = {
  project: {
    id: 'defrag-daily',
    region: 'us-central1',
    environment: process.env.NODE_ENV || 'development',
  },
  ai: {
    defaultModel: 'gemini-2.0-flash',
    apiKey: process.env.GOOGLE_AI_API_KEY,
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

export default config;
