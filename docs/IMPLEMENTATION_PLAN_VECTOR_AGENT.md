# Implementation Plan: Vector Dynamics Agent

## Goal
Implement the `VectorDynamicsAgent` to simulate and stress-test the `FamilyAntigravityCube` physics and `vector-engine.ts` logic. This agent will run simulations to verify system stability and generate "Ghost" data for development.

## Proposed Changes

### Backend (Node.js)
#### [NEW] [src/agents/VectorDynamicsAgent.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/agents/VectorDynamicsAgent.ts)
-   **Class**: `VectorDynamicsAgent` extends `Agent`
-   **Capabilities**:
    -   `simulatePopulation(size: number)`: Spawn N mock users with random vectors.
    -   `runPhysicsLoop(iterations: number)`: Apply forces (gravity, connection, repulsion).
    -   `assertStability()`: Check for NaN, explosions (coords > 100), or collapse (all at 0,0,0).
-   **Tools**: Uses `src/core/vector-engine.ts`.

#### [MODIFY] [src/agents/instances.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/agents/instances.ts)
-   Export the new `vectorAgent`.

#### [MODIFY] [src/index.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/index.ts)
-   Register `VectorDynamicsAgent`.

### API Exposure
#### [NEW] [src/routes/simulation.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/routes/simulation.ts)
-   `POST /api/simulation/run`: Triggers the agent simulation.
-   `GET /api/simulation/stats`: Returns last simulation metrics.

## Verification Plan
1.  **Unit Test**: Run a 100-node simulation via `ts-node`.
2.  **API Test**: `curl` the simulation endpoint and check response stats.
