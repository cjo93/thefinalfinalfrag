# UX & Accessibility — Defrag

## Goals
- Unified design system, lite-mode for low devices, accessibility improvements and onboarding.

## Implementation
1. Add `frontend/design/tokens.css` with typography and color tokens.  
2. Implement `frontend/src/hooks/useLiteMode.ts` to select lite/full rendering.  
3. Ensure `prefers-reduced-motion` respected. Add alt text generator using LLM for images with human override.  
4. Playwright e2e tests for keyboard navigation and onboarding flow (see CI).

## Acceptance
- Axe/Pa11y pass; keyboard nav works; low-spec devices pass lightweight FPS checks; onboarding is clear.

