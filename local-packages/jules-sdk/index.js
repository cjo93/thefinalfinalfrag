class JulesAgent {
    constructor(config) {
        this.name = config.name;
        this.config = config;
        console.log(`[JulesSDK] \u2705 Agent Initialized: ${config.name}`);
    }
}

module.exports = {
    JulesAgent,
    JulesConfig: {}
};
