/**
 * API Configuration
 * Centralized API URL management for DEFRAG.
 * Automatically switches between Development (localhost) and Production (Live).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const API_ENDPOINTS = {
    // Core
    INIT: `${API_BASE_URL}/api/users/init`,
    HEALTH: `${API_BASE_URL}/api/system/health`,

    // Intelligence
    MANDALA_GENERATE: `${API_BASE_URL}/api/mandala/generate`,
    SIMULATE: `${API_BASE_URL}/api/simulation/run`,
    COSMIC_VECTORS: `${API_BASE_URL}/api/simulation/cosmic/live-vectors`,
    ANALYZE: `${API_BASE_URL}/api/simulation/analyze`,
    VOICE_SYNTHESIZE: `${API_BASE_URL}/api/voice/synthesize`,
    CHAT: `${API_BASE_URL}/api/terminal/chat`,

    // Terminal / Logs
    TIMELINE_LOG: `${API_BASE_URL}/api/terminal/timeline/log`,
    TIMELINE_EVENTS: (userId: string) => `${API_BASE_URL}/api/terminal/timeline/${userId}`,
    TOPOLOGY: (userId: string) => `${API_BASE_URL}/api/terminal/topology/${userId}`,
    KNOWLEDGE: (key: string) => `${API_BASE_URL}/api/terminal/knowledge/${key}`,

    // Payments / Monetization
    CHECKOUT: `${API_BASE_URL}/api/payment/checkout`,
    CHECKOUT_STATUS: (sessionId: string) => `${API_BASE_URL}/api/payment/checkout-status/${sessionId}`,
    WALLET_GENERATE: `${API_BASE_URL}/api/wallet/generate-pass`,

    // Share
    SHARE_CREATE: `${API_BASE_URL}/api/share/create`,
    SHARE_GET: (id: string) => `${API_BASE_URL}/api/share/${id}`,
    THERAPIST_SHARE: `${API_BASE_URL}/api/therapist/share`,

    // Export
    EXPORT_PDF: `${API_BASE_URL}/api/export/deep-dive-pdf`
};
