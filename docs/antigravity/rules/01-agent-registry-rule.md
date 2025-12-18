# Workspace Rule: Canonical Agent Registry

## Objective
Create a machine-readable registry that defines:
- agent name
- domain
- allowedInputs
- allowedOutputs
- forbiddenOutputs
- escalationTargets
- timeouts
- maxTokens (if applicable)
- safety constraints

## Required Deliverable
/spec/agent-registry.json

## Constraints
- If an agent attempts to output forbidden data, the system must reject it.
- Routing must validate that targetAgent supports the requested task and schema.
- Registry MUST be versioned (agentRegistryVersion).

## Output Format
JSON only.
