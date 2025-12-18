import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---

export interface AxisSample {
    time: string; // ISO
    intensity: number; // Spiral radius
    zAxis: number; // Vertical position
    coherence: number; // 0-1 (Color)
    entropy: number;
    mirrorState: 'CLEAR' | 'FOGGED' | 'CRACKED';
    patternIds: string[];
}

interface SelfPolarityAxisProps {
    data?: AxisSample[];
}

// --- Constants ---

// --- Helper Components ---

const AxisLines = () => {
    return (
        <group>
            {/* X Axis - Red tint (subtle) */}
            <line>
                <bufferGeometry attach="geometry" attributes-position={new THREE.Float32BufferAttribute([-50, 0, 0, 50, 0, 0], 3)} />
                <lineBasicMaterial attach="material" color="#331111" transparent opacity={0.3} />
            </line>
            {/* Y Axis - Green tint (subtle) */}
            <line>
                <bufferGeometry attach="geometry" attributes-position={new THREE.Float32BufferAttribute([0, -50, 0, 0, 50, 0], 3)} />
                <lineBasicMaterial attach="material" color="#113311" transparent opacity={0.3} />
            </line>
            {/* Z Axis - Blue tint (subtle) */}
            <line>
                <bufferGeometry attach="geometry" attributes-position={new THREE.Float32BufferAttribute([0, 0, -50, 0, 0, 50], 3)} />
                <lineBasicMaterial attach="material" color="#111133" transparent opacity={0.3} />
            </line>
        </group>
    );
};

const SpiralData = ({ data, onHover }: { data: AxisSample[], onHover: (sample: AxisSample | null, pos: THREE.Vector3 | null) => void }) => {
    const points = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map((d, i) => {
            // Map data to 3D coordinates
            // Angle based on index (time progression)
            const angle = i * 0.5;
            const radius = d.intensity * 5; // Scale radius
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = d.zAxis * 10 - (data.length * 0.1); // Center vertically roughly
            return new THREE.Vector3(x, y, z);
        });
    }, [data]);

    const curve = useMemo(() => {
        if (points.length < 2) return null;
        return new THREE.CatmullRomCurve3(points);
    }, [points]);

    const lineGeometry = useMemo(() => {
        if (!curve) return null;
        return new THREE.TubeGeometry(curve, points.length * 4, 0.05, 8, false);
    }, [curve, points.length]);

    // Color gradient based on coherence
    const colors = useMemo(() => {
        if (!lineGeometry || !data) return null;
        const count = lineGeometry.attributes.position.count;
        const colorArray = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            // Map vertex index back to data index approximately
            const t = i / count;
            const dataIndex = Math.floor(t * (data.length - 1));
            const sample = data[dataIndex] || data[data.length - 1];

            // Coherence: 0 (Red/Chaos) -> 1 (Cyan/Order)
            // Using DEFRAG muted spectrum
            // Low coherence: #331111 (Red-ish black)
            // High coherence: #113333 (Cyan-ish black) or #EEEEEE (White/Light)

            if (sample.coherence < 0.5) {
                color.setHSL(0, 0.5, 0.2 + sample.coherence * 0.2); // Red hue
            } else {
                color.setHSL(0.5, 0.5, 0.2 + (sample.coherence - 0.5) * 0.4); // Cyan hue
            }

            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }
        return new THREE.BufferAttribute(colorArray, 3);
    }, [lineGeometry, data]);

    // Apply colors to geometry
    React.useLayoutEffect(() => {
        if (lineGeometry && colors) {
            lineGeometry.setAttribute('color', colors);
        }
    }, [lineGeometry, colors]);

    // Interaction logic

    return (
        <group>
            {lineGeometry && (
                <mesh onPointerOver={(e) => onHover(data[Math.floor(data.length / 2)], e.point)} onPointerOut={() => onHover(null, null)}>
                    <primitive object={lineGeometry} />
                    <meshBasicMaterial vertexColors transparent opacity={0.8} />
                </mesh>
            )}

            {/* Interactive Nodes (Invisible hit targets) */}
            {points.map((p, i) => (
                <mesh key={i} position={p} onPointerOver={(e) => { e.stopPropagation(); onHover(data[i], p); }}>
                    <sphereGeometry args={[0.3, 8, 8]} />
                    <meshBasicMaterial color="white" transparent opacity={0.0} />
                    {/* Make visible on hover? Logic handled by state in parent */}
                </mesh>
            ))}
        </group>
    );
};

// --- Main Component ---

export const SelfPolarityAxis: React.FC<SelfPolarityAxisProps> = ({ data = [] }) => {
    // Generate mock data if none provided
    // Generate mock data once to ensure purity/stability
    const [mockData] = useState<AxisSample[]>(() =>
        Array.from({ length: 50 }).map((_, i) => ({
            time: new Date(Date.now() - (50 - i) * 86400000).toISOString(),
            intensity: 0.5 + Math.sin(i * 0.2) * 0.3,
            zAxis: (i - 25) * 0.2,
            coherence: 0.3 + (i / 50) * 0.6,
            entropy: Math.random() * 0.5,
            mirrorState: (i > 40 ? 'CLEAR' : i > 20 ? 'FOGGED' : 'CRACKED') as 'CLEAR' | 'FOGGED' | 'CRACKED',
            patternIds: ['pat_123']
        }))
    );

    const displayData = data.length > 0 ? data : mockData;

    const [tooltip, setTooltip] = useState<{ sample: AxisSample, pos: THREE.Vector3 } | null>(null);

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-black to-[#050505]">
            <Canvas camera={{ position: [15, 10, 15], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <AxisLines />
                <SpiralData
                    data={displayData}
                    onHover={(sample, pos) => setTooltip(sample && pos ? { sample, pos } : null)}
                />

                {/* Highlight Point */}
                {tooltip && (
                    <mesh position={tooltip.pos}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                )}

                <OrbitControls
                    enablePan={false}
                    minDistance={5}
                    maxDistance={50}
                    autoRotate={!tooltip}
                    autoRotateSpeed={1.0}
                />
            </Canvas>

            {/* DOM Tooltip */}
            {tooltip && (
                <div className="absolute top-4 right-4 bg-black/80 border border-white/20 p-4 w-64 backdrop-blur-md z-10 pointer-events-none">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        {new Date(tooltip.sample.time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${tooltip.sample.mirrorState === 'CLEAR' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {tooltip.sample.mirrorState}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">
                            COH: {(tooltip.sample.coherence * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            )}

            {/* View Label */}
            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest pointer-events-none">
                VIEW: POLARITY_AXIS // ISO-8601
            </div>
        </div>
    );
};

export default SelfPolarityAxis;
