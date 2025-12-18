# Implementation Plan: Secure Voice Agent Integration

## Goal
To "activate" the Voice Agent fully and securely by routing audio synthesis requests through the Node.js backend. This removes the `VITE_ELEVEN_LABS_API_KEY` vulnerability and leverages the server-side `VoiceSynthesisAgent`.

## Proposed Changes

### Backend (Node.js)
#### [NEW] [src/routes/voice.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/routes/voice.ts)
-   **Endpoint**: `POST /api/voice/synthesize`
-   **Body**: `{ text: string, voiceId?: string }`
-   **Logic**: Calls `voiceAgent.synthesizeText(text, voiceId)` and streams the result back as `audio/mpeg`.

#### [MODIFY] [src/index.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/src/index.ts)
-   Register the new `voiceRouter`.

### Frontend
#### [MODIFY] [frontend/services/VoiceAgent.ts](file:///Users/cjo/.gemini/antigravity/scratch/thefinalfrags/frontend/services/VoiceAgent.ts)
-   **Remove**: Direct `fetch` to ElevenLabs and `VITE_ELEVEN_LABS_API_KEY` usage.
-   **Add**: `fetch('/api/voice/synthesize')` via the existing Vite proxy.
-   **Fallback**: Maintain Web Speech API fallback if the backend mock/error occurs.

## Verification Plan
1.  **Mock Test**: Without an API Key on the backend, the endpoint should return the "mock beep" (or we can adjust the mock to return a valid empty mp3/wav to avoid frontend decode errors).
2.  **Frontend Integration**: Clicking "Play" in `TerminalInterface` should trigger the backend call.
