import React, { useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line, Circle, Ring, Plane, Grid, Billboard, OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

export interface RelationalGeometry {
    architecture: string;
    tension_node: string;
    resolution: string;
}

interface TopologyGraphProps {
    data?: RelationalGeometry;
}

// --- SYSTEM SYMBOLS (Bowen-inspired Technical Glyphs) ---

const SystemNode: React.FC<{
    position: [number, number, number],
    color: string,
    size: number,
    label?: string,
    shape?: 'circle' | 'square' | 'triangle'
}> = ({ position, color, size, label, shape = 'circle' }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <group position={position}>
            <Billboard>
                <group
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    scale={hovered ? 1.1 : 1}
                >
                    {/* Main Glyph */}
                    {shape === 'circle' && (
                        <>
                            <Circle args={[size, 32]}>
                                <meshBasicMaterial color="black" />
                            </Circle>
                            <Ring args={[size * 0.9, size, 32]}>
                                <meshBasicMaterial color={color} />
                            </Ring>
                            {/* Center Dot for focus */}
                            <Circle args={[size * 0.2, 16]}>
                                <meshBasicMaterial color={color} transparent opacity={0.5} />
                            </Circle>
                        </>
                    )}

                    {shape === 'square' && (
                        <Plane args={[size * 1.8, size * 1.8]}>
                            <meshBasicMaterial color={color} wireframe />
                            <meshBasicMaterial color="black" polygonOffset polygonOffsetFactor={1} />
                        </Plane>
                    )}

                    {shape === 'triangle' && (
                        <Circle args={[size, 3]} rotation={[0, 0, Math.PI / 6]}>
                            <meshBasicMaterial color={color} wireframe />
                        </Circle>
                    )}

                    {/* Label */}
                    {label && (
                        <Text
                            position={[0, -size * 1.8, 0]}
                            fontSize={0.25}
                            color={hovered ? "white" : "#71717a"} // Zinc-500 default
                            font="/fonts/Inter-Medium.ttf"
                            anchorX="center"
                            anchorY="top"
                        >
                            {label.toUpperCase()}
                        </Text>
                    )}
                </group>
            </Billboard>
        </group>
    );
};

const RelationshipLine: React.FC<{
    start: [number, number, number],
    end: [number, number, number],
    type: 'close' | 'conflict' | 'distant' | 'cutoff',
    color: string
}> = ({ start, end, type, color }) => {

    // Logic for different line styles (Bowen theory style)
    // Close = Double line or Solid
    // Conflict = Jagged (ZigZag)
    // Distant = Dashed
    // Cutoff = Broken line with gap

    const points = useMemo(() => {
        if (type === 'conflict') {
            const numPoints = 20;
            const pts = [];
            const vec = new THREE.Vector3().subVectors(new THREE.Vector3(...end), new THREE.Vector3(...start));
            const axis = vec.normalize();
            const perp = new THREE.Vector3(-axis.y, axis.x, 0).multiplyScalar(0.1);

            for (let i = 0; i <= numPoints; i++) {
                const alpha = i / numPoints;
                const p = new THREE.Vector3().lerpVectors(new THREE.Vector3(...start), new THREE.Vector3(...end), alpha);
                if (i > 0 && i < numPoints) {
                    const zigzag = (i % 2 === 0 ? 1 : -1) * (Math.sin(alpha * Math.PI) * 0.2);
                    p.add(perp.clone().multiplyScalar(zigzag));
                }
                pts.push(p);
            }
            return pts;
        }
        return [start, end];
    }, [start, end, type]);

    return (
        <Line
            points={points}
            color={color}
            lineWidth={type === 'close' ? 3 : 1.5}
            dashed={type === 'distant' || type === 'cutoff'}
            dashScale={type === 'distant' ? 10 : 2}
            dashSize={type === 'cutoff' ? 0.2 : 0.5}
            gapSize={type === 'cutoff' ? 0.2 : 0.5}
            opacity={0.8}
            transparent
        />
    );
};

const SystemMapScene = ({ data }: { data?: RelationalGeometry }) => {
    // Layout: Radial System Map
    // Center: Self
    // Periphery: Family Members / Nodes

    return (
        <group rotation={[-Math.PI / 2, 0, 0]}> {/* Rotate to lie flat on "paper" */}
            {/* Background Paper Grid */}
            <Grid
                position={[0, 0, -0.1]}
                args={[20, 20]}
                cellColor="#27272a"
                sectionColor="#3f3f46"
                fadeDistance={30}
            />

            {/* SELF */}
            <SystemNode position={[0, 0, 0]} color="white" size={0.6} label="SELF" shape="circle" />

            {/* RELATIONSHIPS & NODES */}
            {/* Example: Resolution Node (Positive/Close) */}
            <SystemNode position={[0, 4, 0]} color="#10b981" size={0.5} label={data?.resolution || 'RESOLUTION'} shape="triangle" />
            <RelationshipLine start={[0, 0.6, 0]} end={[0, 3.4, 0]} type="close" color="#047857" />

            {/* Example: Tension Node (Conflict) */}
            <SystemNode position={[3.5, -2, 0]} color="#ef4444" size={0.5} label={data?.tension_node || 'TENSION'} shape="square" />
            <RelationshipLine start={[0.5, -0.3, 0]} end={[3.0, -1.6, 0]} type="conflict" color="#ef4444" />

            {/* Example: Distant Node */}
            <SystemNode position={[-3.5, -2, 0]} color="#71717a" size={0.4} label="ANCESTRY" shape="circle" />
            <RelationshipLine start={[-0.5, -0.3, 0]} end={[-3.1, -1.6, 0]} type="cutoff" color="#52525b" />

        </group>
    );
};

export const TopologyGraph: React.FC<TopologyGraphProps> = ({ data }) => {
    const [showHelp, setShowHelp] = useState(false);
    const controlsRef = useRef<unknown>(null);

    return (
        <div className="w-full h-full relative bg-[#09090b] font-sans">
            {/* Overlay UI - Simplified for Technical View */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="border-l-2 border-white pl-4">
                    <h3 className="text-white font-serif text-2xl tracking-tighter">DIFFERENTIATION OF SELF</h3>
                    <p className="text-zinc-500 text-[10px] font-mono tracking-[0.2em] mt-1">
                        BOWEN SYSTEM MAP // 2D PROJECTION
                    </p>
                </div>
            </div>

            <div className="absolute top-6 right-6 z-10 flex gap-2">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="w-8 h-8 rounded-full border border-zinc-700 bg-black text-zinc-400 hover:text-white hover:border-white transition-colors flex items-center justify-center font-mono text-xs"
                >
                    ?
                </button>
            </div>

            {/* HELP OVERLAY */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-20 right-6 w-64 z-30 bg-zinc-900/90 border border-zinc-700 p-4 shadow-xl backdrop-blur-md rounded-sm"
                    >
                        <h4 className="text-white font-mono text-xs uppercase mb-3 border-b border-white/10 pb-2">Legend</h4>
                        <div className="space-y-3 text-[10px] text-zinc-400 font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-0.5 bg-emerald-600"></span>
                                <span>Solid Line: Close/Fused</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-1 flex"><span className="w-1 h-full bg-red-500 skew-x-12"></span><span className="w-1 h-full bg-red-500 -skew-x-12"></span></div>
                                <span>Jagged: Conflict</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-0.5 border-t border-dashed border-zinc-500"></span>
                                <span>Dashed: Distant/Cutoff</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas>
                <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} />
                <color attach="background" args={['#09090b']} />

                <OrbitControls
                    ref={controlsRef}
                    enableRotate={false} /* Lock Rotation for 2D feel - Pan/Zoom only */
                    enableZoom={true}
                    enablePan={true}
                    minZoom={20}
                    maxZoom={100}
                />

                <SystemMapScene data={data} />

                <EffectComposer enabled={true}>
                    <Bloom luminanceThreshold={0.5} intensity={0.5} radius={0.2} />
                </EffectComposer>
            </Canvas>

            {/* Cinematic Data HUD */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12 md:right-12 z-10 flex flex-col md:flex-row justify-between items-end pointer-events-none gap-6"
                >
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full md:w-auto">
                        <div className="bg-black/40 backdrop-blur-sm p-4 border-l border-red-500/50">
                            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Vector_01 // Tension
                            </div>
                            <div className="text-white font-bold text-lg tracking-wide">{data.tension_node}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Primary friction point</div>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm p-4 border-l border-emerald-500/50">
                            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Vector_02 // Resolution
                            </div>
                            <div className="text-white font-bold text-lg tracking-wide">{data.resolution}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">Recommended output path</div>
                        </div>
                    </div>

                    <div className="text-right bg-black/40 backdrop-blur-sm p-4 border-r border-white/20">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">System Architecture</div>
                        <div className="text-white font-serif text-xl italic tracking-wide">{data.architecture}</div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
