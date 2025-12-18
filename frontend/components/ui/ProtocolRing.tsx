import React from 'react';
import { motion } from 'framer-motion';

interface ProtocolRingProps {
    currentDay: number; // 1-30
    totalDays?: number;
    className?: string;
    onDayHover?: (day: number) => void;
}

export const ProtocolRing: React.FC<ProtocolRingProps> = ({
    currentDay,
    totalDays = 30,
    className = "",
    onDayHover
}) => {
    // Generate segments
    const segments = Array.from({ length: totalDays }, (_, i) => i + 1);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const gap = 2; // Gap in degrees
    const segmentLength = (360 / totalDays) - gap;

    return (
        <div className={`relative w-24 h-24 flex items-center justify-center ${className}`}>
            {/* Central Data */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Day</span>
                <span className="text-2xl font-bold text-white font-mono leading-none">{currentDay}</span>
            </div>

            {/* Ring SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {segments.map((day) => {
                    const isPast = day < currentDay;
                    const isCurrent = day === currentDay;

                    // Color Logic
                    // Phase 1 (1-6): Initiation (Red/Orange)
                    // Phase 2 (7-12): Calibration (Gold)
                    // Phase 3 (13-18): Integration (Green)
                    // Phase 4 (19-24): Synthesis (Blue/Cyan)
                    // Phase 5 (25-30): Mastery (Violet)

                    let baseColor = "text-zinc-800"; // Future
                    if (isPast) baseColor = "text-zinc-600";

                    // Phase Colors
                    // Phase 1 (1-6): Initiation (Red/Orange)
                    if ((isCurrent || isPast) && day <= 6) baseColor = isCurrent ? "text-rose-500" : "text-rose-900";
                    // Phase 2 (7-12): Calibration (Gold)
                    else if ((isCurrent || isPast) && day <= 12) baseColor = isCurrent ? "text-amber-400" : "text-amber-900";
                    // Phase 3 (13-18): Integration (Green)
                    else if ((isCurrent || isPast) && day <= 18) baseColor = isCurrent ? "text-emerald-400" : "text-emerald-900";
                    // Phase 4 (19-24): Synthesis (Cyan)
                    else if ((isCurrent || isPast) && day <= 24) baseColor = isCurrent ? "text-cyan-400" : "text-cyan-900";
                    // Phase 5 (25-30): Mastery (Violet)
                    else if ((isCurrent || isPast) && day <= 30) baseColor = isCurrent ? "text-violet-400" : "text-violet-900";

                    if (isCurrent) baseColor += " animate-pulse";

                    // Determine stroke dash
                    // We draw small arc segments manually or use stroke-dasharray
                    // Easier to rotate distinct lines
                    const rotation = (day - 1) * (360 / totalDays);

                    return (
                        <g key={day} transform={`rotate(${rotation} 50 50)`}>
                            {/* The tick mark */}
                            <line
                                x1="50" y1="10"
                                x2="50" y2={isCurrent ? "18" : "15"}
                                stroke="currentColor"
                                strokeWidth={isCurrent ? 3 : 1.5}
                                strokeLinecap="round"
                                className={`transition-all duration-300 ${baseColor} ${isCurrent ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}
                            />
                            {isCurrent && (
                                <circle cx="50" cy="5" r="2" fill="white" className="animate-pulse" />
                            )}
                        </g>
                    )
                })}
            </svg>

            {/* Glow backing */}
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-20 pointer-events-none"></div>
        </div>
    );
};
