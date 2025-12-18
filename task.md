## 💾 Data Persistence & State
- [ ] Backend: Connect Family Input Console to Firestore `family_system_vectors`
- [ ] Backend: Ensure `mapVectorsToGeometry` uses live data
- [ ] Frontend: Verify `FamilyAntigravityCube` receives live topology updates
- [x] **Production Prep**: Verify `render.yaml` and API configuration.

## Phase 6: Google Ecosystem & Real-Time Physics (IMMEDIATE PRIORITIES)
- [x] **Google Wallet**: Implement `generateGooglePass` in `src/services/googleWallet.ts` & Route.
- [x] **NASA Feed**: Implement `fetchLiveVectors` (JPL Horizons) & Cosmic Stream WebSocket.
- [x] **Calendar**: Implement `syncSignalEvents` (Google Calendar API).

- [x] **Physics Engine**: Upgrade `FamilyAntigravityCube` with live cosmic/relational forces.
- [x] **Integrations**: Schema Backup (GCS), Sheets Export, BigQuery Pipeline (Firestore Config).

## Phase 7: iOS Native & Apple Ecosystem (CURRENT PRIORITY)
- [x] **Apple Wallet (Production)**: Update `wallet.ts` to support Base64 Certs from Env Vars (GitLab CI).
- [x] **iCloud Sync**: Plan schema backup to iCloud Drive [Architecture Stubbed].
- [x] **HealthKit**: Design biometric feed integration [Service Designed].


## Phase 8: Deep Intelligence & Gamification (COMPLETED)
- [x] **Deep Intelligence**: Integrate real Gemini 2.0 Flash in `AnalystAgent`. Provide prompt structure for "Deep Dive".
- [x] **Gamification**: Implement XP, Leveling, and Rank system (`src/services/gamification.ts`).
- [x] **UI Integration**: Create `GamificationHUD` and "Analyze System" button in Console.
- [x] **Reliability**: Ensure `generateDeepDive` works reliably (removed entropy constraints for manual trigger).

## 🚀 Deployment & Polish
- [x] Config: Update `frontend/src/config/api.ts` with production URL (uses `VITE_API_URL` env var)
- [ ] Performance: Audit bundle size and lazy loading
- [ ] Polish: Verify "Film Grain" and "Vignette" overlay performance on mobile

## Phase 16: Go-to-Market & Growth (TOMORROW)
- [x] **Launch**: Executing "The Signal" Campaign (Socials) [Technical SEO/Assets Ready].
- [x] **Verification**: Live system check (Payments, PDF, Cosmic Feed).
- [x] **Monetization**: Upsell "Architect Node" and "Analysis Reports".

## Phase 9: Monetization Hardening & UX Polish
- [x] **Tiers**: Standardize Tier Enums (`ACCESS_SIGNAL`, `HELIX_PROTOCOL`, `ARCHITECT_NODE`) across frontend/backend.
- [x] **Gating**: Enforce strict feature lockouts in `subscription.guard.ts` & `TerminalInterface`.
- [x] **Payment**: Verify Stripe Integration & Branding (Added `allow_promotion_codes`).
- [x] **Navigation**: Enhance `TerminalInterface` navigation rail (glassmorphism, tooltips, clarity).
- [x] **Content**: Refine "Deep Dive" report formatting for readability.

## Phase 9.5: Onboarding Optimization (NEW)
- [x] **Discount**: Implement "New User" Stripe Coupon logic.
- [x] **Discount**: Implement "New User" Stripe Coupon logic.
- [x] **Data Collection**: Intercept login flow to ensure Natal Data (Time/Place) is collected before Dashboard load.

## Phase 10: GitLab-Only Architecture (MIGRATION)
- [x] **Cleanup**: Remove Google Cloud dependencies (Storage, Sheets, Wallet).
- [x] **Backup**: Implement `src/services/schemaBackup.ts` (Firestore).
- [x] **CI/CD**: Configure `.gitlab-ci.yml` for Pages + Docker Registry.
- [x] **Docs**: Update `deployment_guide.md` for non-GCP stack.
- [x] **Env**: Verify removal of GCP credentials variables.

## Phase 11: Export to PDF (Clinical Deep Dive)
- [x] **Service**: Implement `pdfExport.ts` (PDFKit) for branded report generation.
- [x] **Frontend**: Add "Export Clinical Report" button to Deep Dive view.
- [x] **Content**: Structure report with "Operational Design", "Static Patterns", "Systemic Dynamics", and "Sources".
- [x] **Branding**: Apply DEFRAG visual identity (JetBrains/Suisse fonts, Gradient backgrounds).

## Phase 12: Deployment Handoff (COMPLETED)
- [x] Final merge to `main`.
- [x] Monitor GitLab Pipeline.

## Previous Phases (Completed)
- [x] Phase 4: Stability & Alignment Sprint (Server/Env/Docs)
- [x] Phase 3: The Network (Topology/Astrology)
- [x] Phase 2: The Intelligence (FastAPI/Basic Forecast)
- [x] Phase 1: Foundation

## Phase 14: The Ascension Protocol (CURRENT)
[x] **Core Systems (Global)**
   - [x] **Visual Engine:** Integrate `EffectComposer` (Bloom, Noise, Chromatic Aberration/Vignette) in `QuantumScene` (Added `CinematicEffects`).
   - [x] **Audio Core:** Initialize `SoundManager` (Howler.js) for UI interaction sounds (hover/click) and ambient drones.
   - [x] **Code Hygiene:** Set up ESLint/Prettier (Fixed peer dep issue, enabled linting).

[x] **Tier-Specific Enhancements**
   - [x] **Tier: Observer (Access Signal)**
     - [x] Add "Mouse Parallax" to Hero Scene (Enhanced in `QuantumScene`).
     - [x] Implement "Glitch" reveal effect for Manifesto text headers.
   - [x] **Tier: Operator (Helix Protocol)**
     - [x] Implement "Level Up" particle explosion/flare effect in `GamificationHUD`.
     - [x] Add "Streak" flame visualization.
     - [x] Activate "Focus Mode" ambient audio loop.
   - [x] **Tier: Architect (Architect Node)**
     - [x] Implement "God Mode" Depth-of-Field (bokeh) focus in `FamilyAntigravityCube`.
     - [x] Add Raycasting hover effects for Nodes.
     - [x] Apply visual polish for PDF Export.

[x] **Documentation & Delivery**
   - [x] Update `README.md` and developer build docs with new audio/visual system details.

## Phase 13: UI Polish & Responsive Optimization (COMPLETED)
- [x] **Landing Page**: Fix animation/text overlap. Simplify layout. Refine copy ("Spiritual Rebel" tone).
- [x] **Responsive**: Optimize for iPhone (PWA/Home Screen), iPad, and Desktop layouts.
- [x] **PWA**: Verify `manifest.json` and meta tags for "Add to Home Screen".
- [x] **Visuals**: Tune font sizes and spacing for each aspect ratio.

## Phase 15: The Coherence Protocol (CURRENT)
- [x] **Security Hardening**
    - [x] Install rate limiting packages
    - [x] Create `src/middleware/rateLimiter.ts`
    - [x] Apply rate limits to `src/index.ts`
    - [x] Update CORS config in `src/index.ts`
    - [x] Verify Stripe webhook signature in `src/routes/payments/webhook.ts`
- [x] **Data Privacy**
    - [x] Verify removal of personal identifiers (grep check passed)
    - [x] Create `src/utils/sampleData.ts`
- [x] **Tier Gate & Paywall**
    - [x] Create `frontend/src/hooks/useTier.ts`
    - [x] Create `frontend/src/components/TierGate.tsx`
    - [x] Create `frontend/src/components/PricingModal.tsx`
    - [x] Update Stripe routes
- [x] **Daily Briefing Automation**
    - [x] Install deps (`@nasa-jpl/horizons-api`, `nodemailer`)
    - [x] Create `src/services/BriefingService.ts`
    - [x] Create `src/cron/dailyBriefings.ts`
