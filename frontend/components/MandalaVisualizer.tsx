/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mandala Visualization Component
 * Based on Bressloff-Cowan form constants:
 * - SPIRAL: Emotional flow, cyclical patterns
 * - TUNNEL: Void states, spiritual depth
 * - LATTICE: Logical structure, mental patterns
 * - WEB: Relational complexity, interconnection
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type FormConstant = 'SPIRAL' | 'TUNNEL' | 'LATTICE' | 'WEB' | 'MANDALA';

interface MandalaVisualizerProps {
    type?: FormConstant;
    gateNumber?: number;
    size?: number;
}

export const MandalaVisualizer: React.FC<MandalaVisualizerProps> = ({
    type = 'MANDALA',
    gateNumber = 1,
    size = 200
}) => {
    // Derive visual parameters from gate number for uniqueness
    const params = useMemo(() => ({
        segments: 6 + (gateNumber % 6), // 6-12 segments
        layers: 3 + (gateNumber % 4),   // 3-6 layers
        rotation: (gateNumber * 5.625) % 360, // Based on HD wheel
        // Cyber-Noir Palette Tuning: Lower saturation, higher luminance for "glow"
        hue: (gateNumber * 5.625) % 360,
    }), [gateNumber]);

    // Breathing Animation Variant
    const breathing = {
        initial: { scale: 0.95, opacity: 0.5 },
        animate: {
            scale: [0.95, 1.05, 0.95],
            opacity: [0.5, 0.7, 0.5],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
    };

    const renderFormConstant = () => {
        switch (type) {
            case 'SPIRAL':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Logarithmic spiral approximation */}
                        {Array.from({ length: params.layers * 2 }).map((_, i) => {
                            const angle = i * 30 * (Math.PI / 180);
                            const r = 5 + i * 4;
                            const x = 50 + r * Math.cos(angle + params.rotation * (Math.PI / 180));
                            const y = 50 + r * Math.sin(angle + params.rotation * (Math.PI / 180));
                            return (
                                <motion.circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r={1 + i * 0.3}
                                    fill="none"
                                    stroke={`hsl(${params.hue}, 50%, ${40 + i * 3}%)`}
                                    strokeWidth="0.5"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.8 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                />
                            );
                        })}
                        {/* Central point */}
                        <circle cx="50" cy="50" r="2" fill="white" opacity="0.8" />
                    </svg>
                );

            case 'TUNNEL':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Concentric circles creating depth illusion */}
                        {Array.from({ length: params.layers * 3 }).map((_, i) => {
                            const r = 45 - i * (40 / (params.layers * 3));
                            return (
                                <motion.circle
                                    key={i}
                                    cx="50"
                                    cy="50"
                                    r={r}
                                    fill="none"
                                    stroke={`hsl(${params.hue}, 30%, ${20 + i * 3}%)`}
                                    strokeWidth={0.5 - i * 0.02}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.03, duration: 0.4 }}
                                />
                            );
                        })}
                        {/* Void center */}
                        <circle cx="50" cy="50" r="3" fill="black" />
                    </svg>
                );

            case 'LATTICE':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Grid structure */}
                        {Array.from({ length: params.segments }).map((_, i) => (
                            <React.Fragment key={i}>
                                {/* Vertical lines */}
                                <motion.line
                                    x1={15 + i * (70 / (params.segments - 1))}
                                    y1="15"
                                    x2={15 + i * (70 / (params.segments - 1))}
                                    y2="85"
                                    stroke={`hsl(${params.hue}, 40%, 50%)`}
                                    strokeWidth="0.3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                />
                                {/* Horizontal lines */}
                                <motion.line
                                    x1="15"
                                    y1={15 + i * (70 / (params.segments - 1))}
                                    x2="85"
                                    y2={15 + i * (70 / (params.segments - 1))}
                                    stroke={`hsl(${params.hue}, 40%, 50%)`}
                                    strokeWidth="0.3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
                                />
                            </React.Fragment>
                        ))}
                        {/* Node points at intersections */}
                        {Array.from({ length: Math.min(params.segments, 5) }).map((_, i) =>
                            Array.from({ length: Math.min(params.segments, 5) }).map((_, j) => (
                                <circle
                                    key={`${i}-${j}`}
                                    cx={15 + i * (70 / (Math.min(params.segments, 5) - 1))}
                                    cy={15 + j * (70 / (Math.min(params.segments, 5) - 1))}
                                    r="1"
                                    fill={`hsl(${params.hue}, 60%, 60%)`}
                                />
                            ))
                        )}
                    </svg>
                );

            case 'WEB':
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Radial web structure */}
                        {Array.from({ length: params.segments }).map((_, i) => {
                            const angle = (i * 360 / params.segments) * (Math.PI / 180);
                            return (
                                <motion.line
                                    key={i}
                                    x1="50"
                                    y1="50"
                                    x2={50 + 40 * Math.cos(angle)}
                                    y2={50 + 40 * Math.sin(angle)}
                                    stroke={`hsl(${params.hue}, 50%, 50%)`}
                                    strokeWidth="0.3"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: i * 0.03, duration: 0.5 }}
                                />
                            );
                        })}
                        {/* Concentric connector rings */}
                        {Array.from({ length: params.layers }).map((_, layer) => {
                            const r = 10 + layer * (30 / params.layers);
                            return (
                                <motion.circle
                                    key={layer}
                                    cx="50"
                                    cy="50"
                                    r={r}
                                    fill="none"
                                    stroke={`hsl(${params.hue}, 40%, ${40 + layer * 10}%)`}
                                    strokeWidth="0.3"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + layer * 0.1, duration: 0.3 }}
                                />
                            );
                        })}
                        {/* Central node */}
                        <motion.circle
                            cx="50" cy="50" r="3" fill="white" opacity="0.9"
                            variants={breathing}
                            initial="initial"
                            animate="animate"
                        />
                    </svg>
                );

            case 'MANDALA':
            default:
                return (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
/* Outer ring */
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={`hsl(${params.hue}, 20%, 30%)`} // Desaturated border
                            strokeWidth="0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                        />

                        {/* Symmetric petals */}
                        {Array.from({ length: params.segments }).map((_, i) => {
                            const angle = (i * 360 / params.segments) * (Math.PI / 180);
                            const x1 = 50 + 15 * Math.cos(angle);
                            const y1 = 50 + 15 * Math.sin(angle);
                            const x2 = 50 + 40 * Math.cos(angle);
                            const y2 = 50 + 40 * Math.sin(angle);

                            return (
                                <motion.ellipse
                                    key={i}
                                    cx={(x1 + x2) / 2}
                                    cy={(y1 + y2) / 2}
                                    rx="4"
                                    ry="12"
                                    fill={`hsl(${(params.hue + i * 20) % 360}, 40%, 60%)`} // Brighter, less saturated
                                    fillOpacity="0.2"
                                    transform={`rotate(${i * (360 / params.segments)} 50 50)`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.6 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                />
                            );
                        })}

                        {/* Inner circles */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <motion.circle
                                key={i}
                                cx="50"
                                cy="50"
                                r={10 + i * 8}
                                fill="none"
                                stroke={`hsl(${params.hue}, 50%, ${50 + i * 10}%)`}
                                strokeWidth="0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            />
                        ))}

                        {/* Central bindu (self) */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="4"
                            fill="white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        />
                    </svg>
                );
        }
    };

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            {/* Ambient Glow */}
            <motion.div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: `hsl(${params.hue}, 60%, 40%)` }}
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main visualization with slow rotation */}
            <motion.div
                className="relative z-10 w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
                {renderFormConstant()}
            </motion.div>

            {/* Form constant label - Static */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-zinc-600 uppercase tracking-widest flex flex-col items-center gap-1">
                <span>{type}</span>
                <span className="text-[7px] text-zinc-700">GATE {gateNumber}</span>
            </div>
        </div>
    );
};

export default MandalaVisualizer;
