# Defrag Daily - Data Models

The application relies on strong TypeScript interfaces to ensure type safety across the Event-driven architecture.

## Family System Models (`src/types/family-system.ts`)

### 1. User State (`UserState`)
Represents the core "Self" in the system.
- `vector` (`Vector3`): The user's position in the 3D cube (usually center `0,0,0`).
- `intensity` (`number`): Current emotional load [0-1].
- `archetypeWeights`: Dynamic map of active archetypes (e.g., "Hero", "Orphan").
- `flags`: System logic flags (`orderLoop`, `chaosLoop`).

### 2. Lineage Member (`LineageMember`)
Represents a family member or entity in relation to the Self.
- `id` (`string`): Unique ID.
- `role` (`string`): Relation to user (e.g., "Mother").
- `relationshipType`: Determines the visual link style:
    - `close` (Solid Green)
    - `conflict` (Zig-zag Red)
    - `distant` (Thin Grey)
    - `cutoff` (Dashed Line)
- `vector` (`Vector3`): 3D Coordinates relative to User.

### 3. Schema Objects
Used by the `SchemaAgent` for graph processing.
- `SchemaNode`: `{ id, content, affectWeight }`
- `SchemaEdge`: `{ sourceId, targetId, valence, strength }`
- `SchemaObject`: The full graph container plus `coherenceScore`.

### 4. Astrological Profile (`AstrologyProfile`)
- `natal`: Key placements (Sun, Moon, Rising) and aspects.
- `transits`: Active planetary movements affecting the user.
- `astroPrior` (`Vector3`): A calculated vector bias based on astrology.

## Subscription Models
- **Tiers**: `Free`, `Seeker`, `Architect`.
- **Limits**:
    - Free: Max 5 Family Members, 1 Mandala/day.
    - Seeker: Max 15 Members, Unlimited Mandalas.
    - Architect: Unlimited everything + API Access.
