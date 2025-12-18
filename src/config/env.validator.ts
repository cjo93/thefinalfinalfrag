import { z } from 'zod';

const envSchema = z.object({
    // Firebase
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_PRIVATE_KEY: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),

    // Antigravity
    ANTIGRAVITY_ENDPOINT: z.string().url().optional().default('http://localhost:3002'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

    // AI Services
    REPLICATE_API_TOKEN: z.string().min(1),
    ELEVENLABS_API_KEY: z.string().min(1),
    GOOGLE_AI_API_KEY: z.string().min(1),

    // JWT
    JWT_SECRET: z.string().min(32),

    // Environment
    NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const validateEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Environment validation failed:', error);
        process.exit(1);
    }
};
