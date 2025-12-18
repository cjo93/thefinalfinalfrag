# Defrag Daily - Sprint Plan 1.0

**Goal**: Stabilize the "Gold Master" build, clean up technical debt, and prepare for "Phase 11" features (Export, Expanded Simulation).

## 1. Immediate Cleanup (Sprint 0)
*Focus: Code Hygiene & Linting*
- [ ] **Frontend Lint Fixes**: Resolve `any` types in `App.tsx`, `FamilyAntigravityCube.tsx`.
- [ ] **Dead Code Removal**: Remove unused variables in `CosmicForecastWidget` and `DisclaimerModal`.
- [ ] **Type Safety**: Replace `@ts-ignore` with standard TypeScript patterns.

## 2. Stability & Optimization
*Focus: Performance & Error Handling*
- [ ] **Error Boundaries**: Enhance `SceneErrorBoundary` to capture more WebGL context.
- [ ] **React-Three-Fiber Performance**: Optimize `FamilyAntigravityCube` rendering (throttle frame updates).
- [ ] **Dependecy audit**: Audit `package.json` for unused packages.

## 3. Feature Enablement ("Phase 11")
*Focus: Unlock Pending Features*
- [ ] **PDF Export**: Implement the `/api/export` route (placeholder found in `index.ts`).
- [ ] **Advanced Simulation**: Hook up the "Cosmic Physics" feed to real-time simulation logic.
- [ ] **User Profile Expansion**: Add "Human Design" data fields to `UserState`.

## 4. Documentation
*Focus: Maintenance*
- [x] Bundle Documentation (Completed).
- [ ] Create inline code documentation for complex math in `FamilySystemAgent`.
