import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const PwaInstallPrompt: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // iOS Detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream: unknown }).MSStream;
        // Standalone Mode Detection (is the app already installed?)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone: boolean }).standalone;

        // Show if iOS + Mobile + Not Standalone + Not Dismissed Session
        if (isIOS && !isStandalone && !sessionStorage.getItem('pwa_prompt_dismissed')) {
            // Delay slightly for dramatic entrance
            setTimeout(() => setIsVisible(true), 3000);
        }
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-4 right-4 z-[9999] md:hidden"
                >
                    <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />

                        <button
                            onClick={dismiss}
                            className="absolute top-2 right-2 p-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex gap-4 items-start pr-8">
                            <div className="w-12 h-12 bg-black rounded-xl border border-white/20 flex items-center justify-center shrink-0">
                                <img src="/pwa-192x192.png" alt="Defrag" className="w-10 h-10 rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1">Install System</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                                    Initialize full screen cognitive environment.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-tech-gold font-mono">
                                    <span>1. Tap</span>
                                    <Share size={14} />
                                    <span>2. "Add to Home Screen"</span>
                                </div>
                            </div>
                        </div>

                        {/* Pointing Arrow Animation (CSS based usually more performant) */}
                        <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 rotate-45 border-b border-r border-white/10" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
