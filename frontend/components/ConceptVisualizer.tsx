
import React from 'react';

interface ConceptVisualizerProps {
    type: 'CORE' | 'FLOW' | 'STRUCTURE' | 'VOID' | string;
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ type }) => {

    // Determine the base visual style
    const getVisuals = () => {
        switch (type) {
            case 'CORE':
                return <div className="w-12 h-12 rounded-full bg-emerald-500 blur-xl opacity-40 animate-pulse" />;
            case 'SCATTER':
                // A dispersed cloud of spectral light
                return (
                    <>
                        {/* Chrome/Cyan/White theme for Scatter - No Yellow */}
                        <div className="absolute inset-0 bg-cyan-900/30 opacity-40 blur-3xl animate-pulse scale-150" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 blur-2xl rounded-full" />

                        {/* Scattered Particles */}
                        <div className="absolute inset-0 animate-spin-slower">
                            <div className="absolute top-4 left-1/2 w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white]" />
                            <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]" />
                            <div className="absolute top-1/2 left-4 w-1 h-1 bg-white/80 rounded-full" />
                        </div>
                        <div className="w-16 h-16 rounded-full border border-white/20 blur-sm opacity-60 animate-reverse-spin" />
                    </>
                );
            case 'REFRACTION':
                // A sharp, prismatic crystal effect
                return (
                    <div className="relative">
                        <div className="absolute top-0 left-0 w-16 h-16 bg-cyan-500/30 blur-lg -translate-x-2 mix-blend-screen animate-pulse" />
                        <div className="absolute top-0 left-0 w-16 h-16 bg-magenta-500/30 blur-lg translate-x-2 mix-blend-screen animate-pulse delay-75" />
                        <div className="w-12 h-12 border border-white/40 rotate-45 backdrop-blur-sm relative z-10 box-decoration-clone bg-white/5" />
                    </div>
                );
            case 'INTERFERENCE':
                // Moire pattern / ripple feel
                return (
                    <>
                        <div className="absolute w-32 h-32 border border-green-500/20 rounded-full animate-ping opacity-20 scale-50" />
                        <div className="absolute w-32 h-32 border border-green-500/20 rounded-full animate-ping delay-300 opacity-20 scale-75" />
                        <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    </>
                );
            case 'SYNTHESIS':
                // A coherent, unified laser beam / core
                return (
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-64 h-1 bg-white/50 blur-lg" />
                        <div className="absolute w-1 h-64 bg-white/50 blur-lg" />
                        <div className="w-24 h-24 border border-white/80 rounded-full bg-white/5 backdrop-blur-md shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]" />
                        </div>
                        <div className="absolute w-32 h-32 border border-white/10 rounded-full animate-spin-slow-reverse" />
                    </div>
                );
            default: // CORE, STRUCTURE, etc
                return <div className="w-12 h-12 rounded-full bg-zinc-700 blur-xl opacity-40" />;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-black/40 border border-white/5">
            {/* Visual Content */}
            {getVisuals()}

            {/* Technical Overlay */}
            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-600 tracking-widest uppercase opacity-50">
                SIM::{type}
            </div>

            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
        </div>
    );
};
