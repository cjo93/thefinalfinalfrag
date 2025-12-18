import React, { useState } from 'react';
import { Terminal, X, Code, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogicToggleProps {
    data: any;
    formulas?: string[];
    className?: string;
}

export const LogicToggle: React.FC<LogicToggleProps> = ({ data, formulas, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-zinc-800 rounded-sm text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-tech-gold hover:border-tech-gold/30 transition-all"
            >
                {isOpen ? <X size={12} /> : <Code size={12} />}
                <span>{isOpen ? "CLOSE_LOGIC" : "VIEW_SOURCE"}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-80 md:w-96 bg-black/95 backdrop-blur-xl border border-zinc-800 p-4 z-50 shadow-2xl rounded-sm"
                    >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                            <Cpu size={14} className="text-tech-gold" />
                            <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">Logic_Kernel_Dump</span>
                        </div>

                        <div className="space-y-4">
                            {formulas && (
                                <div>
                                    <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Applied Algorithms</h4>
                                    <ul className="space-y-1">
                                        {formulas.map((f, i) => (
                                            <li key={i} className="text-[10px] font-mono text-emerald-500/80 border-l border-emerald-500/20 pl-2">
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Vector State</h4>
                                <pre className="text-[9px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 text-[8px] font-mono text-zinc-600 flex justify-between">
                            <span>Hash: 0x{Math.random().toString(16).substr(2, 8)}</span>
                            <span>Ver: 2.4.1</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
