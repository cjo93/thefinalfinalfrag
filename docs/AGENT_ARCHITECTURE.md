# AGENT ARCHITECTURE & CAPABILITY MAP
*Project: DEFRAG Daily*

## Vision
To transform the codebase from a set of static scripts into a living, "breathing" system where autonomous agents actively manage stability, user experience, and content generation.

---

## 1. The Autonomous Core (Agent Layer)

We will implement a `src/agents/` architecture that runs in parallel with the main application.

### A. System Agents (Stability & Ops)
*Running on backend boot or triggered via workflows.*

*   **`StripeAdminAgent`**:
    *   **Goal**: Ensure payment integrity.
    *   **Capabilities**:
        *   Verify active products against `frontend/src/config/products.ts`.
        *   Auto-generate products if missing (Stripe MCP).
        *   Reconcile "broken" subscriptions.
    *   **Workflow**: `verify_stripe_products`

*   **`EnvironmentDoctor`**:
    *   **Goal**: Zero-friction setup.
    *   **Capabilities**:
        *   Check for missing API keys (`REPLICATE`, `STRIPE`, `OPENAI`).
        *   Validate database connectivity (Firestore init).
        *   Auto-create `.env` from `.env.example` if missing.
    *   **Workflow**: `doctor_check`

### B. Creative Agents (Generative)
*Triggered by user actions or daily cron jobs.*

*   **`MandalaAgent` (Enhanced)**:
    *   **Goal**: Infinite visual novelty.
    *   **Capabilities**:
        *   Construct prompts based on user's astrological data (Bressloff-Jung Framework).
        *   Call Replicate API to generate textures.
        *   Optimize assets (convert to webp/glb) and upload to storage.
    *   **Workflow**: `generate_daily_mandala` (Cron)

*   **`VoiceSynthesisAgent`**:
    *   **Goal**: High-fidelity audio briefings.
    *   **Capabilities**:
        *   Convert daily text briefings into audio (ElevenLabs/OpenAI Audio).
        *   Mix in ambient "binaural" background tracks dynamically.
    *   **Workflow**: `synthesize_briefing`

### C. Simulation Agents (Logic & Physics)
*Running during development/testing.*

*   **`VectorDynamicsAgent`**:
    *   **Goal**: Verify "FamilyAntigravityCube" physics.
    *   **Capabilities**:
        *   Spawn thousands of virtual entities with random relationship scores.
        *   Run the force-directed graph algorithm.
        *   Assert checks: "Do nodes explode?", "Do they overlap?", "Is the layout aesthetic?".
    *   **Workflow**: `simulate_family_physics`

---

## 2. Recommended Implementation Plan

### Phase 1: Foundation (Immediate)
1.  **Stripe Workflow**: Implement `verify_stripe_products` workflow using MCP.
2.  **Product Sync**: Create `StripeAdminAgent` to execute the logic found in `init_stripe_products.ts` but exposed as a callable tool.

### Phase 2: Creation (Next 2 Days)
1.  **Mandala Automator**: Connect `MandalaAgent` to Replicate.
2.  **Voice Agent**: Implement `VoiceSynthesisAgent` in `src/agents/VoiceAgent.ts` (currently a placeholder in frontend).

### Phase 3: Simulation (Next 4 Days)
1.  **Vector Engine**: Build the `VectorDynamicsAgent` to stress-test the math in `src/core/vector-engine.ts`.
2.  **User Simulator**: Create "Ghost Users" that sign up, pay, and interact to test the full funnel.

---

## 3. Technology Stack Additions
*   **MCP Servers**:
    *   `stripe`: For payment ops.
    *   `filesystem`: For asset management (local).
    *   `postgres/firestore` (Custom): For direct DB manipulation.
*   **Libraries**:
    *   `replicate`: For image gen.
    *   `three-headless`: For server-side vector simulation (optional).

---
*Architected by Antigravity*
