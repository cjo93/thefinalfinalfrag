
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface GamificationHUDProps {
    xp: number;
    level: number;
    rank: string;
    nextLevelXp: number;
    progress: number;
    systemCoherence: number;
    streak?: number;
}

export const GamificationHUD: React.FC<GamificationHUDProps> = ({
    xp, level, rank, progress, systemCoherence, streak = 0
}) => {
    const [displayXp, setDisplayXp] = useState(xp);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const prevLevelRef = React.useRef(level);

    useEffect(() => {
        setDisplayXp(xp);
    }, [xp]);

    useEffect(() => {
        if (level > prevLevelRef.current) {
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
            // Play sound if available? Done via SoundManager in App
        }
        prevLevelRef.current = level;
    }, [level]);

    return (
        <div className="relative">
            {/* Level Up Flare */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1.2, y: -20 }}
                        exit={{ opacity: 0, scale: 1.5, y: -40 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 text-tech-gold font-bold pointer-events-none whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] z-50 text-xl font-serif"
                    >
                        LEVEL UP!
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`flex items-center gap-4 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border ${showLevelUp ? 'border-tech-gold shadow-[0_0_30px_rgba(255,215,0,0.3)]' : 'border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'} transition-all duration-500`}>

                {/* Rank Badge */}
                <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Rank</span>
                    <span className="text-xs font-serif text-tech-gold font-bold tracking-wide">{rank}</span>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Level & XP */}
                <div className="flex flex-col w-32">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-white font-mono flex items-center gap-1">
                            <Star size={8} className="text-tech-gold" /> LVL {level}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                            {Math.floor(displayXp)} XP
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            className="h-full bg-gradient-to-r from-tech-gold to-white absolute top-0 left-0"
                        />
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="h-full w-1/2 bg-white/50 blur-[2px] absolute top-0 left-0"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Streak & Coherence */}
                <div className="flex items-center gap-3">
                    {/* Streak */}
                    {streak > 0 && (
                        <div className="flex flex-col items-center" title={`${streak} Day Streak`}>
                            <TrendingUp size={14} className="text-orange-500" />
                            <span className="text-[8px] font-mono text-orange-400">{streak} DAY</span>
                        </div>
                    )}

                    {/* Coherence Indicator (Bonus Calc) */}
                    <div className="flex items-center gap-2" title="System Coherence Bonus">
                        <Zap size={14} className={`${systemCoherence > 0.8 ? 'text-emerald-400' : systemCoherence > 0.5 ? 'text-amber-400' : 'text-red-400'}`} />
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Multi</span>
                            <span className="text-xs font-mono text-white">x{(1 + systemCoherence).toFixed(1)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
