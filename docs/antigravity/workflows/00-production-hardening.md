# Workflow: Production Hardening Sprint

## Input
- Current repo structure
- Current agent list
- Existing endpoints (synthesis, topology, mandala, etc.)

## Tasks
1) Generate canonical agent registry
2) Generate JSON schemas for:
   - envelope schema (handoff base)
   - per-agent input/output
   - error schema
   - hold schema
   - regime schema
3) Implement runtime validators (middleware)
4) Implement router that:
   - validates message
   - checks registry capability
   - selects target agent
   - enforces regime gating
5) Add observability (logs/metrics/traces)
6) Add security enforcement (tier gating, PII redaction)
7) Produce a single production handoff document

## Output
- PR-ready file diffs
- A checklist of what was changed
- A test plan with sample payloads
