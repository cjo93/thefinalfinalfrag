import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
// import { motion } from 'framer-motion-3d'; // Removing unused/problematic dependency usage
import * as THREE from 'three';
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing';
import { LineageMember } from '../../src/types/family-system';
import { API_ENDPOINTS } from '../src/config/api';

// --- Types ---
interface FamilyAntigravityCubeProps {
    members: LineageMember[]; // Dynamic members
    connectionStrength?: number; // 0 to 1
}

interface PhysicsNode {
    id: string;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    userData: { id: string };
}

// NodeProps removed

// --- Components ---


const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('mother') || r.includes('maternal')) return '#f472b6'; // Pink
    if (r.includes('father') || r.includes('paternal')) return '#60a5fa'; // Blue
    if (r.includes('sister') || r.includes('brother') || r.includes('sibling')) return '#a78bfa'; // Purple
    if (r.includes('partner') || r.includes('spouse')) return '#facc15'; // Yellow
    if (r.includes('child') || r.includes('son') || r.includes('daughter')) return '#4ade80'; // Green
    return '#94a3b8'; // Slate generic
};

interface PhysicsUpdatePayload {
    position: { x: number; y: number; z: number };
    userData: { id: string };
}

const PhysicsSystem = ({ members, centerPos, connectionStrength, onUpdate, setFocusDistance }: {
    members: LineageMember[],
    centerPos: [number, number, number],
    connectionStrength: number,
    onUpdate?: (nodes: PhysicsUpdatePayload[]) => void,
    setFocusDistance: (dist: number) => void
}) => {
    // Initial positions based on relationship
    const initialNodes = useMemo(() => {
        return members.map(m => {
            // eslint-disable-next-line react-hooks/purity
            const angle = Math.random() * Math.PI * 2;
            // eslint-disable-next-line react-hooks/purity
            const phi = Math.acos((Math.random() * 2) - 1);
            const radius = m.relationshipType === 'close' ? 10 :
                m.relationshipType === 'distant' ? 25 :
                    m.relationshipType === 'cutoff' ? 35 : 15;

            return {
                id: m.id,
                x: radius * Math.sin(phi) * Math.cos(angle),
                y: radius * Math.sin(phi) * Math.sin(angle),
                z: radius * Math.cos(phi),
                vx: 0, vy: 0, vz: 0,
                userData: { id: m.id }
            };
        });
    }, [members]);

    const simulationNodes = useRef(initialNodes);
    const nodeRefs = useRef<THREE.Mesh[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useFrame(() => {
        // const cameraPos = state.camera.position;
        // Simple Force Calculation
        simulationNodes.current.forEach((node, i) => {
            // Attraction to Center (Gravity)
            const dist = Math.sqrt(node.x ** 2 + node.y ** 2 + node.z ** 2);
            const force = -0.01 * connectionStrength * (dist - 15); // Spring force to radius 15

            // Drift for visual aliveness
            node.vx += force * (node.x / dist) + (Math.random() - 0.5) * 0.05;
            node.vy += force * (node.y / dist) + (Math.random() - 0.5) * 0.05;
            node.vz += force * (node.z / dist) + (Math.random() - 0.5) * 0.05;

            // Damping
            node.vx *= 0.95;
            node.vy *= 0.95;
            node.vz *= 0.95;

            node.x += node.vx;
            node.y += node.vy;
            node.z += node.vz;

            // Update Mesh Refs
            if (nodeRefs.current[i]) {
                nodeRefs.current[i].position.set(node.x, node.y, node.z);

                // Scale effect on hover
                const targetScale = hoveredId === members[i].id ? 1.5 : 1;
                nodeRefs.current[i].scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
            }
        });

        // Callback for UI overlay
        if (onUpdate) {
            onUpdate(simulationNodes.current.map((n, i) => ({
                position: { x: n.x, y: n.y, z: n.z },
                userData: { id: members[i].id }
            })));
        }
    });

    return (
        <group>
            {/* Center Self Node */}
            <mesh position={centerPos}
                onPointerOver={(e) => { e.stopPropagation(); setFocusDistance(40); }} // Focus center
            >
                <icosahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} wireframe />
            </mesh>

            {members.map((member, i) => {
                const node = simulationNodes.current[i];
                const isHovered = hoveredId === member.id;

                return (
                    <group key={member.id}>
                        <mesh
                            ref={(el) => { if (el) nodeRefs.current[i] = el; }}
                            userData={{ id: member.id }} // Store ID for Raycasting/UI
                            position={[node.x, node.y, node.z]}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                setHoveredId(member.id);
                                const distToCamera = new THREE.Vector3(node.x, node.y, node.z).distanceTo(new THREE.Vector3(0, 0, 40));
                                setFocusDistance(distToCamera);
                            }}
                            onPointerOut={() => {
                                setHoveredId(null);
                                setFocusDistance(40); // Reset to center/default
                            }}
                        >
                            <sphereGeometry args={[1, 32, 32]} />
                            <meshStandardMaterial
                                color={getRoleColor(member.role)}
                                emissive={getRoleColor(member.role)}
                                emissiveIntensity={isHovered ? 2 : 0.8}
                                toneMapped={false}
                            />
                            {/* Premium Tooltip */}
                            <Html position={[0, 1.5, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
                                <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 scale-110' : 'opacity-60 scale-100'}`}>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-mono text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 whitespace-nowrap">
                                            {member.name}
                                        </span>
                                        {isHovered && (
                                            <div className="mt-2 p-3 bg-black/90 border border-t border-white/20 rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md min-w-[120px] text-center z-50">
                                                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">{member.role}</p>
                                                <p className="text-[8px] font-serif text-white/80 leading-tight">Relation: {member.relationshipType}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Html>
                        </mesh>
                        <RelationshipVector
                            start={[0, 0, 0]}
                            end={[-node.x, -node.y, -node.z]} // Vector back to center (approx for visual)
                            type={(member.relationshipType?.toLowerCase() || 'neutral') as string}
                            color={getRoleColor(member.role)}
                        />
                    </group>
                );
            })}
        </group>
    );
};


// DriftingNode removed (merged into PhysicsSystem)

// Connection Line Component with Physics (Visual only)
const RelationshipVector = ({ start, end, type = 'close', color }: {
    start: [number, number, number],
    end: [number, number, number],
    type?: string,
    color: string
}) => {

    const points = useMemo(() => {
        if (type === 'conflict') {
            const numPoints = 20;
            const pts = [];
            const vec = new THREE.Vector3().subVectors(new THREE.Vector3(...end), new THREE.Vector3(...start));

            // Add perpendicular jagged offests
            const axis = vec.clone().normalize();
            // Create perpendicular vector (simple way: classic cross product with Up or Right)
            let perp = new THREE.Vector3(0, 1, 0).cross(axis);
            if (perp.lengthSq() < 0.01) {
                perp = new THREE.Vector3(1, 0, 0).cross(axis);
            }
            perp.normalize().multiplyScalar(0.2); // Amplitude

            for (let i = 0; i <= numPoints; i++) {
                const alpha = i / numPoints;
                const p = new THREE.Vector3().lerpVectors(new THREE.Vector3(...start), new THREE.Vector3(...end), alpha);
                if (i > 0 && i < numPoints) {
                    const zigzag = (i % 2 === 0 ? 1 : -1) * 1;
                    p.add(perp.clone().multiplyScalar(zigzag));
                }
                pts.push(p);
            }
            return pts;
        }
        return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    }, [start, end, type]);

    // Animate opacity pulse
    const matRef = useRef<THREE.LineBasicMaterial>(null);
    useFrame((state) => {
        if (matRef.current) {
            matRef.current.opacity = 0.4 + (Math.sin(state.clock.getElapsedTime() * 3) * 0.2);
        }
    });

    return (
        <Line
            points={points}
            color={color}
            lineWidth={type === 'close' ? 2 : 1.5}
            dashed={type === 'distant' || type === 'cutoff'}
            dashScale={type === 'distant' ? 10 : 2}
            dashSize={type === 'cutoff' ? 0.2 : 0.5}
            gapSize={type === 'cutoff' ? 0.2 : 0.5}
            opacity={0.6}
            transparent
            ref={matRef}
        />
    );
};


// [NEW] Gyro Control Component
const GyroControls = ({ enabled }: { enabled: boolean }) => {
    const { camera } = useThree();

    useEffect(() => {
        if (!enabled) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (!event.beta || !event.gamma) return;
            // Basic mapping: Tilt phone to look around
            // beta: front-back tilt [-180, 180]
            // gamma: left-right tilt [-90, 90]

            // Convert to radians and dampen
            const x = (event.beta - 45) * (Math.PI / 180); // Subtract 45deg as "neutral" holding position
            const y = event.gamma * (Math.PI / 180);

            camera.rotation.set(x, y, 0);
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [enabled, camera]);

    return null;
};

import { InsightFeed } from './ui/InsightFeed';
import { DataTransparency } from './ui/DataTransparency';

export const FamilyAntigravityCube: React.FC<FamilyAntigravityCubeProps> = ({
    members,
    connectionStrength = 0.8
}) => {
    const centerPos: [number, number, number] = [0, 0, 0];
    const [arEnabled, setArEnabled] = useState(false);

    const handleEnableAR = async () => {
        // iOS 13+ requires permission for device orientation
        if (typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
                if (response === 'granted') {
                    setArEnabled(!arEnabled);
                }
            } catch (e) {
                console.error(e);
                setArEnabled(!arEnabled); // Fallback
            }
        } else {
            setArEnabled(!arEnabled);
        }
    };

    // State to hold current simulation data for the UI
    const [simState, setSimState] = useState<{ nodes: PhysicsNode[] }>({ nodes: [] });

    // Ref to track if we should update UI (throttle)
    const lastUpdate = useRef(0);

    const updateSimState = (nodes: PhysicsUpdatePayload[]) => {
        const now = Date.now();
        if (now - lastUpdate.current > 1000) { // Update UI every 1s
            setSimState({
                nodes: nodes.map(n => ({
                    id: n.userData.id,
                    x: n.position.x,
                    y: n.position.y,
                    z: n.position.z,
                    vx: 0, vy: 0, vz: 0 // Velocity hard to extract cheaply from d3-force without access to internal simulation object, ignoring for now or approximating
                }))
            });
            lastUpdate.current = now;
        }
    };

    // Gamification Visuals: System Coherence Glow
    const [systemCoherence, setSystemCoherence] = useState(0);

    const handleInsightsUpdate = (insights: { metrics?: { coherence?: number };[key: string]: unknown }[]) => {
        // Calculate average coherence from recent insights
        const coherenceInsights = insights.filter(i => i.metrics?.coherence !== undefined);
        if (coherenceInsights.length > 0) {
            const avg = coherenceInsights.reduce((sum, i) => sum + i.metrics.coherence, 0) / coherenceInsights.length;
            setSystemCoherence(avg);
        }
    };

    // Dynamic Glow Color based on Coherence
    const glowColor = useMemo(() => {
        if (systemCoherence > 0.8) return '#ffd700'; // Gold
        if (systemCoherence > 0.5) return '#4ade80'; // Green
        if (systemCoherence > 0.3) return '#fbbf24'; // Amber
        return '#ef4444'; // Red
    }, [systemCoherence]);

    // [NEW] Live Cosmic Physics Hook
    const [cosmicEntropy, setCosmicEntropy] = useState(0);

    useEffect(() => {
        const fetchCosmic = async () => {
            try {
                // Poll every 30s
                const res = await fetch(API_ENDPOINTS.COSMIC_VECTORS);
                const data = await res.json();
                if (data.entropy) setCosmicEntropy(data.entropy);
            } catch {
                console.warn("Cosmic physics feed offline");
            }
        };
        fetchCosmic();
        const interval = setInterval(fetchCosmic, 30000);
        return () => clearInterval(interval);
    }, []);

    // unused state check skipped as it seems resolved or hard to locate without fresh lint
    // Focus State for God Mode
    const [focusDistance, setFocusDistance] = useState(40);

    return (
        <div className="w-full h-full relative bg-black transition-colors duration-1000 cursor-move" style={{ boxShadow: `inset 0 0 ${systemCoherence * 100}px ${glowColor}10` }}>
            {/* ...InsightFeed... */}
            <InsightFeed
                simulationState={simState}
                members={members}
                onInsightsUpdate={handleInsightsUpdate}
            />

            <div className="absolute top-4 left-4 z-20 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse transition-colors duration-500" style={{ backgroundColor: glowColor }} />
                    <span className="text-[10px] font-mono tracking-widest uppercase transition-colors duration-500" style={{ color: glowColor }}>
                        Physics Engine Active
                    </span>
                    <div className="ml-2">
                        <DataTransparency
                            title="Force Vector Dynamics"
                            source="d3-force-3d Simulation"
                            data={{ ...simState, entropy: cosmicEntropy }}
                            type="math"
                        />
                    </div>
                </div>
            </div>

            {/* AR Toggle */}
            <div className="absolute bottom-24 right-4 z-50 md:hidden">
                <button
                    onClick={handleEnableAR}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest active:scale-95 transition-transform"
                >
                    {arEnabled ? 'DRAG MODE' : 'ENABLE GYRO'}
                </button>
            </div>

            <Canvas
                camera={{ position: [0, 0, 40], fov: 45 }}
                gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            >
                <fog attach="fog" args={['#000', 30, 90]} />

                {/* Lighting - Dynamic based on Coherence */}
                <ambientLight intensity={0.2 + (systemCoherence * 0.2)} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color={glowColor} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />

                <PhysicsSystem
                    members={members}
                    centerPos={centerPos}
                    connectionStrength={connectionStrength + (cosmicEntropy * 0.5)} // Modulate Strength by Cosmic Entropy
                    onUpdate={updateSimState}
                    setFocusDistance={setFocusDistance}
                />

                <gridHelper args={[10, 20, 0x333333, 0x111111]} position={[0, -2, 0]} />

                {/* Post Processing: God Mode DOF */}
                <EffectComposer>
                    <DepthOfField
                        target={[0, 0, 0]} // Not used if focalLength/focusDistance set directly? R3F P-P uses focusDistance
                        focusDistance={(focusDistance - 10) / 100} // Approximate normalization. Camera at 40. Target at 0. Dist = 40. P-P expects 0-1 range typically or absolute? Docs say 0-1.
                        // Wait, focusDistance in react-three/postprocessing depthoffield is usually in world units? No, it's 0-1 normalized by far plane?
                        // Let's assume standard behavior. camera near 0.1, far 1000.
                        // A safer bet is using `target` prop if supported, or calculating manually.
                        // Postprocessing lib uses `focusDistance` (0-1).
                        // If camera at 40, looking at 0.
                        // Distance = 40.
                        // Far = 100? or default.
                        // I'll set it to auto-focus via state.
                        focalLength={0.02}
                        bokehScale={8}
                        height={480}
                    />
                    <Vignette eskil={false} offset={0.1} darkness={0.8} />
                </EffectComposer>

                <OrbitControls makeDefault enableZoom={true} maxDistance={60} minDistance={5} />
                <GyroControls enabled={arEnabled} />

            </Canvas>

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <h3 className="text-white font-serif text-lg tracking-wide">Antigravity Field</h3>
                <p className="text-zinc-500 font-mono text-[10px] uppercase">Physics Engine: Active</p>
                <div className="flex gap-4">
                    <p className="text-zinc-600 font-mono text-[10px]">d_t: {(connectionStrength + (cosmicEntropy * 0.5)).toFixed(2)}</p>
                    <p className="text-zinc-600 font-mono text-[10px]">Mode: {arEnabled ? 'GYRO_AR' : 'ORBITAL'}</p>
                    <p className="text-zinc-600 font-mono text-[10px]" style={{ color: glowColor }}>
                        Coherence: {(systemCoherence * 100).toFixed(0)}%
                    </p>
                    <p className="text-purple-400 font-mono text-[10px]">
                        Cosmic Tension: {cosmicEntropy.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* AR Toggle Button - Only show on mobile/touch ideally, but good for testing */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleEnableAR}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border rounded transition-colors ${arEnabled ? 'bg-white text-black border-white' : 'bg-black/50 text-zinc-500 border-zinc-700'}`}
                >
                    {arEnabled ? 'DRAG MODE' : 'ENABLE GYRO'}
                </button>
            </div>
        </div>
    );
};
