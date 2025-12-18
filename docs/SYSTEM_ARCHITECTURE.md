# Defrag System Architecture

> **Version**: 1.0 (Gold Master)
> **Date**: Dec 15, 2025

## 1. High-Level Overview

DEFRAG is a hybrid **React/Node.js** application designed to provide a "Cognitive Operating System" for users. It utilizes a **Modular Agent Architecture** on the backend to handle complex tasks such as physics simulations, generative AI art, and voice synthesis.

### Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS, Framer Motion, Three.js (@react-three/fiber).
- **Backend**: Node.js (Express), TypeScript, Firebase Admin SDK.
- **Database**: Firestore (NoSQL).
- **AI Services**: Replicate (Stable Diffusion), ElevenLabs (Voice), OpenAI (Analysis).
- **Payments**: Stripe (Subscriptions).

---

## 2. Agent Ecosystem

The backend logic is partitioned into **Agents**, each responsible for a specific domain. These agents are instantiated in `src/agents/instances.ts`.

### A. Core Agents
| Agent | Responsibility | Key Features |
|-------|----------------|--------------|
| **EnvironmentDoctorAgent** | System Health | Scans `process.env`, validates keys, provides `POST /api/system/status`. |
| **VectorDynamicsAgent** | Physics Engine | Simulates 3D family dynamics (gravity, repulsion, attraction). |
| **MandalaAgent** | Visual Synthesis | Generates personalized mandalas based on biometric/natal data. |
| **VoiceSynthesisAgent** | Audio | Text-to-Speech synthesis for briefings and guided sessions. |
| **PaymentAgent** | Monetization | Handles Checkout Sessions, Webhooks, and Subscription Tiers. |

### B. Agent Inter-Communication
Agents communicate primarily via the `AgentContext` and shared services. For example, the `MandalaAgent` may read data that was processed by the `AnalystAgent`.

---

## 3. Frontend Architecture

The frontend is a **Single Page Application (SPA)** built with performance and "cinematic" aesthetics in mind.

### Core Components
- **NeuralInterface** (`NeuralInterface.tsx`): The main dashboard. Lazy-loaded to reduce initial bundle size.
- **QuantumScenes** (`QuantumScene.tsx`): Three.js backgrounds for the landing page. All lazy-loaded.
- **SystemLayout** (`SystemLayout.tsx`): Provides the CRT/Film Grain effects and global UI frame.
- **DirectUplink** (`DirectUplink.tsx`): A simulated CLI for "advanced" users.

### Performance Optimizations
- **Lazy Loading**: Heavy components are imported using `React.lazy()` and wrapped in `Suspense`.
- **Chunk Splitting**: Verified separation of `NeuralInterface` (~190kB) from the main bundle.
- **PWA**: iOS-optimized with `touch-action: manipulation`, native status bar styling, and custom "Add to Home Screen" prompt (`PwaInstallPrompt.tsx`).

---

## 4. API Reference

### Health & Diagnostics
- `GET /api/system/status`: Returns comprehensive system health report (Environment Doctor).

### Simulation
- `POST /api/simulation/run`: Triggers a server-side physics simulation.
- `GET /api/simulation/stats`: Returns live entropy/vector stats.

### Content
- `GET /api/mandala/:userId`: Retrieves or generates a user's mandala.
- `POST /api/voice/synthesize`: Generates audio buffer from text.

---

## 5. Deployment

### Folder Structure
- `frontend/`: React source code.
- `src/`: Backend source code (compiled to `dist/`).
- `_archive/`: Deprecated legacy code (Python backend, old components).

### Build Pipeline
1. **Frontend**: `npm run build` (Vite) -> `dist/` (Static Assets).
2. **Backend**: `npx tsc` (TypeScript) -> `dist/` (JS Runtime).
3. **Serve**: The backend serves the static frontend assets in production.
