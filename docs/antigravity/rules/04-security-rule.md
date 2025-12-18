# Workspace Rule: Security & Data Handling

## Objective
Lock production security posture:
- authN/authZ
- tier gating
- payload encryption if stored
- PII minimization and redaction

## Required Deliverables
/docs/security-model.md
/backend/security/*

## Constraints
- Subscription tier rules must be enforced server-side.
- Explicit deny lists for any unsafe outputs (medical/legal certainty, prediction claims, etc).
- All persisted user artifacts must be keyed by userId and access controlled.
