import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AgentVisualizerProps {
    state: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ state }) => {
    // Simulated frequency bars
    const [bars, setBars] = useState<number[]>(new Array(12).fill(10));

    useEffect(() => {
        if (state === 'IDLE') {
            setBars(new Array(12).fill(5));
            return;
        }

        const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.random() * (state === 'SPEAKING' ? 40 : state === 'THINKING' ? 20 : 10) + 5));
        }, 100);
        return () => clearInterval(interval);
    }, [state]);

    const getColor = () => {
        switch (state) {
            case 'IDLE': return 'bg-zinc-700';
            case 'LISTENING': return 'bg-emerald-500';
            case 'THINKING': return 'bg-amber-500'; // Processing/Warning color
            case 'SPEAKING': return 'bg-white';
            default: return 'bg-zinc-500';
        }
    };

    return (
        <div className="flex items-center justify-center gap-1 h-12 w-32">
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                    className={`w-1 rounded-full ${getColor()} opacity-80`}
                    style={{ minHeight: '4px' }}
                />
            ))}
        </div>
    );
};
