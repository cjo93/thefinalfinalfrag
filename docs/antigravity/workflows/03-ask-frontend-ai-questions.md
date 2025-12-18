# Workflow: Frontend AI Integration Questions + Design Options

You are the Antigravity Agent. You must propose production-grade options for integrating a frontend AI layer into DEFRAG.

## Context
DEFRAG is a multi-agent OS with strict schema handoffs and a regime classifier. We need a user-facing AI interaction layer that is safe, deterministic, and supports structured follow-ups.

## Deliverable
Return:
1) 3 frontend AI integration patterns (recommended + tradeoffs):
   - Pattern A: Guided Form + Agent Console
   - Pattern B: Hybrid Chat UI with strict function-call slots
   - Pattern C: Timeline-first UI with minimal conversational layer
2) For each pattern:
   - Required endpoints
   - Data contracts
   - How to handle HOLD + missing_field
   - How to keep the UI from becoming “therapy chat”
3) A proposed “Operator Interaction Protocol”:
   - question types
   - response validation
   - escalation rules (human handoff or lockouts)
4) A list of missing info you need from us, asked as explicit questions.

## Constraints
- No freeform assistant without schemas
- All user-visible output must be derived from validated system outputs
- No PII leakage via logs or prompts
- Tier gating must be enforced server-side

## Questions to ask us (required)
Ask me:
- What is the frontend stack (Next.js, React Native, etc.)?
- Do we store conversation history? If yes, where and how long?
- Do we support voice input?
- Which outputs are allowed for free tier vs Architect vs Sovereign?
- What biometric integrations exist today (Apple Watch/Oura etc.)?
