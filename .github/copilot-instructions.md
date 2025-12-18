# Copilot/Codex Agent Instructions (Codex-Optimized, Multi-Agent Ready)

## Project: DEFRAG // THE FINAL FRAGS
Repo: git@gitlab.com:defragmentation1/thefinalfrags.git

### 1. Build & Run (Codex-Ready)
- **Install:**
	npm install --legacy-peer-deps
- **Dev Mode (Full Stack):**
	npm run dev
- **Frontend Only:**
	cd frontend && npm run dev
- **Build Frontend:**
	npm run build
- **Lint:**
	npm run lint && npm run lint:fix

### 2. Environment & Config
- All secrets/API keys in `.env` (never hardcode).
- Backend URL: VITE_API_URL (default: http://localhost:3002)
- See README.md for required API keys (Replicate, ElevenLabs, Stripe, Firebase).

### 3. Key Patterns
- **3D/Physics:**
	Use d3-force-3d in frontend/components/FamilyCube.tsx.
- **Audio:**
	Centralized in SoundManager (frontend/components/AudioEngine.tsx).
- **Visuals:**
	Post-processing in frontend/ (bloom, grain, vignette).
- **API:**
	All external calls via backend (src/services/), never from frontend directly.

### 4. Multi-Agent & Live Assistant Integration
- Agents can operate on separate services (backend/frontend) or features (Mandala, Voice, Payments).
- Use modular service structure in src/services/ and frontend/services/ for agent handoff.
- Agents communicate via REST endpoints; see src/routes/ and frontend/services/.
- For live agent/assistant, expose WebSocket or polling endpoints in backend, and connect via frontend hooks.
- Autonomous agents can be orchestrated via scripts in scripts/ or backend cron jobs.

### 5. Extending with New Agents/Services
- Add new agent logic in src/agents/ or src/services/.
- Expose new endpoints in src/routes/.
- Add frontend integration in frontend/services/ and UI in frontend/components/.
- Register new API keys in .env.

### 6. Testing & Validation
- Backend: pytest or scripts/tests/
- Frontend: npm test or frontend/tests/
- Lint and build must pass before merge.

### 7. References
- [README.md](../../README.md)
- [frontend/README.md](../../frontend/README.md)
- docs/ for architecture, agent workflows, and integration details
