export interface AgentRunnable {
    name: string;
    // Standard run method for router dispatch
    run(payload: unknown, ctx?: { trace_id: string; userId?: string; tier?: string; regime?: any }): Promise<any>;
}
