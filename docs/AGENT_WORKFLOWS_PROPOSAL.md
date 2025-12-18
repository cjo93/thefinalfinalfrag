# Agent Workflows & MCP Enhancements Proposal

## Overview
To accelerate the build of **DEFRAG Daily**, we propose integrating autonomous agent workflows and leveraging MCP (Model Context Protocol) connections. These enhancements focus on automating routine tasks, generating assets, and managing external services directly from the development environment.

## 1. MCP Connections

### Stripe MCP (Available)
**Goal**: Streamline payment & subscription testing.
- **Workflow**: `verify_subscription_products`
  - *Description*: Automatically fetches active products from Stripe and cross-references them with `frontend/src/config/products.ts`.
  - *Benefit*: Prevents "Product Not Found" errors in production.
  - *Autonomous Action*: If a product is missing locally, the agent can generate the TypeScript definition for it.

### Suggestion: Database/Firestore MCP
**Goal**: Direct manipulation of user states.
- **Current State**: Using `firebase-admin` directly.
- **Enhancement**: Create a custom MCP server or use a generic "Database" agent to allows natural language queries like "Reset user X's mandala state" without writing one-off scripts.

## 2. Autonomous Generative Features

### Asset Generation Agent (Replicate)
**Status**: `REPLICATE_API_TOKEN` is currently missing.
**Goal**: Pre-generate high-fidelity assets.
- **Workflow**: `generate_daily_assets`
- **Trigger**: New "Theme" added to configuration.
- **Action**:
    1. Agent reads the theme description.
    2. Uses `MandalaAgent` to prompt Replicate.
    3. Saves resulting glb/png files to `public/assets/generated`.
    4. Updates the asset manifest.

### Family System Simulator
**Goal**: Stress test the `FamilyAntigravityCube`.
- **Workflow**: `simulate_family_dynamics`
- **Action**:
    - Agent spawns 10 virtual "family members" with randomized psychological profiles.
    - Runs the `FamilySystemAgent` to calculate their vectors.
    - Verifies that no vectors result in `NaN` or visual collisions.
    - Reports "Stability Score" of the algorithm.

## 3. Developer Experience Workflows

### Environment Doctor
**Goal**: Fix missing configurations (e.g., `REPLICATE_API_TOKEN` warning).
- **Workflow**: `check_env`
- **Action**:
    - Scans `src/index.ts` and agents for `process.env` usage.
    - Checks `.env` for existence.
    - *Proactive*: If a key is missing, prompts the user to provide it or loads it from a secure vault.

## Implementation Roadmap

1.  **Immediate**: Fix `REPLICATE_API_TOKEN` in `.env`.
2.  **Short-term**: Implement `verify_subscription_products` using Stripe MCP.
3.  **Mid-term**: Create the `simulate_family_dynamics` test script.

---
*Created by Antigravity Agent*
