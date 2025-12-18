
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingEffect } from './TypingEffect';
import { SoundManager } from '../src/services/SoundManager';

interface BootSequenceProps {
    onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    const [step, setStep] = useState<number>(0);
    // eslint-disable-next-line react-hooks/purity
    const memSize = useMemo(() => Math.floor(Math.random() * 4000) + 12000, []);

    useEffect(() => {
        // Timeline
        // 0: Initial Void -> CRT On (1s)
        // 1: BIOS Dump (2s)
        // 2: Kernel Init (3s)
        // 3: Complete

        const timers: NodeJS.Timeout[] = [];

        timers.push(setTimeout(() => setStep(1), 400));
        timers.push(setTimeout(() => setStep(2), 1200));
        timers.push(setTimeout(() => setStep(3), 2200));
        timers.push(setTimeout(() => {
            SoundManager.play('BOOT_SUCCESS');
            onComplete();
        }, 2800));

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    // Random Hex Dump Generator
    const [hexDump, setHexDump] = useState<string[]>([]);
    useEffect(() => {
        if (step >= 1 && step < 3) {
            let tick = 0;
            const interval = setInterval(() => {
                const line = `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}  ${Math.random().toString(16).slice(2, 18).toUpperCase()}  LOAD_PTR_${Math.floor(Math.random() * 999)}`;
                setHexDump(prev => [...prev.slice(-15), line]);

                // Audio Cue
                tick++;
                if (tick % 2 === 0) SoundManager.play('BOOT_KEYSTROKE');
            }, 50);
            return () => clearInterval(interval);
        }
    }, [step]);

    return (
        <div className="fixed inset-0 z-[999] bg-black text-white font-mono overflow-hidden flex flex-col items-center justify-center cursor-none">

            <AnimatePresence>
                {/* STAGE 0: CRT TURN ON EFFECT */}
                {step === 0 && (
                    <motion.div
                        initial={{ scaleY: 0.002, scaleX: 0, opacity: 1 }}
                        animate={{
                            scaleX: [0, 1, 1],
                            scaleY: [0.002, 0.002, 1],
                            opacity: [1, 1, 1]
                        }}
                        transition={{ duration: 0.8, times: [0, 0.4, 1], ease: "easeInOut" }}
                        className="w-full h-1 bg-white absolute top-1/2 left-0 -translate-y-1/2 z-50 shadow-[0_0_50px_rgba(255,255,255,0.8)]"
                        style={{ height: '2px' }} // Base height forced
                    />
                )}

                {/* STAGE 1 & 2: BIOS & KERNEL */}
                {step >= 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                        className="relative w-full h-full p-8 md:p-16 flex flex-col justify-between"
                    >
                        {/* Background Hex Dump */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none p-4 overflow-hidden text-[10px] leading-tight text-emerald-500 font-mono">
                            {hexDump.map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>

                        {/* Center Content */}
                        <div className="z-10 w-full max-w-2xl mx-auto mt-20">
                            <div className="flex items-center gap-4 mb-8">
                                <motion.div
                                    className="w-4 h-4 bg-emerald-500"
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.1 }}
                                />
                                <h1 className="text-2xl md:text-4xl font-black tracking-tighter">DEFRAG_OS <span className="text-emerald-500 text-sm align-top">v2.4.0-RC</span></h1>
                            </div>

                            <div className="space-y-1 text-xs md:text-sm text-zinc-400">
                                <TypingEffect text="> MOUNTING_VIRTUAL_VOLUMES..." speed={10} />
                                {step >= 2 && (
                                    <>
                                        <br />
                                        <TypingEffect text="> DECRYPTING_SOVEREIGN_KEYS..." speed={10} />
                                        <div className="text-emerald-500 mt-2">[OK] IDENTITY_VERIFIED</div>
                                        <div className="text-emerald-500">[OK] PHYSICS_ENGINE_READY</div>
                                        <div className="text-emerald-500">[OK] NEURAL_LINK_ESTABLISHED</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bottom Status */}
                        <div className="flex justify-between items-end border-t border-white/20 pt-4">
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                                Mem: {memSize}MB OK
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse">
                                {step === 3 ? "SYSTEM_READY" : "BOOTING..."}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CRT Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[100] opacity-10 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')]" />
            <div className="absolute inset-0 pointer-events-none z-[100] bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 animate-scanline" />

        </div>
    );
};
