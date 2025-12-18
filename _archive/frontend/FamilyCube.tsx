
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html, Box } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Types (Mirroring Backend)
interface Vector3 { x: number; y: number; z: number; }
interface UserState {
    vector: Vector3;
    intensity: number;
    flags: { orderLoop: boolean; chaosLoop: boolean; rotationEvent: boolean; };
    notes?: string;
}

import { LineageMember } from '../../src/types/family-system';

interface FamilyCubeProps {
    userState?: UserState;
    members?: LineageMember[]; // [NEW] list of family nodes
    showControls?: boolean;
}

// Visual Components

const AxisLabel = ({ position, text, color }: { position: [number, number, number], text: string, color: string }) => {
    return (
        <Text
            position={position}
            fontSize={0.15}
            color={color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.woff"
            outlineWidth={0.01}
            outlineColor="#000000"
        >
            {text}
        </Text>
    );
};

const ArchetypeMarker = ({ position, label, color, type = 'archetype', opacity = 1 }: { position: [number, number, number], label: string, color: string, type?: 'archetype' | 'member', opacity?: number }) => {
    return (
        <group position={position}>
            <mesh>
                {type === 'archetype' ? <sphereGeometry args={[0.05, 16, 16]} /> : <octahedronGeometry args={[0.08, 0]} />}
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={opacity} />
            </mesh>
            {/* Connection line to origin for Members */}
            {type === 'member' && (
                <Line points={[[0, 0, 0], [0, 0, 0]]} color={color} opacity={0.3} transparent lineWidth={1} />
            )}
            <Html distanceFactor={10}>
                <div className={`text-[8px] font-mono px-1 rounded backdrop-blur-sm whitespace-nowrap -translate-y-4 ${type === 'member' ? 'text-white bg-blue-900/50 border border-blue-500/30' : 'text-white/50 bg-black/50'}`}>
                    {label}
                </div>
            </Html>
        </group>
    );
};

const UserVector = ({ vector, intensity }: { vector: Vector3, intensity: number }) => {
    const ref = useRef<THREE.Group>(null);

    // Animate pulse based on intensity
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            const scale = 1 + Math.sin(t * (2 + intensity * 5)) * 0.1;
            ref.current.scale.setScalar(scale);
        }
    });

    return (
        <group ref={ref}>
            <Line
                points={[[0, 0, 0], [vector.x, vector.y, vector.z]]}
                color={intensity > 0.7 ? '#ef4444' : '#10b981'}
                lineWidth={3}
            />
            <mesh position={[vector.x, vector.y, vector.z]}>
                <octahedronGeometry args={[0.08, 0]} />
                <meshStandardMaterial
                    color={intensity > 0.7 ? '#ef4444' : '#10b981'}
                    emissive={intensity > 0.7 ? '#ef4444' : '#10b981'}
                    emissiveIntensity={2}
                    wireframe
                />
            </mesh>
            {/* Glow Halo */}
            <mesh position={[vector.x, vector.y, vector.z]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color={intensity > 0.7 ? '#ef4444' : '#10b981'} transparent opacity={0.2} />
            </mesh>
        </group>
    );
};

export const FamilyCube: React.FC<FamilyCubeProps> = ({ userState, members, showControls = true }) => {
    // Default neutral state if none provided
    const state = userState || {
        vector: { x: 0, y: 0, z: 0 },
        intensity: 0.1,
        flags: { orderLoop: false, chaosLoop: false, rotationEvent: false }
    };

    return (
        <div className="w-full h-full relative bg-[#09090b]">
            <Canvas camera={{ position: [3, 2, 4], fov: 40 }} gl={{ antialias: false }}>
                <color attach="background" args={['#050505']} />

                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                {showControls && <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={10} />}

                {/* --- Coordinate System --- */}

                {/* Boundary Cube (Wireframe) */}
                <Box args={[3, 3, 3]}>
                    <meshBasicMaterial color="#333" wireframe transparent opacity={0.1} />
                </Box>

                {/* Main Axes */}
                <group>
                    {/* X: Connection (+/-) */}
                    <Line points={[[-1.5, 0, 0], [1.5, 0, 0]]} color="#333" lineWidth={1} transparent opacity={0.5} />
                    <AxisLabel position={[1.8, 0, 0]} text="+Connection" color="#60a5fa" />
                    <AxisLabel position={[-1.8, 0, 0]} text="-Hostility" color="#f87171" />

                    {/* Y: Agency (+/-) */}
                    <Line points={[[0, -1.5, 0], [0, 1.5, 0]]} color="#333" lineWidth={1} transparent opacity={0.5} />
                    <AxisLabel position={[0, 1.7, 0]} text="+Agency" color="#fbbf24" />
                    <AxisLabel position={[0, -1.7, 0]} text="-Submission" color="#94a3b8" />

                    {/* Z: Meaning (+/-) */}
                    <Line points={[[0, 0, -1.5], [0, 0, 1.5]]} color="#333" lineWidth={1} transparent opacity={0.5} />
                    <AxisLabel position={[0, 0, 1.7]} text="+Meaning" color="#a78bfa" />
                    <AxisLabel position={[0, 0, -1.7]} text="-Survival" color="#475569" />
                </group>

                {/* Inner Grid Planes */}
                <gridHelper args={[3, 6, 0x222222, 0x111111]} position={[0, -1.5, 0]} />

                {/* --- Archetype Attractors (Static Reference Points) --- */}
                <ArchetypeMarker position={[1, 1, 1]} label="PROTAGONIST" color="#fbbf24" opacity={0.5} />
                <ArchetypeMarker position={[-1, 1, -1]} label="DESTROYER" color="#ef4444" opacity={0.5} />
                <ArchetypeMarker position={[1, -1, 1]} label="MARTYR" color="#a78bfa" opacity={0.5} />
                <ArchetypeMarker position={[-1, -1, 0]} label="GHOST" color="#94a3b8" opacity={0.5} />

                {/* --- Dynamic Family Members --- */}
                {members?.map(member => (
                    <group key={member.id}>
                        <ArchetypeMarker
                            position={[member.vector?.x || 0, member.vector?.y || 0, member.vector?.z || 0]}
                            label={member.role}
                            color="#3b82f6"
                            type="member"
                        />
                        {/* Member Vector Line */}
                        <Line
                            points={[[0, 0, 0], [member.vector?.x || 0, member.vector?.y || 0, member.vector?.z || 0]]}
                            color="#3b82f6"
                            lineWidth={1}
                            dashed
                            dashScale={5}
                            dashSize={0.2}
                            opacity={0.5}
                            transparent
                        />
                    </group>
                ))}

                {/* --- User Vector (The "Self") --- */}
                <UserVector vector={state.vector} intensity={state.intensity} />

                <EffectComposer enabled={true}>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.5} />
                </EffectComposer>

            </Canvas>

            {/* --- Overlay UI --- */}
            <div className="absolute bottom-4 left-4 p-4 pointer-events-none">
                <div className="font-mono text-xs text-white/50 mb-2">FAMILY SYSTEM STATE</div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${members && members.length > 0 ? 'bg-blue-500' : 'bg-zinc-800'}`} />
                        <span className="text-[10px] text-zinc-400">
                            {members ? `${members.length} ACTIVE NODES` : 'NO NODES DETECTED'}
                        </span>
                    </div>
                </div>
                {state.notes && (
                    <div className="mt-4 max-w-xs text-[10px] text-zinc-300 bg-black/50 p-2 border-l border-white/20">
                        {state.notes}
                    </div>
                )}
            </div>
        </div>
    );
};
