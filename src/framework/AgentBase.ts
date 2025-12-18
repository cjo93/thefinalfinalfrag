export interface AgentContext {
    config?: any;
    // Add other context fields if needed
}

export class Agent {
    name: string;
    context: AgentContext;

    constructor(name: string, context: AgentContext) {
        this.name = name;
        this.context = context;
        console.log(`[Agent] ${name} initialized.`);
    }
}
