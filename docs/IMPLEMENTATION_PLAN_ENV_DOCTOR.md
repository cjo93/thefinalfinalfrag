# Implementation Plan: Environment Doctor Agent

## Goal
Implement the `EnvironmentDoctorAgent` to ensure zero-friction setup by validating the runtime environment and providing actionable feedback on missing configuration.

## Proposed Changes

### Backend (Node.js)
#### [NEW] [src/agents/EnvironmentDoctorAgent.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/agents/EnvironmentDoctorAgent.ts)
-   **Class**: `EnvironmentDoctorAgent` extends `Agent`
-   **Capabilities**:
    -   `checkHealth()`: Scans `process.env`.
    -   `validateKeys(requiredKeys: string[])`: Returns missing keys.
    -   `diagnoseConnectivity()`: A simple ping to external services (if keys exist).
    -   `report()`: Returns a JSON health report.

#### [MODIFY] [src/agents/instances.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/agents/instances.ts)
-   Export `envDoctorAgent`.

#### [MODIFY] [src/index.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/index.ts)
-   Register `EnvironmentDoctorAgent`.
-   **Auto-Run**: Call `envDoctorAgent.checkHealth()` on server boot and log warnings if critical keys are missing, but *do not* crash the server (allow mock modes).

### API Exposure
#### [NEW] [src/routes/health.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/routes/health.ts)
-   Refactoring existing `/health` to use the new agent.
-   `GET /api/system/status`: Detailed report from the Doctor.

## Verification Plan
1.  **Boot Test**: Restart server and observe "Doctor" logs.
2.  **API Test**: `curl /api/system/status` to see the JSON report.
