
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap, Shield, Eye } from 'lucide-react';
import { useTier } from '../hooks/useTier';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { triggerCheckout, tier: currentTier } = useTier();

    if (!isOpen) return null;

    const tiers = [
        {
            name: 'OBSERVER',
            price: 'Free',
            period: '/forever',
            description: 'Basic access to the signal.',
            icon: Eye,
            features: [
                'Daily Ephemeris',
                'Basic Topology',
                'Public Broadcast',
                'Read-Only Access'
            ],
            action: 'CURRENT PLAN',
            tierId: 'observer',
            disabled: true,
            color: 'text-zinc-400',
            border: 'border-zinc-800'
        },
        {
            name: 'OPERATOR',
            price: '$19',
            period: '/month',
            description: 'Active participation in the network.',
            icon: Zap,
            features: [
                'Full Topology Access',
                'Mandala Generation',
                'Voice Synthesis',
                'Priority Signal'
            ],
            action: 'UPGRADE',
            tierId: 'operator',
            recommended: true,
            color: 'text-cyan-400',
            border: 'border-cyan-400'
        },
        {
            name: 'ARCHITECT',
            price: '$99',
            period: '/month',
            description: 'System-level control and analysis.',
            icon: Shield,
            features: [
                'Deep Dive Analysis',
                'Command Node',
                'Early Protocol Access',
                'Direct Developer Uplink'
            ],
            action: 'UPGRADE',
            tierId: 'architect',
            color: 'text-amber-400',
            border: 'border-amber-400'
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-5xl bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8 md:p-12 w-full">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-white mb-2 font-serif">Upgrade Protocol</h2>
                            <p className="text-zinc-400">Select your clearance level to access deeper systems.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tiers.map((t) => {
                                const isCurrent = currentTier === t.tierId;
                                return (
                                    <div
                                        key={t.name}
                                        className={`relative p-6 rounded-xl border ${t.border} bg-black/40 flex flex-col hover:bg-white/5 transition-colors group`}
                                    >
                                        {t.recommended && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-400 text-black text-xs font-bold rounded-full tracking-widest uppercase shadow-lg shadow-cyan-400/20">
                                                Recommended
                                            </div>
                                        )}

                                        <div className={`mb-4 ${t.color}`}>
                                            <t.icon size={32} />
                                        </div>

                                        <h3 className={`text-lg font-bold ${t.color} font-mono mb-2`}>{t.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-bold text-white">{t.price}</span>
                                            <span className="text-sm text-zinc-500">{t.period}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-6 h-10">{t.description}</p>

                                        <div className="space-y-3 mb-8 flex-1">
                                            {t.features.map((f) => (
                                                <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                                                    <Check size={14} className={t.color} />
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            disabled={t.disabled || isCurrent}
                                            onClick={() => triggerCheckout(t.tierId as 'observer' | 'operator' | 'architect')}
                                            className={`w-full py-3 rounded-lg font-bold tracking-wider text-xs uppercase transition-all ${isCurrent
                                                ? 'bg-zinc-800 text-zinc-500 cursor-default'
                                                : `bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white`
                                                }`}
                                        >
                                            {isCurrent ? 'Current Plan' : t.action}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
