# Workflow: Frontend AI Interaction Layer Integration

## Objective
Integrate a front-end AI layer that interacts with users safely and deterministically.

## Hard Constraint
Frontend AI is NOT a freeform chatbot.
It is a controlled "Operator Console" that:
- collects inputs
- displays regime + diagnostics
- asks structured follow-up questions
- triggers synthesis endpoints
- renders outputs in bounded templates

## Tasks
1) Define UI interaction contracts:
   - "Question" objects (required fields, choices)
   - "User response" objects
2) Create a Frontend Orchestrator module:
   - calls backend /api/synthesis/generate
   - handles typed errors (missing_field, invalid_schema)
   - handles HOLD responses (show stabilization UX)
3) Add a "Conversation History" store:
   - minimal + redacted
   - timestamped
   - trace_id attached
4) Add "Regime-aware UI":
   - COHERENT_THROUGHPUT => allow insight
   - THIN_STACK_OVERCOUPLED => show regulation first
   - HIGH_RECIRCULATION => show loop-break protocol
5) Provide a set of UI prompts (bounded) for the assistant layer

## Output
- /frontend/ai/contracts.ts
- /frontend/ai/orchestrator.ts
- /frontend/ai/regime-ui-map.ts
- /frontend/ai/prompt-templates.ts
- /docs/frontend-ai.md
