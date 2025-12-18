import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';

interface DisclaimerModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, onDecline }) => {
    // Parent handles conditional rendering via AnimatePresence
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-black/90 border border-white/20 p-6 md:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(255,255,255,0.05)]"
            >
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <span className="font-mono text-[10px] text-tech-gold uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle size={12} />
                        TERMS OF INSIGHT
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">REF: LEGAL_01</span>
                </div>

                {/* Content */}
                <h2 className="text-xl font-sans font-bold text-white mb-4 tracking-tight">AWARENESS & RESPONSIBILITY</h2>

                <div className="space-y-4 text-xs md:text-sm text-zinc-400 leading-relaxed font-sans mb-8">
                    <p>
                        <strong className="text-zinc-200">ARCHETYPAL GUIDANCE.</strong> This system illuminates patterns in your behavior through the lens of astrology and human design. It is designed for self-reflection and philosophical inquiry, not as a substitute for professional medical or psychological care.
                    </p>
                    <p>
                        <strong className="text-zinc-200">SOVEREIGN AUTHORITY.</strong> These insights are mirrors, not prescriptions. You are the only authority on your life path. By entering, you acknowledge that you are using this tool for entertainment and personal exploration.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 py-3 border border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-widest hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                        DECLINE
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 py-3 bg-white text-black font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 font-bold"
                    >
                        <Check size={12} />
                        ACCEPT & ENTER
                    </button>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40"></div>
            </motion.div>
        </motion.div>
    );
};
