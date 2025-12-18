# Implementation Plan: Mandala Card & Voice Agent

## Goal
1.  Create a reusable `MandalaProfileCard` component that fetches and displays the deterministic mandala from `/api/mandala/card`.
2.  Integrate this card into `SettingsView.tsx` as the user's default visual.
3.  Scaffold the `VoiceSynthesisAgent` to enable audio briefings.

## User Review Required
> [!NOTE]
> The Voice Agent currently requires an ElevenLabs API key. I will add a placeholder/mock mode if the key is missing.

## Proposed Changes

### Frontend
#### [NEW] [MandalaProfileCard.tsx](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/frontend/components/MandalaProfileCard.tsx)
-   A new component that:
    -   Accepts `userId` and `bioMetrics` as props.
    -   Has a "Generate/Regenerate" button.
    -   Calls `POST /api/mandala/card` via the Vite proxy.
    -   Displays the returned PNG blob.
    -   Handles loading states with a "Computing Geometry..." animation.

#### [MODIFY] [SettingsView.tsx](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/frontend/components/SettingsView.tsx)
-   Replace the hardcoded mandala section (Lines 181-227) with the `<MandalaProfileCard />`.

### Backend (Voice Agent)
#### [NEW] [VoiceAgent.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/agents/VoiceAgent.ts)
-   Implement `VoiceSynthesisAgent` class.
-   Capabilities:
    -   `synthesizeText(text: string): Promise<Buffer>`
    -   Uses ElevenLabs API (if key present) or Mock (returns logic for "audio generated").

#### [MODIFY] [index.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/index.ts)
-   Register `voiceAgent` in the agent list.

## Verification Plan

### Manual Verification
1.  **Mandala Card**:
    -   Open Settings View.
    -   Click "Regenerate".
    -   Verify the spinning loader appears.
    -   Verify a high-res Mandala Card appears after ~2 seconds.
2.  **Voice Agent**:
    -   (Future Step) Trigger a voice synthesis test via a new script or endpoint. For now, we will verify the agent initializes without error in the server logs.
