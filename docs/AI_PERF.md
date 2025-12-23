# AI Performance & Safety — Defrag

## Goals
- Move heavy AI tasks (mandala, voice) to a queue with retries/timeouts.  
- Cache outputs keyed by prompt+seed+model+tier.  
- Golden fixtures for deterministic checks and CI visual regression.

## Implementation
1. Use BullMQ + Redis for job queueing. See `src/queues/mandalaQueue.ts`.  
2. Processor should enforce timeouts, retries and cost-limits; produce cached artifact on success.  
3. Store provenance metadata (prompt, model, seed, temp) with every asset.  
4. Add golden fixtures and visual diff in CI.

## Acceptance
- Queue metrics visible; job retries work; golden tests pass; unsafe outputs blocked.

