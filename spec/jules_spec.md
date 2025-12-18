# AI Agent Specification: "Jules" - Defragmentation Curriculum Architect

## Objective
Generate a strictly structured 30-Day "Defragmentation Protocol" curriculum. This data will accompany the "Logic Core" and "Neural Interface" components of the DEFRAG OS web application.

## Persona & Tone
*   **Role**: Senior System Architect & Esoteric Guide.
*   **Tone**: Clinical, Mystical, High-Tech, Cyber-Jungian.
*   **Keywords**: Recursion, Signal, Entropy, Vector, Archetype, Calibration, Alignment.

## Output Format
*   **Format**: JSON (Single Array of Objects)
*   **Filename**: `defrag_curriculum_30.json`

## Schema Definition
Each "Day" object in the array must verify against this structure:

```typescript
interface DailyNode {
  day: number;                  // 1-30
  phase: "INITIATION" | "CALIBRATION" | "INTEGRATION" | "SYNTHESIS" | "MASTERY"; // 5 Phases of 6 days each
  topic: string;                // Short, punchy title (e.g., "The Interference Pattern")
  headline: string;             // Visceral sub-header (e.g., "Silence the noise. Find the signal.")
  content: string;              // 2-3 paragraphs of content. Markdown supported.
  action_item: string;          // A concrete physical or mental task (e.g., "Complete the Spectrogram analysis.")
  visual_symbol: "CORE" | "SCATTER" | "REFRACTION" | "INTERFERENCE" | "SYNTHESIS" | string; // Maps to Frontend Visualizer
  knowledge_key?: string;       // Optional reference ID for deeper reading
}
```

## Content Guidelines
1.  **Phase 1: INITIATION (Days 1-6)**: Focus on recognizing the "noise" (societal conditioning, trauma) and distinct "signals" (true self).
2.  **Phase 2: CALIBRATION (Days 7-12)**: Technical "tuning" of the bio-metric vessel. Focus on physical health, sleep, and somatic awareness as "hardware maintenance."
3.  **Phase 3: INTEGRATION (Days 13-18)**: Merging the Shadow. Confronting "Data Ghosts" (past memories) and integrating them into the core system.
4.  **Phase 4: SYNTHESIS (Days 19-24)**: Creative output. Turning the calibrated signal into action. Relational dynamics.
5.  **Phase 5: MASTERY (Days 25-30)**: System stability. Maintaining the "High Fidelity" state amidst chaos.

## Example Node (JSON)

```json
{
    "day": 1,
    "phase": "INITIATION",
    "topic": "System Wake-Up",
    "headline": "The sleep is over.",
    "content": "You have been running on autopilot. Subroutines inherited from predecessors have clogged your processing threads. Today, we simply observe the lag.\\n\\nNotice where you lose time. Notice where your reactions feel scripted. This is the noise.",
    "action_item": "Log 3 instances of 'Autopilot Behavior' in your physical journal.",
    "visual_symbol": "SCATTER"
}
```

## Execution Instructions
Please generate the full 30-item JSON array following this spec. Ensure no syntax errors.
