# DEFRAG Daily - Architecture Overview

## 1. System Overview

DEFRAG Daily is a "Psychological/Astrological Operating System" designed to help users integrate fragmented aspects of their psyche through data visualization, AI-driven insights, and systemic family processing.

The system is built as a **Multi-Agent Hybrid Application** encompassing:
- **Frontend**: A high-fidelity, 3D-accelerated Web Application (React/Three.js).
- **Backend**: A Node.js/Express server orchestrating a swarm of specialized AI Agents.
- **Data Layer**: Firestore (Persistence), Redis (Caching/Rate Limiting).
- **Intelligence**: Google Gemini (via `@google/generative-ai` and `antigravity-sdk`), Replicate (Image Generation), and Swisseph (Astrological Calculations).

## 2. Technology Stack

### Backend
- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: Google Firestore (NoSQL)
- **Caching**: Redis (via `ioredis`)
- **AI/ML**:
  - `google/generative-ai` (LLM Logic)
  - `swisseph` (Swiss Ephemeris for Astrology)
  - `replicate` (Image Generation for Mandalas)
- **Infrastructure**: Firebase Admin SDK, Stripe (Payments)

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4, PostCSS
- **3D/Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animation**: Framer Motion, `framer-motion-3d`
- **Audio**: Howler.js
- **State Management**: Zustand
- **HTTP Client**: Native Fetch

## 3. Core Components

### 3.1 The Agent Swarm
The backend logic is distributed across specialized "Agents" extending a base `Agent` class.
- **AuthAgent**: Handles user authentication and session management.
- **MandalaAgent**: Generates psychological mandalas based on user state.
- **SchemaAgent**: specialized in "Family Systems" theory, calculating coherence and integrating nodes in a graph.
- **EnvDoctorAgent**: Monitors system health and environment configuration.
- **VectorAgent**: Likely handles vector embeddings for semantic search or relationship mapping.
- **VoiceAgent**: Manages voice interactions (Audio-to-Text / Text-to-Audio).

### 3.2 The "Terminal" Interface
The frontend provides a "Terminal" aesthetic, serving as the user's dashboard for:
- Viewing "Cosmic Forecasts".
- Interacting with the "Family Cube" (3D visualization of family systems).
- Accessing "Live Agents".
- Managing Subscriptions (Tiered access via Stripe).

## 4. Data Flow

1.  **User Action**: User inputs data (e.g., "Natal Data" or "Family Member") in the Frontend.
2.  **API Request**: Frontend sends JSON data to Express endpoints (e.g., `/api/cosmic`).
3.  **Agent Processing**:
    - The Router delegates the task to a specific Agent (e.g., `FamilySystemAgent`).
    - Agents may call external APIs (Gemini, Replicate) or internal services (Swisseph).
4.  **State Update**: Agents update Firestore documents (User Profile, System State).
5.  **Response**: Processed data (e.g., a calculated "Coherence Score" or a generated Image URL) is returned to the Frontend.
6.  **Visualization**: React/Three.js renders the result (e.g., updating the 3D Cube or displaying a Mandala).

## 5. Security & Scalability
- **Rate Limiting**: Implemented via `express-rate-limit` and `rate-limit-redis`.
- **CORS**: Strict origin policies allowing only production and dev domains.
- **Validation**: `zod` and `express-validator` ensure data integrity.
