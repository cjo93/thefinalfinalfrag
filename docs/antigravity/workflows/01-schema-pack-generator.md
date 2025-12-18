# Workflow: Schema Pack Generator

## Objective
Produce a complete schema pack under /spec/schemas with:
- envelope.schema.json
- error.schema.json
- hold.schema.json
- regime-output.schema.json
- analyst-agent.schema.json
- vector-dynamics-agent.schema.json
- family-system-agent.schema.json

## Requirements
- All schemas must be strict (no additionalProperties unless justified).
- schemaVersion must be required.
- trace_id must be required and propagated.

## Output
- schemas + examples under /spec/examples/
