# Workspace Rule: DEFRAG Production System Contract

## Objective
Upgrade DEFRAG agent swarm to 100% production readiness:
- Deterministic routing
- Versioned schemas + traceability
- Regime classification
- Silence/hold semantics
- Hard validation + safe failure
- Observability (logs/metrics/traces)
- Security + PII handling
- Frontend AI interaction layer integrated via controlled endpoints (not freeform chat)

## Non-Negotiables
1. All inter-agent messages MUST conform to a versioned JSON schema.
2. Every message MUST contain: schemaVersion, trace_id, sourceAgent, targetAgent, timestamp.
3. Agents MUST fail fast on missing/invalid fields with typed errors.
4. Agents MUST be constrained by a canonical Agent Registry (declared capabilities).
5. A global Operating Regime MUST be computed before narrative generation.
6. Agents MAY return HOLD (silence) with retry conditions.
7. No agent may “invent” missing upstream state. If missing, request it.

## Output Requirements
Produce:
- /spec/agent-registry.json (canonical registry)
- /spec/schemas/*.json (JSON Schemas)
- /spec/regimes.json (regime definitions + thresholds)
- /backend/middleware/validation.ts (or python equivalent) enforcing schemas
- /backend/observability/* (trace + metrics + logs)
- /frontend/ai/* (controlled interaction layer)
- /docs/production-handoff.md (single authoritative handoff doc)

## Tone/Style
Engineering-grade. No mysticism. No narrative unless it is explicitly part of Node C deliverables.
