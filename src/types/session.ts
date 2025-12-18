export interface ChatSession {
    session_id: string;
    user_id: string;
    entitlement_id?: string; // Stripe Subscription ID or One-time Purchase ID
    start_time: string;
    expires_at: string;
    remaining_credits: number; // or minutes
    status: 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED';
    current_regime: string;
    context_stack: string[]; // IDs of recent missing fields or active questions
}
