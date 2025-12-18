export interface DiagnosticsEvent {
    trace_id: string;
    timestamp: string;
    event_type: 'agent_request' | 'agent_response' | 'hold' | 'error' | 'entitlement_check' | 'purchase_applied';
    user_id?: string;
    payload_summary?: Record<string, any>; // Redacted/minimal
    regime?: string;
    metrics_snapshot?: {
        latency: number;
        entropy?: number;
    };
    entitlement_delta?: number;
}
