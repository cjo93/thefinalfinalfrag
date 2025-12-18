# DEFRAG // Frontend

The visual interface for the DEFRAG Cognitive Operating System. Built with React, Three.js (Fiber), and Framer Motion.

## 🚀 Key Features (Ascension Protocol v1.4)

### 1. Cinematic 3D Environment
*   **QuantumScene**: Procedural 3D scenes representing mental states (Memory, Trust, Neural Topology).
*   **Post-Processing**: Integrated Bloom, Film Grain, and Vignette for a high-end "Tech-Noir" aesthetic.
*   **Performance Adaptive**: Automatically downgrades visuals on mobile devices.

### 2. Audio Engine
*   **SoundManager**: Singleton audio service utilizing `Howler.js`.
*   **Dynamic Soundscapes**:
    *   **Observer Mode**: Ethereal, distant drones.
    *   **Focus Mode**: Tight, rhythmic patterns for active terminal work.
*   **Interaction**: UI clicks, hovers, and "Level Up" fanfares.

### 3. Family Antigravity Cube (Architect Node)
*   **Physics-Based**: Uses `d3-force-3d` to simulate family dynamics as a gravity well.
*   **God Mode**: Dynamic Depth-of-Field focus when inspecting nodes.
*   **Raycasting**: Hover effects with premium glass-morphism tooltips.

## 🛠 Development

### Prerequisites
*   Node.js v18+
*   npm

### Setup
1.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: If you encounter peer dependency issues with three/fiber/drei, use `--legacy-peer-deps`.*

2.  Run Development Server:
    ```bash
    npm run dev
    ```

### Linting
We maintain strict code hygiene.
```bash
npm run lint      # Check for errors
npm run lint:fix  # Auto-fix fixable issues
```

## 📦 Deployment
The frontend is designed for static deployment (e.g., GitLab Pages, Vercel, Netlify).
Build command: `npm run build`
