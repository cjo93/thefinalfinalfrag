
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap, ArrowRight } from 'lucide-react';

interface ForecastEvent {
    date: string;
    title: string;
    description: string;
    intensity: number;
    type: string;
}

interface CosmicForecastWidgetProps {
    events: ForecastEvent[];
}

export const CosmicForecastWidget: React.FC<CosmicForecastWidgetProps> = ({ events }) => {
    if (!events || events.length === 0) return null;

    // Sort by date soonest
    const sortedDetails = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextEvent = sortedDetails[0];

    return (
        <div className="md:grid md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {/* Main Forecast Card */}
            <div className="md:col-span-1 glass-panel p-6 flex flex-col justify-between group hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-tech-gold">
                        <Zap size={14} />
                        <span className="font-mono text-[9px] uppercase tracking-widest">Kairotic Alignment</span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                        {new Date(nextEvent.date).toLocaleDateString()}
                    </div>
                </div>

                <div>
                    <h3 className="font-serif text-xl text-white mb-2 leading-tight">{nextEvent.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light line-clamp-3">
                        {nextEvent.description}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 h-3 rounded-full ${i < (nextEvent.intensity / 2) ? 'bg-tech-gold' : 'bg-zinc-800'}`}
                            />
                        ))}
                    </div>
                    <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">Intensity Index</span>
                </div>
            </div>

            {/* Upcoming List */}
            <div className="md:col-span-2 glass-panel p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Calendar size={120} />
                </div>

                <h4 className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-4">Transit Horizon // Next 7 Days</h4>

                <div className="space-y-3">
                    {sortedDetails.slice(1, 4).map((evt, i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-10 h-10 bg-black border border-white/10 rounded-sm text-zinc-400">
                                    <span className="text-[10px] font-bold">{new Date(evt.date).getDate()}</span>
                                    <span className="text-[8px] uppercase">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-serif text-zinc-200 group-hover:text-white transition-colors">{evt.title}</div>
                                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{evt.type}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`text-[9px] font-mono px-2 py-1 rounded-sm border ${evt.intensity > 7 ? 'text-rose-400 border-rose-500/30' : 'text-zinc-400 border-white/10'}`}>
                                    LVL {evt.intensity}
                                </div>
                                <ArrowRight size={12} className="text-zinc-600 -ml-2 opacity-0 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </div>
                        </motion.div>
                    ))}

                    {sortedDetails.length < 2 && (
                        <div className="text-center py-8 text-xs text-zinc-600 font-mono italic">
                            No significant transits detected in immediate vector.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
