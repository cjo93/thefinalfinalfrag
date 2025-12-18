# Sprint Plan: Visual Stabilization & Interaction Polish

## Objective
Enhance the visual fidelity, stability, and "Awe" factor of the application, focusing on the Hero Landing sequence and ensuring a seamless user journey free from jarring interruptions.

## 1. Flow Refinement (The "TOS" Fix)
- [x] **Audit Initialization Flow**: rigorously verify the chain of events from "Initialize System" -> `AuthModal` -> `NeuralInterface`.
- [x] **Relocate Terms/Advise**: Ensure validation/TOS steps trigger *strictly* after authentication and ideally integrated into the "Boot Sequence" narrative rather than a blocking modal popup immediately upon entry.

## 2. Hero Landing Enhancement ("Awe" Factor)
- [x] **Cinematic Entrance**: Refine the `App.tsx` hero animations. Use `framer-motion` to create a more staggered, dramatic reveal of the "DEFRAG //OS" title and "Spectral Architecture" tagline.
- [ ] **Visual Depth**: Polish `HeroScene.tsx` (if accessible) or the CSS visual layers in `App.tsx` (gradients, blurs, parallax) to create a stronger sense of deep space/structure.
- [x] **Interactive Responsiveness**: Ensure the "Enter Interface" button reacts physically (scale, glow) to user presence before click.

## 3. Visual Stabilization
- [ ] **Typography Audit**: Ensure font weights and tracking (kerning) are premium and consistent (Inter/Roboto Mono).
- [x] **Mobile Optimization**: Double-check safe-area insets on all new modals and screens.
- [x] **Asset Polish**: Reduce "glitchy" feeling by easing transitions.

## 4. Execution Strategy
- **Step 1**: Fix the TOS Flow (Address User's blocker) - **COMPLETED**
- **Step 2**: Polish Hero Animation (Address User's "Awe" request) - **COMPLETED**
- **Step 3**: Verify on Mobile/Desktop simulations.
