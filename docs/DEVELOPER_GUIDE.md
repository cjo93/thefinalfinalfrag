# DEFRAG Developer Guide

> **Version**: 2.0 (Gold Master)
> **Target Audience**: Core Engineers, Contributors

## 1. System Philosophy
DEFRAG is a "Cognitive Operating System". The architecture reflects this by treating:
- **Frontend** as the "Neural Interface" (Visuals, Input).
- **Backend** as the "Subconscious" (Logic, Agents, Physics).
- **Data** as "Memory" (Firestore).

---

## 2. Environment Setup (The Foundation)

### A. Prerequisites
- **Node.js** v18+ (v20 recommended).
- **Python** 3.9+ (for legacy astrology scripts, mostly archived now).
- **Google Cloud SDK** (for Firebase/Firestore).

### B. "Zero to Hero" Config
1.  **Clone & Install**:
    ```bash
    git clone ...
    npm install
    ```
2.  **Environment Variables (`.env`)**:
    We do NOT use mock keys in the `master` branch. You must have real credentials.
    ```env
    # --- CORE ---
    PORT=3002
    FRONTEND_URL=http://localhost:3000

    # --- FIREBASE ---
    GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"

    # --- AI AGENTS ---
    REPLICATE_API_TOKEN="r8_..."        # Required for Mandala
    ELEVENLABS_API_KEY="xi_..."         # Required for Voice
    OPENAI_API_KEY="sk_..."             # Required for Analysis

    # --- COMMERCE ---
    STRIPE_SECRET_KEY="sk_test_..."     # Use Test Mode keys for dev
    STRIPE_WEBHOOK_SECRET="whsec_..."
    ```
3.  **Certificates**:
    For Apple Wallet pass signing, place `signerCert.pem`, `signerKey.pem`, and `wwdr.pem` in `certs/`.
    *(Self-signed certs included in `certs/dev/` for local testing).*

---

## 3. Developing Agents

Agents are isolated logic units in `src/agents/`.

### A. Anatomy of an Agent
Every agent extends the base `Agent` class and must handle its own errors.
```typescript
import { Agent } from "../framework/AgentBase";

export class MyNewAgent extends Agent {
    constructor(context: AgentContext) {
        super("MyNewAgent", context);
    }

    async executeTask(input: any) {
        // 1. Validate Input
        if (!input) throw new Error("Input required");

        // 2. Perform Logic
        const result = await someService(input);

        // 3. Log & Return
        console.log(`[MyNewAgent] Success: ${result.id}`);
        return result;
    }
}
```

### B. Registering an Agent
1.  Add to `src/agents/instances.ts`.
2.  (Optional) Add to `src/index.ts` if it needs to run on boot.

---

## 4. Frontend/Backend Protocol

### A. Authentication
- **Token**: The Frontend sends a Firebase ID Token in the `Authorization: Bearer <token>` header.
- **Middleware**: `src/middleware/auth.ts` verifies this token.
- **User Context**: Valid requests have `req.user` populated (uid, email).

### B. Error Handling
We use standard HTTP codes with a consistent JSON error shape.
- `400`: Bad Request (Validation failed).
- `401`: Unauthorized (Missing/Invalid Token).
- `403`: Forbidden (Valid Token, but insufficient Tier/Permissions).
- `429`: Too Many Requests (Rate limit hit).
- `500`: System Error (Check server logs).

---

## 5. Troubleshooting & Debugging

### "The Environment Doctor"
If the server behaves erratically, check the **Environment Doctor** on boot.
- **Command**: `npm run dev` look for `[EnvironmentDoctor]` logs.
- **API**: `curl localhost:3002/api/system/status`.

### Common Issues
| Symptom | Probable Cause | Fix |
|---------|----------------|-----|
| `Mandala generation failed` | Missing Replicate Token | Check `.env` for `REPLICATE_API_TOKEN`. |
| `Voice is silent` | Missing ElevenLabs Key | Check `.env`. Agent falls back to mock mode if missing. |
| `Physics simulation is frozen` | Vector Agent Error | Check server logs for `NaN` coordinates in `VectorDynamicsAgent`. |

---
