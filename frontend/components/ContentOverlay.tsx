import React from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Shield, Cpu } from 'lucide-react';

interface ContentOverlayProps {
    title: string;
    subtitle: string;
    icon: 'TERMS' | 'ABOUT' | 'LOGIC';
    onClose: () => void;
    children: React.ReactNode;
}

export const ContentOverlay: React.FC<ContentOverlayProps> = ({ title, subtitle, icon, onClose, children }) => {

    const getIcon = () => {
        switch (icon) {
            case 'TERMS': return <Shield size={20} />;
            case 'ABOUT': return <Globe size={20} />;
            case 'LOGIC': return <Cpu size={20} />;
            default: return <Shield size={20} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Window */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="font-serif text-xl md:text-2xl text-white tracking-wide">{title}</h2>
                            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                    <div className="prose prose-invert prose-zinc max-w-none">
                        {children}
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="p-2 border-t border-white/10 bg-black/80 flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest px-4">
                    <span>SECURE_CONNECTION_ESTABLISHED</span>
                    <span>READ_ONLY_ACCESS</span>
                </div>
            </motion.div>
        </div>
    );
};
