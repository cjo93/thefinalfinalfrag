
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SystemLayoutProps {
    children: React.ReactNode;
    user?: unknown;
    onClose?: () => void;
}

const ParallaxBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let rafId: number;
        const handleMouseMove = (e: MouseEvent) => {
            // Use RAF to throttle updates
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                setMousePos({
                    x: (e.clientX / window.innerWidth) * 2 - 1,
                    y: (e.clientY / window.innerHeight) * 2 - 1
                });
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <motion.div
            className="absolute inset-[-10%] z-0 opacity-10"
            animate={{
                x: mousePos.x * -20,
                y: mousePos.y * -20
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            style={{
                backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
        />
    );
};

export const SystemLayout: React.FC<SystemLayoutProps> = ({ children }) => {
    return (
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#050505] overflow-hidden text-[#EAEAEA] font-mono selection:bg-[#D4AF37] selection:text-black">

            {/* 1. Film Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* 2. Vignette */}
            <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

            {/* 3. The 'Grid' (Parallax) - Isolated State */}
            <ParallaxBackground />

            {/* Ambient Corner Glows (Cyber-Noir) */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 blur-[100px] pointer-events-none" />

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full flex flex-col">
                {/* Header Strip */}
                <header className="dfg-app-bar shrink-0 uppercase tracking-widest">
                    <div className="dfg-shell min-h-12 h-auto pt-safe py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_10px_#D4AF37]" />
                            <span className="text-xs font-serif tracking-widest text-white/80">DEFRAG // SYSTEM</span>
                        </div>
                        <div className="dfg-pill text-[9px] bg-white/0 border-white/10">
                            SECURE_CONN_ESTABLISHED
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>
            </div>

            {/* Scanline Effect (Optional, very subtle) */}
            <div className="absolute inset-0 z-50 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')] opacity-[0.02]" />
        </div>
    );
};
