
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BioMetricFrequency } from '../src/types/spectral';

interface SpectrogramProps {
    data: BioMetricFrequency[];
    height?: number;
    showLabels?: boolean;
}

const WAVELENGTH_COLORS: Record<string, string> = {
    'INFRARED': '#500000',
    'RED': '#ff0000',
    'ORANGE': '#ff7f00',
    'YELLOW': '#ffff00',
    'GREEN': '#00ff00',
    'BLUE': '#0000ff',
    'INDIGO': '#4b0082',
    'VIOLET': '#8f00ff',
    'ULTRAVIOLET': '#ffffff',
};

// Sort order for display
const SPECTRAL_ORDER = ['INFRARED', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'INDIGO', 'VIOLET', 'ULTRAVIOLET'];

export const Spectrogram: React.FC<SpectrogramProps> = ({ data, height = 200, showLabels = true }) => {

    // Sort data by spectral order
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            return SPECTRAL_ORDER.indexOf(a.wavelength) - SPECTRAL_ORDER.indexOf(b.wavelength);
        });
    }, [data]);

    return (
        <div className="w-full flex items-end gap-1 p-4 bg-black/40 border border-white/10 rounded-sm relative overflow-hidden" style={{ height }}>
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Spectral Bars */}
            {sortedData.map((freq, i) => (
                <div key={freq.id + i} className="flex-1 flex flex-col justify-end group relative z-10 h-full">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 border border-white/20 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-bold flex justify-between">
                            <span>{freq.id}</span>
                            <span style={{ color: WAVELENGTH_COLORS[freq.wavelength] }}>{freq.wavelength}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-1">{freq.resonance}</div>
                    </div>

                    {/* The Bar */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${freq.amplitude * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.05, ease: "circOut" }}
                        className="w-full min-w-[4px] relative"
                    >
                        {/* Core color */}
                        <div
                            className="absolute inset-0 opacity-80"
                            style={{
                                backgroundColor: WAVELENGTH_COLORS[freq.wavelength],
                                boxShadow: `0 0 15px ${WAVELENGTH_COLORS[freq.wavelength]}`
                            }}
                        />

                        {/* Top Cap "White Light" */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-80" />
                    </motion.div>

                    {/* Baseline Label */}
                    {showLabels && (
                        <div className="h-4 mt-2 border-t border-white/10">
                            <div className="w-[1px] h-2 bg-white/20 mx-auto" />
                        </div>
                    )}
                </div>
            ))}

            {/* Overlay Gradient for "Refraction" look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-20" />
        </div>
    );
};
