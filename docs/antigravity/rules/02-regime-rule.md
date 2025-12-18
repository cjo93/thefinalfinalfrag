# Workspace Rule: Operating Regime Classifier

## Objective
Define a finite set of Operating Regimes that govern:
- what the system is allowed to output
- which agent(s) may run
- what UI mode to render
- whether to hold/suppress narrative

## Required Deliverables
/spec/regimes.json
/spec/schemas/regime-output.schema.json

## Constraints
- Regimes must be mutually distinguishable by metrics.
- Regime computation happens BEFORE Node C narrative.
- Include HOLD / SILENCE regimes and retry conditions.
