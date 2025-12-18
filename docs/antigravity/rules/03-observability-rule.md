# Workspace Rule: Observability + Auditability

## Objective
Implement production observability:
- structured logs
- traces by trace_id
- metrics for agent latency, error rates, hold rates
- replayable events

## Required Deliverables
/backend/observability/logger.*
/backend/observability/tracer.*
/backend/observability/metrics.*

## Constraints
- No PII in logs unless explicitly redacted.
- All agent handoffs emit a trace span.
- Store validation failures as structured events.
