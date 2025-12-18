// Local Mock SDK for Development
export class JulesAgent {
    name: string;
    constructor(config: any) {
        this.name = config.name;
        console.log(`[MockSDK] Agent '${config.name}' initialized.`);
    }
}

export const JulesConfig = {};
export const AntigravityConfig = {};
