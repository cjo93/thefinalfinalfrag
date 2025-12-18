/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface CircularProgressProps {
    value: number;
    size?: number;
    color?: string;
    label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 120,
    color = "#ffffff",
    label
}) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className="text-zinc-800"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-light font-mono text-white">{value}%</span>
                {label && <span className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{label}</span>}
            </div>
        </div>
    );
};

export const DataGraph: React.FC = () => {
    // Simple placeholder SVG graph
    return (
        <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
            {/* Wave 1: Sine */}
            <path
                d="M0,100 Q100,50 200,100 T400,100"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                className="animate-pulse"
            />
            {/* Wave 2: Cosine/Interference */}
            <path
                d="M0,100 Q100,150 200,100 T400,100"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
                strokeDasharray="4 4"
            />

            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                </linearGradient>
            </defs>

            {/* Interference Nodes */}
            {[100, 300].map(x => (
                <circle key={x} cx={x} cy={100} r="4" fill="#ffffff" className="animate-ping" />
            ))}
            <circle cx={200} cy={100} r="2" fill="#ffffff" />
        </svg>
    );
};
