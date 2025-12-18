import React, { useEffect, useState } from 'react';
import { ProtocolRing } from '../ui/ProtocolRing';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Lock, Unlock } from 'lucide-react';

interface CurriculumNode {
    day: number;
    phase: string;
    topic: string;
    content: string;
    visual_symbol: string;
    action_item: string;
}

export const LogicContent = () => {
    const { user } = useAuth();
    const [curriculum, setCurriculum] = useState<CurriculumNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

    // Calculate current day based on user start date
    // Or default to 1 for non-users / prospective
    const currentDay = React.useMemo(() => {
        if (!user || !user.protocolStartedAt) return 1;
        const start = new Date(user.protocolStartedAt).getTime();
        const now = new Date().getTime();
        const d = Math.floor((now - start) / 86400000) + 1;
        return Math.max(1, Math.min(30, d));
    }, [user]);

    useEffect(() => {
        fetch('/api/simulation/curriculum')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCurriculum(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch curriculum", err);
                setLoading(false);
            });
    }, []);

    // Group by Phase
    const phases = [
        { id: 'INITIATION', label: 'Phase I: Initiation', range: [1, 6], color: 'text-rose-400', border: 'border-rose-500' },
        { id: 'CALIBRATION', label: 'Phase II: Calibration', range: [7, 12], color: 'text-amber-400', border: 'border-amber-500' },
        { id: 'INTEGRATION', label: 'Phase III: Integration', range: [13, 18], color: 'text-emerald-400', border: 'border-emerald-500' },
        { id: 'SYNTHESIS', label: 'Phase IV: Synthesis', range: [19, 24], color: 'text-cyan-400', border: 'border-cyan-500' },
        { id: 'MASTERY', label: 'Phase V: Mastery', range: [25, 30], color: 'text-violet-400', border: 'border-violet-500' },
    ];

    if (loading) {
        return <div className="font-mono text-xs text-zinc-500 animate-pulse">LOADING_LOGIC_CORE...</div>;
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header / Viz */}
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-white/10 pb-8">
                <div className="relative">
                    <ProtocolRing currentDay={currentDay} totalDays={30} className="scale-125" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                        Current Position
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold font-mono text-white tracking-widest uppercase mb-2">Defrag Protocol <span className="text-tech-gold">v2.4</span></h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                        A 30-day cognitive architecture restructuring program. Based on Bressloff-Cowan dynamics and Jungian integration.
                        Participate to map your internal geometry.
                    </p>
                </div>
            </div>

            {/* Phases Accordion */}
            <div className="space-y-4">
                {phases.map((phase) => {
                    const isActive = currentDay >= phase.range[0] && currentDay <= phase.range[1];
                    const isCompleted = currentDay > phase.range[1];
                    const isLocked = currentDay < phase.range[0];

                    // For demo/polished feel, we allow expanding all, but visually dim locked ones
                    // Or keep locked ones collapsed? User "Live Site" complaint suggests they want to SEE it.
                    // So we allow viewing all "Manual" content.

                    return (
                        <div key={phase.id} className={`border border-white/10 bg-white/5 overflow-hidden transition-all ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
                            <button
                                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                                className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${isActive ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 ${isActive ? 'bg-white animate-pulse' : 'bg-zinc-800'}`}></div>
                                    <div className="text-left">
                                        <h4 className={`text-sm font-mono font-bold uppercase tracking-widest ${phase.color}`}>{phase.label}</h4>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Days {phase.range[0]} - {phase.range[1]}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-zinc-500">
                                    {isLocked ? <Lock size={14} /> : (isCompleted ? <span className="text-emerald-500 text-[10px]">COMPLETE</span> : <Unlock size={14} />)}
                                    <ChevronRight size={16} className={`transform transition-transform ${expandedPhase === phase.id ? 'rotate-90' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {expandedPhase === phase.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pl-10 space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 text-sm border-t border-white/5">
                                            {/* Filter curriculum for this phase */}
                                            {curriculum
                                                .filter(d => d.day >= phase.range[0] && d.day <= phase.range[1])
                                                .map(dayNode => (
                                                    <div key={dayNode.day} className={`relative p-4 border border-white/5 bg-black/40 ${dayNode.day === currentDay ? 'border-white/40 ring-1 ring-white/20' : ''}`}>
                                                        {dayNode.day === currentDay && <div className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">Active</div>}

                                                        <div className="flex items-baseline gap-3 mb-2">
                                                            <span className="text-xl font-mono font-bold text-zinc-700">{(dayNode.day).toString().padStart(2, '0')}</span>
                                                            <h5 className="font-bold text-zinc-200 uppercase tracking-wide text-xs">{dayNode.topic}</h5>
                                                        </div>
                                                        <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-serif italic">"{dayNode.content.substring(0, 80)}..."</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-tech-gold uppercase tracking-wider font-mono">
                                                            <span>Protocol:</span>
                                                            <span>{dayNode.action_item.substring(0, 30)}...</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-8 border-t border-white/10">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    System Architecture based on
                    <a href="#" className="mx-1 text-zinc-400 hover:text-white underline decoration-white/20 underline-offset-4">Jungian Depth Psychology</a>
                    x
                    <a href="#" className="mx-1 text-zinc-400 hover:text-white underline decoration-white/20 underline-offset-4">Complex Systems Theory</a>
                </p>
            </div>
        </div>
    );
};
