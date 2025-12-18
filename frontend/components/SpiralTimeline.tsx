import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, X, Activity } from 'lucide-react';

// Type definitions matching the backend
interface TimelineEvent {
    id: string;
    time: string; // ISO String
    type: 'SYNC' | 'SOMATIC' | 'RELATIONAL' | 'SYSTEM';
    recurrenceScore: number;
    importance: number;
    labels: string[];
    narrative?: string;
    location?: string;
    media_url?: string;
}

export interface LogEventData {
    type: string;
    narrative: string;
    location: string;
    media_url: string | null;
}

interface SpiralTimelineProps {
    events: TimelineEvent[];
    onLogEvent?: (data: LogEventData) => void;
}

export const SpiralTimeline: React.FC<SpiralTimelineProps> = ({ events, onLogEvent }) => {
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
    const [isLogging, setIsLogging] = useState(false);

    // Filter to valid events and sort by date (newest first)
    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }, [events]);

    // Helix Constants
    const RADIUS = 120; // Radius of the spiral
    const DEPTH_PER_EVENT = 80; // Distance between items on Z axis
    const ANGLE_PER_EVENT = 45; // Degrees of rotation per item

    return (
        <div className="relative w-full h-[600px] perspective-[1000px] overflow-hidden bg-black/40 border border-white/5 rounded-lg flex items-center justify-center">

            {/* Background Grid */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none"></div>

            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 pointer-events-none">
                <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">Temporal Helix</h3>
                    <p className="font-sans text-[10px] text-zinc-600">Recursive Event Log // V.1.0</p>
                </div>
                <button
                    onClick={() => setIsLogging(true)}
                    className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-tech-gold/10 border border-tech-gold/30 text-tech-gold hover:bg-tech-gold hover:text-black transition-colors rounded-sm"
                >
                    <Plus size={12} />
                    <span className="font-mono text-[9px] uppercase tracking-widest">Log Event</span>
                </button>
            </div>

            {/* The Spiral Container */}
            <div className="relative transform-style-3d w-full h-full flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 transform-style-3d">
                    {/* Render Events */}
                    {sortedEvents.map((evt, index) => {
                        // Calculate Position
                        const angle = index * ANGLE_PER_EVENT;
                        const radian = (angle * Math.PI) / 180;

                        // Spiral Equation
                        const x = Math.cos(radian) * RADIUS;
                        const y = Math.sin(radian) * RADIUS;
                        const z = -index * DEPTH_PER_EVENT; // Growing away from screen

                        // Dynamic Opacity based on depth
                        const opacity = Math.max(0.1, 1 - (index / 12));
                        const scale = Math.max(0.2, 1 - (index / 20));

                        return (
                            <motion.div
                                key={evt.id}
                                className="absolute top-0 left-0 transform-style-3d group cursor-pointer"
                                style={{
                                    x: x,
                                    y: y,
                                    z: z,
                                    rotateY: -angle // Keep text somewhat facing front if desired, or let it rotate
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: opacity, scale: scale, x, y, z }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                onClick={() => setSelectedEvent(evt)}
                            >
                                {/* Event Node */}
                                <div className={`relative w-12 h-12 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center
                                    ${evt.type === 'SYNC' ? 'bg-tech-gold/10 border-tech-gold/50' : ''}
                                    ${evt.type === 'SOMATIC' ? 'bg-indigo-500/10 border-indigo-500/50' : ''}
                                    ${evt.type === 'RELATIONAL' ? 'bg-rose-500/10 border-rose-500/50' : ''}
                                    hover:scale-125 transition-transform duration-300`}>
                                    {evt.media_url ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img src={evt.media_url} alt="log" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-mono text-white/50">{evt.recurrenceScore}</div>
                                    )}

                                    {/* Connecting Line to Center (Simulation) */}
                                    {/* Ideally this would be drawn with SVG, but for 3D CSS transform it is tricky. We skip the physical line for now. */}
                                </div>

                                {/* Label (Only visible for near items) */}
                                {index < 5 && (
                                    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none">
                                        <div className="text-[9px] font-mono text-zinc-300 truncate bg-black/50 px-1 rounded">{evt.labels[0]}</div>
                                        <div className="text-[8px] font-mono text-zinc-500">{new Date(evt.time).toLocaleDateString()}</div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* The "Self" / Center Point - Origin of the Signal */}
                    <motion.div
                        className="absolute w-4 h-4 rounded-full bg-white blur-[2px] z-50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </div>
            </div>

            {/* Event Detail Modal (Overlay) */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 border-l border-white/10 p-6 z-40 backdrop-blur-xl flex flex-col"
                    >
                        <button onClick={() => setSelectedEvent(null)} className="self-end text-zinc-500 hover:text-white mb-6">
                            <X size={16} />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[9px] font-mono uppercase border rounded-sm
                                ${selectedEvent.type === 'SYNC' ? 'border-tech-gold text-tech-gold' : ''}
                                ${selectedEvent.type === 'SOMATIC' ? 'border-indigo-500 text-indigo-500' : ''}
                                ${selectedEvent.type === 'RELATIONAL' ? 'border-rose-500 text-rose-500' : ''}`}>
                                {selectedEvent.type}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{new Date(selectedEvent.time).toLocaleTimeString()}</span>
                        </div>

                        <h3 className="text-xl font-serif text-white leading-tight mb-4">
                            {selectedEvent.narrative || "System Log Encrypted"}
                        </h3>

                        {selectedEvent.media_url && (
                            <div className="w-full aspect-video bg-zinc-900 border border-white/10 rounded-sm overflow-hidden mb-4">
                                <img src={selectedEvent.media_url} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="space-y-4 mt-2">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <MapPin size={14} />
                                <span className="text-xs font-mono">{selectedEvent.location || "Unknown Coordinates"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Activity size={14} />
                                <span className="text-xs font-mono">Recurrence Score: {selectedEvent.recurrenceScore}/10</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <h4 className="text-[9px] font-mono uppercase text-zinc-600 mb-2">Metadata Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedEvent.labels.map(label => (
                                    <span key={label} className="text-[9px] font-mono text-zinc-400 px-2 py-1 bg-white/5">{label}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Log Event Modal */}
            <AnimatePresence>
                {isLogging && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="w-full max-w-md bg-black border border-white/20 p-6 relative">
                            <button onClick={() => setIsLogging(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                                <X size={16} />
                            </button>
                            <h3 className="text-lg font-mono uppercase tracking-widest text-white mb-6">Log New Signal</h3>

                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                // Create mock payload, real app would bind inputs
                                const formData = new FormData(e.currentTarget);
                                const newEvent = {
                                    type: formData.get('type') as string,
                                    narrative: formData.get('narrative') as string,
                                    location: formData.get('location') as string,
                                    media_url: null // TODO: File upload
                                };
                                if (onLogEvent) onLogEvent(newEvent);
                                setIsLogging(false);
                            }}>
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Type</label>
                                    <select name="type" className="w-full bg-zinc-900 border border-white/10 text-xs text-white p-2 font-mono focus:border-tech-gold outline-none">
                                        <option value="SYNC">Synchronicity (Pattern Match)</option>
                                        <option value="SOMATIC">Somatic (Body Signal)</option>
                                        <option value="RELATIONAL">Relational (Mirroring)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Narrative</label>
                                    <textarea name="narrative" rows={3} className="w-full bg-zinc-900 border border-white/10 text-xs text-white p-2 font-mono focus:border-tech-gold outline-none" placeholder="Describe the observation..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Location</label>
                                    <input name="location" type="text" defaultValue="Current Coordinates" className="w-full bg-zinc-900 border border-white/10 text-xs text-white p-2 font-mono focus:border-tech-gold outline-none" />
                                </div>
                                <button type="submit" className="w-full py-3 bg-white text-black font-mono uppercase tracking-widest text-xs hover:bg-tech-gold transition-colors mt-2">
                                    Commit Log
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
