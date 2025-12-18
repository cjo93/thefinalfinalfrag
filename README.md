# DEFRAG // THE FINAL FRAGS

> **Cognitive Operating System v1.0**
> *Decode your family systems. Visualize your internal geometry.*

![DEFRAG Interface](https://defragmentation1.gitlab.io/thefinalfrags/og-image.png)

## Overview

DEFRAG is a premium, web-based tool aimed at "Quantified Self" and "Mental Health" markets. It combines **Family Systems Theory**, **Archetypal Psychology**, and **Generative AI** to provide users with a "dashboard for the soul."

## Features

- **Terminal Interface**: A cinematic, cyber-noir OS experience.
- **Family Cube**: 3D vector analysis of family dynamics (`Connection` x `Agency` x `Meaning`) with real-time physics simulation.
- **Archetypal Mandala**: Procedural generation of a unique visual signature based on natal biometrics (Powered by Stable Diffusion).
- **Voice Synthesis**: AI-driven audio briefings and guided meditations (Powered by ElevenLabs).
- **Relational Topology**: Network graph visualization of social connections.
- **Wallet Artifact**: Shareable "Card" representing your current state.

## Quick Start

### Prerequisites
- Node.js v18+
- Stripe Account (for payments)
- Firebase Project (Firestore & Auth)
- Replicate API Token (for Mandala)
- ElevenLabs API Key (for Voice)

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env` file in the root directory:
```env
# Core
# Backend URL (Frontend will default to http://localhost:3002 in DEV and https://api.defrag.app in PROD)
# Setting VITE_API_URL overrides this default.
# VITE_API_URL=http://localhost:3002
PORT=3002

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# AI Services
REPLICATE_API_TOKEN=r8_...
ELEVENLABS_API_KEY=xi_...

# Payments
STRIPE_SECRET_KEY=sk_...
```

### 3. Running the System
```bash
# Start Backend & Frontend concurrently
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3002`

## Documentation

For detailed architecture, logic synthesis, and API reference, see:
- [**System Architecture**](docs/SYSTEM_ARCHITECTURE.md): Full breakdown of Agents, Frontend, and API.

## 🏗 Architecture
- **Frontend**: React 19, Vite, Tailwind v4, Three.js (R3F)
- **Backend**: Node.js, Express, Firestore, Redis
- **Intelligence**: Google Gemini 2.0, Replicate (Flux), SwissEph

## 🤝 Contribution
See [COMPLETE_DOCUMENTATION.md](docs/COMPLETE_DOCUMENTATION.md) for the "Deployment Manual" and detailed "Agent Swarm" specifications.

## Deployment

The project is configured for **GitLab Pages** (Frontend) and a Node.js compatible container host (Backend).
- **Push to Main**: Automatically triggers build & deploy pipeline for static assets.
- **URL**: `https://defragmentation1.gitlab.io/thefinalfrags/`

## Support

- **Status**: Gold Master (v2.0.0)
- **Documentation**: [Complete Technical Manual](docs/COMPLETE_DOCUMENTATION.md)
- **Live Site**: [defrag.app](https://defrag.app)
- **Contact**: `contact@defrag.app`
