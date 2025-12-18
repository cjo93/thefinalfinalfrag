# Defrag Daily - The Definitive Technical Manual

**Version:** 2.0.0 (Gold Master)
**Date:** 2025-12-16
**Status:** Production Ready

---

## 🌌 Introduction: The Psychological Operating System

**Defrag Daily** is not just a web app; it is a "Psychological Operating System" (PsyOS). It merges high-fidelity 3D visualization, Jungian depth psychology, and Agentic AI to help users "defragment" their psyche.

### The Philosophy
The internet fragmentizes attention (`Entropy`). Defrag Daily uses `Vector Dynamics` and `Systems Theory` to re-integrate the self (`Coherence`).
- **Aesthetic**: "Cyber-Jungian". A mix of high-tech command terminals (CLI) and ancient alchemical symbolism (Mandalas).
- **Core Metaphor**: The User is a "System Admin" debugging their own mind.

---

## 🎨 Part 1: Design System & Experience

The "Look and Feel" is critical to the user's suspension of disbelief. The interface behaves like a sentient machine.

### 1.1 Visual Language (Tailwind V4)
- **Palette**: Strictly curated for high contrast and "void" aesthetics.
    - **Obsidian (`#050505`)**: The background void. Not pure black, but deep matter.
    - **Tech Gold (`#E4E4E7`)**: Primary text and accents. Represents clarity/signal.
    - **Friction Red (`#FF3333`)**: Alerts, conflict vectors, and system errors.
    - **Bone (`#F2F0E4`)**: Organic elements, paper textures.
- **Typography**:
    - **Headers**: `Playfair Display` (Serif) - Represents tradition, academia, humanity.
    - **Data/UI**: `JetBrains Mono` (Monospace) - Represents the machine, raw data, truth.
    - **Esoteric**: `UnifrakturMaguntia` (Blackletter) - Represents the deep unconscious/archetypal.

### 1.2 Interactive Elements
- **Micro-Animations**: Uses `Framer Motion` for all transitions.
    - `pulse-slow`: breathing effect on alive elements.
    - `shimmer`: Loading states that look like data transmission.
- **Haptics**: While web-based, visual feedback (screen shake, glitch effects) mimics tactile response.

### 1.3 3D Environment (Three.js / R3F)
- **The Cube**: The central navigation artifact. Not a flat menu, but a spatial representation of the "Family System".
- **Rendering**: Uses post-processing (Bloom, Noise) to simulate a CRT or "Neural Link" display.

---

## 🏗 Part 2: Frontend Architecture

The frontend is a **React 19** Single Page Application (SPA) built with **Vite**. It is designed to be "Sovereign," meaning it holds significant logic client-side to ensure responsiveness.

### 2.1 State Management (`useSovereignStore`)
We use **Zustand** for global state. The `useSovereignStore` is the single source of truth.
- **`user`**: The current session, credentials, and subscription tier.
- **`system`**: The family graph (nodes/edges).
- **`ui`**: View state (ACTIVE_VIEW: 'ORBIT' | 'TERMINAL' | 'MANDALA').

```typescript
// Structure
interface SovereignState {
  user: UserProfile | null;
  familyMembers: LineageMember[];
  analysis: AnalysisResult | null;
  // Actions
  addMember: (member: LineageMember) => void;
  updateVector: (id: string, vector: Vector3) => void;
}
```

### 2.2 Component Hierarchy
- **`App.tsx`**: Roots the application, handles `SceneErrorBoundary`.
- **`QuantumScene.tsx`**: The R3F Canvas. Contains lights, camera, and the `FamilyAntigravityCube`.
- **`NeuralInterface.tsx`**: The 2D HUD overlay. Contains the "Terminal", "Chat", and "Settings".
- **`DirectUplink.tsx`**: The CLI component for power users (`> command_line_interface`).

### 2.3 Deep Integration (React <-> Three)
The 2D UI and 3D Scene communicate via the Store. When a user clicks a node in 3D (`FamilyAntigravityCube`), it triggers a selection event in the 2D store (`useSovereignStore`), opening the detail panel in `NeuralInterface`.

---

## ⚙️ Part 3: Backend Services

The backend is a **Node.js / Express** monolith designed as an "Agent Swarm Orchestrator".

### 3.1 Middleware Chain (`src/middleware`)
The server uses a strict middleware pipeline to ensure security and stability.
1.  **`cors`**: Whitelists production domains.
2.  **`helmet`**: Sets security headers (CSP, XSS protection).
3.  **`rateLimit`**: Redis-backed limiting (prevent abuse of expensive AI agents).
4.  **`auth`**: Firebase Admin SDK verification of Bearer tokens.

### 3.2 Service Layer
- **`FirestoreService`**: Abstracts DB operations. Handles "Collections" (`users`, `systems`, `journals`).
- **`VectorService`**: Handles physics math (not database vector search, but "Relationship Physics").
- **`PaymentService`**: Wraps Stripe API for easy subscription management.

---

## 🧠 Part 4: The Agent Swarm

The detailed intelligence of Defrag Daily comes from its Multi-Agent System.

### 4.1 Agent Roster
| Agent Name | Model | Role |
| :--- | :--- | :--- |
| **AuthAgent** | N/A | Gatekeeper. Verifies identity and session validity. |
| **AnalystAgent** | Gemini 2.0 Flash | The "Doctor". Analyzes graph entropy and generates insights. |
| **VectorDynamicsAgent** | Algorithmic | The "Physicist". Runs the attraction/repulsion simulation loop. |
| **MandalaAgent** | Replicate (Flux) | The "Artist". Visualizes the user's internal state. |
| **SchemaAgent** | Gemini 1.5 Pro | The "Architect". Maps family nodes to graph schemas. |
| **EnvDoctorAgent** | N/A | The "Mechanic". Checks server health on startup. |

### 4.2 Detailed Logic: `AnalystAgent`
**Archetype**: "Cyber-Jungian Analyst"
- **Input**: `SimState` (node positions, velocities) + `UserContext`.
- **Process**:
    1.  Calculates **Entropy** (0.0 - 1.0) based on total system velocity (chaos).
    2.  Sets **Pass Level**: `CALIBRATION` (Stable), `DETECTION` (Drift), `INTEGRATION` (Crisis).
    3.  Generates a "Deep Dive" report using the **Structural Prompt**.
- **System Prompt Snippet**:
    > "You are the COGNITIVE OPERATING SYSTEM. Your tone is Clinical yet Esoteric. Analyze the user's Family System as a gravitational field. Identify drift (cutoff) and entropy (conflict)."

### 4.3 Detailed Logic: `VectorDynamicsAgent`
**Mode**: Physics Simulation
- **Algorithm**: Force-Directed Graph.
- **Rules**:
    - **Gravity**: All nodes attracted to `(0,0,0)` (The Self).
    - **Repulsion**: Nodes push apart if too close (< 2 units).
    - **Relationship Modifiers**:
        - `Conflict`: 2x Repulsion.
        - `Close`: 1.5x Attraction.
        - `Cutoff`: Zero Attraction (Drift).

---

## 🔌 Part 5: Integrations

### 5.1 Google Gemini (AI)
- **Library**: `@google/generative-ai`
- **Usage**: Core intelligence for `Analyst` and `Schema` agents.
- **Config**: Requires `GEMINI_API_KEY`. Models: `gemini-2.0-flash` (Fast), `gemini-1.5-pro` (Complex).

### 5.2 Replicate (Image Gen)
- **Service**: Remote GPU Cluster.
- **Model**: `black-forest-labs/flux-schnell` (Fast, high quality).
- **Prompting**: `MandalaAgent` converts emotional keywords ("Anger", "Red") into visual prompts ("Jagged geometries, crimson fractal, oil painting style").

### 5.3 Swiss Ephemeris (`swisseph`)
- **Type**: C++ Binding via `swisseph` npm package.
- **Usage**: High-precision planetary calculations (NASA JPL data).
- **Output**: Accurate XYZ coordinates for planets to render the "Cosmic Background" in 3D.

### 5.4 Stripe (Payments)
- **Flow**:
    1.  User selects Plan in Frontend -> `POST /api/payment/create-checkout-session`.
    2.  Backend talks to Stripe -> Returns `checkoutUrl`.
    3.  Frontend redirects user.
    4.  Stripe Webhook -> `POST /api/payment/webhook` -> Updates User Tier in Firestore.

---

## 📜 Part 6: API Reference (Exhaustive)

### System
- `GET /api/system/status`: Health check.
- `GET /api/system/config`: Public client config.

### Cosmic / Simulation
- `GET /api/cosmic/live-vectors`: SwissEph planetary positions.
- `GET /api/simulation/state/:userId`: Retrieve last known physics state.
- `POST /api/simulation/run`: Trigger `VectorDynamicsAgent`.

### Agents / Content
- `POST /api/mandala/:userId`: Trigger `MandalaAgent`.
- `POST /api/voice/synthesize`: Text-to-Speech generation.
- `POST /api/analysis/deep-dive`: Trigger `AnalystAgent` manually.

### Users / Family
- `GET /api/users/:userId`: Full profile fetch.
- `POST /api/users/:userId/family`: Add member.
- `PUT /api/users/:userId/family/:memberId`: Update member/relationship.
- `DELETE /api/users/:userId/family/:memberId`: Remove member.

### Export / Share
- `POST /api/export/pdf`: Generate Clinical PDF Report.
- `POST /api/share/therapist-link`: Create temporary access token.

---

## 🚀 Deployment Guide

### Prerequisites
- **Node.js**: v18+
- **Redis**: Required for Rate Limiting.
- **Firebase Project**: Firestore enabled.

### Environment Variables (.env)
```ini
# Core
PORT=3002
NODE_ENV=production

# Security
JWT_SECRET=super_secret_key_...

# AI Services
GEMINI_API_KEY=AIzaSy...
REPLICATE_API_TOKEN=r8_...

# Database
FIREBASE_CREDENTIALS={"type": "service_account", ...}

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Build & Run
1.  **Frontend**: `cd frontend && npm run build` -> Output `dist/`.
2.  **Backend**: `npm run build` -> Output `dist/src`.
3.  **Serve**: `node dist/src/index.js`.
