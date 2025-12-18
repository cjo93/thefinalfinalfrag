
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Cloud, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

// Type definitions moved to src/types/r3f-elements.d.ts

// Define types for the ErrorBoundary
interface SceneErrorBoundaryProps {
    children: React.ReactNode;
    fallback: React.ReactNode;
}

interface SceneErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// Error Boundary Component
class SceneErrorBoundary extends React.Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
    state: SceneErrorBoundaryState = { hasError: false, error: null };
    constructor(props: SceneErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("Scene Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            // @ts-expect-error: props existence guaranteed by React.Component
            return this.props.fallback;
        }

        // @ts-expect-error: props existence guaranteed by React.Component
        return this.props.children;
    }
}


// --- PERFORMANCE OPTIMIZATION UTILS ---
// More aggressive mobile detection to ensure stability
const IS_MOBILE = typeof window !== 'undefined' && (
    window.innerWidth < 768 ||
    (window.navigator && (/Mobi|Android|iPhone|iPad/i.test(window.navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2)))
);

// Configurable quality settings based on device tier - Drastically reduced for mobile stability
const QUALITY = {
    stars: IS_MOBILE ? 100 : 3000,
    cloudSegments: IS_MOBILE ? 0 : 20,
    sparkles: IS_MOBILE ? 10 : 150,
    sparklesSecondary: IS_MOBILE ? 5 : 200,
    sparklesChromatic: IS_MOBILE ? 0 : 30,
    neuralNodes: IS_MOBILE ? 8 : 60,
    trustNodes: IS_MOBILE ? 4 : 30,
};

// --- SHARED AMBIENT BACKGROUND ---
const AmbientBackground = memo(() => {
    const ref = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.rotation.y -= delta * 0.02;
        }

        if (lightRef.current) {
            const r = 0.1 + Math.sin(t * 0.2) * 0.05;
            const g = 0.1 + Math.cos(t * 0.15) * 0.05;
            const b = 0.3 + Math.sin(t * 0.1) * 0.1;
            lightRef.current.color.setRGB(r, g, b);
        }
    });

    return (
        <group ref={ref}>
            <Stars radius={150} depth={50} count={QUALITY.stars} factor={4} saturation={0} fade speed={0.5} />
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                <Sparkles count={QUALITY.sparkles} scale={40} size={1} speed={0.05} opacity={0.2} color="#88aaff" />
            </Float>
            {/* Conditionally render Cloud only on non-mobile devices to prevent glitching/crashing */}
            {!IS_MOBILE && QUALITY.cloudSegments > 0 && (
                <Cloud opacity={0.05} speed={0.4} bounds={[20, 2, 5]} segments={QUALITY.cloudSegments} position={[0, -5, -10]} color="#202040" />
            )}
            <pointLight ref={lightRef} position={[0, 10, -10]} intensity={2} distance={100} decay={2} />
        </group>
    )
});

const CinematicEffects = memo(() => {
    if (IS_MOBILE) return null;
    return (
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.5} levels={9} opacity={0.5} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
    );
});

// --- HERO SCENE COMPONENTS ---

const PrismCrystal = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const { x, y } = state.pointer; // Normalized mouse coordinates (-1 to 1)

        // 1. Inner Mesh: Constant, majestic slow spin & breathing
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.1; // Very subtle wobble

            // Subtle breathing effect
            const scale = 1 + Math.sin(t * 0.8) * 0.03;
            meshRef.current.scale.set(scale, scale, scale);

            // Dynamic Reactivity: Increase emissive glow based on pointer distance/activity
            // This makes the crystal feel like it detects the observer
            const dist = Math.sqrt(x * x + y * y);
            const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
            if (material) {
                // Lerp emissive intensity: Base 0.2 + response to mouse
                material.emissiveIntensity = THREE.MathUtils.lerp(
                    material.emissiveIntensity,
                    0.2 + (dist * 0.8), // Increased response
                    0.05
                );
            }
        }

        if (innerRef.current) {
            innerRef.current.rotation.y -= 0.004; // Counter-rotate inner core
        }

        // 2. Outer Group: Interactive Magnetic Pull
        if (groupRef.current) {
            // Enhanced tilt range for better feedback
            const targetRotX = -y * 0.8; // Tilt up/down (Increased range)
            const targetRotY = x * 0.8;  // Turn left/right (Increased range)

            // Smoothly lerp towards the target rotation for a weighted, magnetic feel
            // Using 0.08 for a slightly heavier, premium feel
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);

            // Subtle parallax position shift
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x * 0.3, 0.05);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, y * 0.3, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                {/* Main Crystal Shell */}
                <mesh ref={meshRef}>
                    {/* Octahedron for cleaner, iconic "System Core" look */}
                    <octahedronGeometry args={[2.5, 0]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        emissive="#aaddff"
                        emissiveIntensity={0.2}
                        wireframe={true}
                        roughness={0}
                        metalness={0.1}
                        iridescence={1}
                        iridescenceIOR={1.6}
                        thickness={2}
                        clearcoat={1}
                    />
                </mesh>

                {/* Inner Ghost Core for added depth/parallax during rotation */}
                <mesh ref={innerRef} scale={0.5}>
                    <octahedronGeometry args={[2, 0]} />
                    <meshBasicMaterial color="#aaddff" transparent opacity={0.05} wireframe={true} />
                </mesh>
            </Float>
        </group>
    );
};

// --- EXPORTED SCENES (Memoized for performance/stability) ---

export const HeroScene = memo(() => {
    return (
        <div className="w-full h-full">
            <SceneErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-white">Error loading Hero Scene.</div>}>
                <Canvas dpr={[1, 2]} camera={{ position: [0, 0, IS_MOBILE ? 14 : 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <AmbientBackground />
                    <CinematicEffects />
                    <PrismCrystal />
                    {/* Subtle floor grid for depth */}
                    <Grid position={[0, -6, 0]} args={[20, 20]} cellColor="#333" sectionColor="#111" fadeDistance={15} />
                    {/* Post-processing or fog for mood */}
                    <fog attach="fog" args={['#000000', 5, 30]} />
                </Canvas>
            </SceneErrorBoundary>
        </div>
    );
});

export const MemoryScene = memo(() => {
    const groupRef = useRef<THREE.Group>(null);

    // Interactive Loop for Memory Shards
    const Interaction = () => {
        useFrame((state) => {
            if (groupRef.current) {
                const { x, y } = state.pointer;
                // Subtle rotation against mouse movement to create "parallax" depth
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.15, 0.05);
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.15, 0.05);
            }
        });
        return null;
    };

    return (
        <div className="w-full h-full">
            <SceneErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-white">Error loading Memory Scene.</div>}>
                <Canvas dpr={[1, IS_MOBILE ? 1.5 : 2]} camera={{ position: [0, 0, 10], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <AmbientBackground />
                    <Interaction />
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                        <group ref={groupRef}>
                            {/* Chaotic scattered shards representing Dissonance */}
                            {Array.from({ length: IS_MOBILE ? 8 : 20 }).map((_, i) => (
                                <mesh key={i} position={[
                                    (Math.random() - 0.5) * 8,
                                    (Math.random() - 0.5) * 8,
                                    (Math.random() - 0.5) * 4
                                ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                                    <tetrahedronGeometry args={[0.4]} />
                                    <meshStandardMaterial color="#555" wireframe transparent opacity={0.3} />
                                </mesh>
                            ))}
                            <mesh>
                                <sphereGeometry args={[1.5, 32, 32]} />
                                <meshStandardMaterial color="black" wireframe transparent opacity={0.1} />
                            </mesh>

                        </group>
                    </Float>
                </Canvas>
            </SceneErrorBoundary>
        </div>
    );
});

export const TrustScene = memo(() => {
    const groupRef = useRef<THREE.Group>(null);

    const Interaction = () => {
        useFrame((state) => {
            if (groupRef.current) {
                const { x, y } = state.pointer;
                // Rings tilt to look at the cursor
                const targetRotX = (Math.PI / 4) - (y * 0.2);
                const targetRotY = x * 0.2;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
            }
        });
        return null;
    };

    return (
        <div className="w-full h-full">
            <SceneErrorBoundary fallback={<div className="w-full h-full flex items-center justify-center text-white">Error loading Trust Scene.</div>}>
                <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
                    <AmbientBackground />
                    <Interaction />
                    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                        <group ref={groupRef} rotation={[Math.PI / 4, 0, 0]}>
                            <mesh>
                                <torusGeometry args={[3, 0.02, 16, 100]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                            </mesh>
                            <mesh rotation={[0, Math.PI / 2, 0]}>
                                <torusGeometry args={[3, 0.02, 16, 100]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
                            </mesh>
                            <mesh>
                                <sphereGeometry args={[0.5, 16, 16]} />
                                <meshBasicMaterial color="#fff" wireframe opacity={0.8} transparent />
                            </mesh>
                        </group>
                    </Float>
                </Canvas>
            </SceneErrorBoundary>
        </div>
    );
});

export const NeuralTopologyScene = memo(() => {
    const groupRef = useRef<THREE.Group>(null);

    const Interaction = () => {
        useFrame((state) => {
            if (groupRef.current) {
                const { x, y } = state.pointer;
                // Rotate the whole network cloud to show depth
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.3, 0.03);
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.3, 0.03);
            }
        });
        return null;
    };

    return (
        <div className="w-full h-full">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 12], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <AmbientBackground />
                <CinematicEffects />
                <Interaction />
                <group ref={groupRef}>
                    {/* Network Nodes */}
                    {Array.from({ length: QUALITY.neuralNodes }).map((_, i) => (
                        <mesh key={i} position={[
                            (Math.random() - 0.5) * 10,
                            (Math.random() - 0.5) * 10,
                            (Math.random() - 0.5) * 5
                        ]}>
                            <sphereGeometry args={[0.05, 8, 8]} />
                            <meshBasicMaterial color="#00ff88" transparent opacity={0.9} />
                        </mesh>
                    ))}
                    <Float>
                        <mesh>
                            <icosahedronGeometry args={[2, 1]} />
                            <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.15} />
                        </mesh>
                    </Float>
                </group>
            </Canvas>
        </div>
    );
});

export const EthosScene = memo(() => {
    const groupRef = useRef<THREE.Group>(null);

    const Interaction = () => {
        useFrame((state) => {
            if (groupRef.current) {
                const { x, y } = state.pointer;
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.1, 0.05);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.1, 0.05);
            }
        });
        return null;
    };

    return (
        <div className="w-full h-full">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
                <AmbientBackground />
                <Interaction />
                <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.1}>
                    <mesh ref={groupRef}>
                        <dodecahedronGeometry args={[2.5, 0]} />
                        <meshStandardMaterial color="#111" wireframe transparent opacity={0.1} />
                    </mesh>
                </Float>
            </Canvas>
        </div>
    );
});

export const ManifestoScene = memo(() => {
    const CameraRig = () => {
        useFrame((state) => {
            const { x, y } = state.pointer;
            // Subtle camera sway for infinite feel
            state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 1, 0.02);
            state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * 1, 0.02);
            state.camera.lookAt(0, 0, 0);
        });
        return null;
    };

    return (
        <div className="w-full h-full">
            <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
                <AmbientBackground />
                <CameraRig />
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
});

export const NavigatorScene = () => <div className="hidden" />; // Placeholder if needed
