
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, Terminal, Sigma } from 'lucide-react';

interface DataTransparencyProps {
    title?: string;
    data: unknown;
    source?: string; // e.g., "Vector Engine", "GPT-4o", "Replicate"
    type?: 'math' | 'logic' | 'raw';
}

export const DataTransparency: React.FC<DataTransparencyProps> = ({
    title = "Computed Verification",
    data,
    source = "Internal Logic",
    type = 'raw'
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button - Intentionally subtle */}
            <button
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all backdrop-blur-sm"
            >
                <Database className="w-3 h-3 text-white/30 group-hover:text-emerald-400 transition-colors" />
                <span className="text-[9px] font-mono text-white/30 group-hover:text-white/70 uppercase tracking-wider">
                    Source
                </span>
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="glass-panel w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                <div className="flex items-center gap-3">
                                    {type === 'math' ? <Sigma className="w-4 h-4 text-emerald-400" /> : <Terminal className="w-4 h-4 text-emerald-400" />}
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
                                        <p className="text-[10px] font-mono text-white/50 uppercase">Source: {source}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content Scroller */}
                            <div className="p-0 overflow-auto custom-scrollbar flex-1 bg-black/50">
                                <div className="p-4 font-mono text-xs text-emerald-400/80 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
                                    {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                                </div>
                            </div>

                            {/* Footer / Explanation */}
                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <div className="flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5" />
                                    <p className="text-[10px] text-white/60 leading-normal max-w-lg">
                                        This data was computed securely on the client or encrypted backend.
                                        Mathematical proofs and raw inputs are exposed here for full transparency.
                                        <br />
                                        <span className="text-white/30">AES-256-GCM Encrypted at Rest.</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
