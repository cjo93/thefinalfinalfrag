import React, { useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollControls, useScroll } from '@react-three/drei';

// --- Types ---

export interface TimelineEvent {
    id: string;
    time: string; // ISO
    type: 'SYNC' | 'SOMATIC' | 'RELATIONAL' | 'SYSTEM';
    shadowId?: string;
    recurrenceScore: number; // 0-10
    importance: number; // 0-10
    labels: string[];
    narrative?: string;
}

interface CorkscrewTimelineProps {
    events?: TimelineEvent[];
}

// --- Constants ---
const SPIRAL_RADIUS = 3;
const COILS = 8;
const LENGTH_PER_COIL = 10;

// --- Helper Components ---

const CorkscrewCurve = () => {
    const curve = useMemo(() => {
        const points = [];
        // Create a long spiral along Z
        const totalPoints = 500;
        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const angle = t * Math.PI * 2 * COILS;
            // User asked: "Main corkscrew: A spiral running along forward Z+"

            const zPos = t * (COILS * LENGTH_PER_COIL);
            const x = Math.cos(angle) * SPIRAL_RADIUS;
            const y = Math.sin(angle) * SPIRAL_RADIUS;
            points.push(new THREE.Vector3(x, y, zPos));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    const tubeConfig = useMemo(() => {
        return new THREE.TubeGeometry(curve, 300, 0.05, 8, false);
    }, [curve]);

    return (
        <mesh>
            <primitive object={tubeConfig} />
            <meshBasicMaterial color="#222" transparent opacity={0.6} wireframe={false} />
            {/* Wireframe overlay for 'tech' feel */}
            <lineSegments>
                <wireframeGeometry args={[tubeConfig]} />
                <lineBasicMaterial color="#333" transparent opacity={0.3} />
            </lineSegments>
        </mesh>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EventNode: React.FC<{ event: TimelineEvent, zPosition: number, onHover: (e: any) => void }> = ({ event, zPosition, onHover }) => {
    // Calculate position on spiral at this Z
    // t = z / total_length roughly, but we need x/y
    const t = zPosition / (COILS * LENGTH_PER_COIL);
    const angle = t * Math.PI * 2 * COILS;
    const x = Math.cos(angle) * SPIRAL_RADIUS;
    const y = Math.sin(angle) * SPIRAL_RADIUS;

    // Color mapping
    const color = event.type === 'SYNC' ? '#10b981' : // Emerald
        event.type === 'SOMATIC' ? '#f59e0b' : // Amber
            event.type === 'RELATIONAL' ? '#ec4899' : // Pink
                '#6366f1'; // Indigo

    const size = 0.2 + (event.importance * 0.05);

    return (
        <group position={[x, y, zPosition]}>
            <mesh onPointerOver={onHover} onPointerOut={() => onHover(null)}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5 + (event.recurrenceScore * 0.1)} />
            </mesh>
            {/* Connector line to center? Optional, maybe too noisy */}
        </group>
    );
};

const CameraRig = ({ onScrolled }: { onScrolled: (z: number) => void }) => {
    const scroll = useScroll();

    useFrame((state) => {
        // Scroll.offset is 0-1
        // Map to total length
        const totalLen = COILS * LENGTH_PER_COIL;
        const currentZ = scroll.offset * totalLen;

        // Move camera along spiral center
        // Look slightly ahead
        const lookAtZ = currentZ + 5;

        // Smooth camera movement
        state.camera.position.set(0, 0, currentZ - 5); // Behind current point
        state.camera.lookAt(0, 0, lookAtZ);

        // Signal scroll position back up for UI sync if needed
        onScrolled(currentZ);
    });

    return null;
};

// --- Main Component ---

export const CorkscrewTimeline: React.FC<CorkscrewTimelineProps> = ({ events = [] }) => {
    // Generate mock if needed
    const displayEvents = useMemo(() => {
        if (events.length > 0) return events;
        return Array.from({ length: 20 }).map((_, i) => ({
            id: `evt_${i}`,
            time: new Date().toISOString(),
            type: ['SYNC', 'SOMATIC', 'RELATIONAL', 'SYSTEM'][i % 4] as TimelineEvent['type'],
            recurrenceScore: i % 5,
            importance: (i % 3) + 1,
            labels: ['Pattern A'],
            narrative: `Event ${i}: Synchronistic convergence detected.`
        })) as TimelineEvent[];
    }, [events]);

    const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);

    return (
        <div className="w-full h-full relative bg-gradient-to-b from-black to-[#0a0a0a]">
            <Canvas>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <ScrollControls pages={4} damping={0.2}>
                    <CorkscrewCurve />

                    {displayEvents.map((evt, i) => {
                        // Distribute events along the Z axis
                        const zPos = (i / displayEvents.length) * (COILS * LENGTH_PER_COIL) * 0.9;
                        return (
                            <EventNode
                                key={evt.id}
                                event={evt}
                                zPosition={zPos}
                                onHover={(e) => setActiveEvent(e ? evt : null)}
                            />
                        );
                    })}

                    <CameraRig onScrolled={() => { }} />
                </ScrollControls>
            </Canvas>

            {/* HUD / Tooltip */}
            {activeEvent && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] bg-black/90 border border-white/20 p-4 w-72 backdrop-blur-md rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{activeEvent.type}</span>
                        <span className="text-[9px] font-mono text-zinc-600">{activeEvent.time.split('T')[0]}</span>
                    </div>
                    <p className="text-sm text-zinc-300 font-light leading-relaxed mb-3">
                        {activeEvent.narrative}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                        {activeEvent.labels.map(l => (
                            <span key={l} className="px-1.5 py-0.5 bg-white/10 text-[9px] text-zinc-400 rounded-sm">
                                {l}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* View Label */}
            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest pointer-events-none">
                VIEW: CHRONO_CORKSCREW // SYNC_LOG
            </div>
            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest pointer-events-none animate-pulse">
                SCROLL TO NAVIGATE
            </div>
        </div>
    );
};

export default CorkscrewTimeline;
