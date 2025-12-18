# Defrag Daily - Agent Swarm Documentation

The Defrag Daily "Mind" is composed of a swarm of specialized AI Agents. Each agent is responsible for a specific domain of the user's psychological or systemic processing.

## Agent Architecture
All agents extend the base `Agent` or `JulesAgent` class and operate asynchronously. They are orchestrated by the main Express server and interact via shared state in Firestore.

## Core Agents

### 1. Family System Agent (`FamilySystemAgent`)
**Role**: Analyzing and managing the user's family system dynamics.
- **Model**: `gemini-2.0-flash`
- **Capabilities**:
    - `addFamilyMember`: Adds a new member to the user's system.
    - `updateFamilyMemberRole`: Changes the role (e.g., "Mother", "Shadow Figure").
    - `analyzeFamilySystem`: Runs a full analysis of the system's structure.
    - `calculateVectors`: Computes the 3D position of members relative to the Self.
    - `updateIntegrationScore`: Calculates the overall system health.

### 2. Schema Agent (`SchemaAgent`)
**Role**: A cognitive processing unit that integrates fragmented mental schemas.
- **Goal**: Detect redundancies and calculate "Coherence" in the user's mental map.
- **Key Method**: `integrateSchema(schema: SchemaObject)`
- **Logic**:
    1.  **Redundancy Detection**: Merges nodes with similar content or affect weight.
    2.  **Edge Rebuilding**: Reconnects edges after merging nodes.
    3.  **Coherence Calculation**:
        - `Valence Ratio`: Ratio of positive to total edges.
        - `Fragmentation Penalty`: Penalty for unconnected nodes.
        - `Score` = `Valence * (1 - Fragmentation)`.

### 3. Cosmic/Vector Agent
**Role**: Handles vector dynamics and potentially astrological data integration.
- **Function**: Calculates the "Physics" of the family cube (Attraction, Repulsion, Orbit).

### 4. Mandala Agent (`MandalaAgent`)
**Role**: Artistic synthesis of user state.
- **Input**: User's current emotional state and "Schema" data.
- **Output**: A generative image prompt sent to Replicate (Flux/SDXL).
- **Endpoint**: `/api/mandala/:userId`

### 5. Environment Doctor (`EnvDoctorAgent`)
**Role**: Self-healing and diagnostics.
- **Function**: Checks environment variables, database connectivity, and API keys on startup.
- **Status**: Critical for deployment health.

## Integration Flow

1.  **Signal**: User input (e.g., "I felt angry at my Dad today").
2.  **Vector Update**: `FamilySystemAgent` updates "Dad" vector (moves closer/further or changes color).
3.  **Schema Update**: `SchemaAgent` updates the mental graph.
4.  **Visual Feedback**: `MandalaAgent` generates a new image representing the shift.
