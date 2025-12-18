
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, ChevronRight, Fingerprint, ShieldCheck, CreditCard, MapPin, Calendar, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (provider: 'google' | 'apple' | 'email', birthData?: BirthData) => Promise<void>;
    isLoading: boolean;
}

interface BirthData {
    birthDate: string;
    birthTime: string;
    birthLocation: string;
}

type AuthStep = 'PROVIDER' | 'CALIBRATION';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, isLoading }) => {
    const [step, setStep] = useState<AuthStep>('PROVIDER');
    const [selectedProvider, setSelectedProvider] = useState<'google' | 'apple' | 'email' | null>(null);
    const [birthData, setBirthData] = useState<BirthData>({
        birthDate: '',
        birthTime: '',
        birthLocation: ''
    });

    const handleProviderSelect = (provider: 'google' | 'apple' | 'email') => {
        setSelectedProvider(provider);
        setStep('CALIBRATION');
    };

    const handleComplete = async () => {
        if (selectedProvider) {
            await onLogin(selectedProvider, birthData);
        }
    };

    const resetModal = () => {
        setStep('PROVIDER');
        setSelectedProvider(null);
        setBirthData({ birthDate: '', birthTime: '', birthLocation: '' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    onClick={() => { onClose(); resetModal(); }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        className="w-full max-w-md glass-panel shadow-[0_0_100px_rgba(255,255,255,0.05)] relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/30"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/30"></div>

                        {/* Close button */}
                        <button onClick={() => { onClose(); resetModal(); }} className="absolute top-4 right-4 z-20 text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>

                        {/* Step Indicator */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-center gap-4">
                            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'PROVIDER' ? 'bg-white' : 'bg-zinc-700'}`}></div>
                            <div className="w-8 h-px bg-white/20"></div>
                            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'CALIBRATION' ? 'bg-white' : 'bg-zinc-700'}`}></div>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 'PROVIDER' && (
                                <motion.div
                                    key="provider"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-8"
                                >
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/20 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                            <Lock size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-serif text-white mb-2">Initialize Identity</h3>
                                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 1: Authenticate</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleProviderSelect('apple')}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-mono text-xs uppercase tracking-wider hover:bg-zinc-100 transition-all disabled:opacity-50 group"
                                        >
                                            <div className="w-5 h-5"><svg viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg></div>
                                            <span>Continue with Apple</span>
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>

                                        <button
                                            onClick={() => handleProviderSelect('google')}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 group"
                                        >
                                            <div className="w-5 h-5"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg></div>
                                            <span>Continue with Google</span>
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </div>

                                    <div className="relative py-6">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                        <div className="relative flex justify-center"><span className="bg-black px-3 text-[10px] text-zinc-600 font-mono uppercase">Or via magic link</span></div>
                                    </div>

                                    <form onSubmit={(e) => { e.preventDefault(); handleProviderSelect('email'); }}>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
                                                <input
                                                    type="email"
                                                    placeholder="OPERATOR@SIGNAL.COM"
                                                    className="w-full bg-zinc-900/50 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-zinc-700 focus:border-white/30 focus:outline-none transition-colors"
                                                />
                                            </div>
                                            <button type="submit" disabled={isLoading} className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all disabled:opacity-50">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 'CALIBRATION' && (
                                <motion.div
                                    key="calibration"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-8"
                                >
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-b from-tech-gold/20 to-tech-gold/5 border border-tech-gold/30 mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                            <Sparkles size={24} className="text-tech-gold" />
                                        </div>
                                        <h3 className="text-2xl font-serif text-white mb-2">Calibrate Source Code</h3>
                                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Step 2: Enter Bio-Metrics</p>
                                    </div>

                                    <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
                                        Your birth data forms the foundation of your unique signal. This enables precise astronomical calculations for personalized insights.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                <Calendar size={12} /> Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                value={birthData.birthDate}
                                                onChange={(e) => setBirthData({ ...birthData, birthDate: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-3 font-mono text-sm text-white focus:border-white/50 transition-colors outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                <Clock size={12} /> Birth Time (If Known)
                                            </label>
                                            <input
                                                type="time"
                                                value={birthData.birthTime}
                                                onChange={(e) => setBirthData({ ...birthData, birthTime: e.target.value })}
                                                className="w-full bg-black border border-white/20 p-3 font-mono text-sm text-white focus:border-white/50 transition-colors outline-none"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                <MapPin size={12} /> Birth Location
                                            </label>
                                            <input
                                                type="text"
                                                value={birthData.birthLocation}
                                                onChange={(e) => setBirthData({ ...birthData, birthLocation: e.target.value })}
                                                placeholder="City, Country"
                                                className="w-full bg-black border border-white/20 p-3 font-mono text-sm text-white placeholder-zinc-700 focus:border-white/50 transition-colors outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={() => setStep('PROVIDER')}
                                            className="px-6 py-3 border border-white/20 text-zinc-400 font-mono text-[10px] uppercase tracking-widest hover:border-white/40 hover:text-white transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleComplete}
                                            disabled={isLoading || !birthData.birthDate || !birthData.birthLocation}
                                            className="flex-1 py-3 bg-white text-black font-mono text-[10px] uppercase tracking-widest hover:bg-tech-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Fingerprint size={14} className="animate-pulse" />
                                                    <span>Initializing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    <span>Complete Initialization</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 border-t border-white/10 text-center bg-zinc-900/20">
                            <p className="text-[9px] text-zinc-600 font-mono">
                                Your data is encrypted and never shared. We use it solely to calculate your unique bio-metric signal.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plan: any;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan, onConfirm, isLoading }) => {
    return (
        <AnimatePresence>
            {isOpen && plan && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        className="w-full max-w-lg glass-panel relative overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
                    >
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-tech-gold/50"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-tech-gold/50"></div>

                        {/* Top Bar */}
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-zinc-900/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Secure Gateway // Stripe</span>
                            </div>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Plan Summary */}
                            <div className="mb-8 text-center">
                                <span className="text-[10px] font-mono text-tech-gold uppercase tracking-widest mb-2 block">Upgrade Protocol</span>
                                <h3 className="text-3xl font-serif text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-light text-white">${plan.price}</span>
                                    <span className="text-zinc-500 text-sm">/mo</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">{plan.emotionalDesc || plan.desc}</p>
                            </div>

                            {/* Payment Method Mockup */}
                            <div className="space-y-4 mb-8">
                                <div className="p-4 border border-tech-gold/30 bg-tech-gold/5 flex items-center gap-4 cursor-pointer transition-colors">
                                    <div className="w-4 h-4 rounded-full border-2 border-tech-gold flex items-center justify-center">
                                        <div className="w-2 h-2 bg-tech-gold rounded-full"></div>
                                    </div>
                                    <CreditCard size={20} className="text-zinc-300" />
                                    <div className="flex-1">
                                        <div className="text-xs font-mono text-zinc-300">•••• •••• •••• 4242</div>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500">VISA</div>
                                </div>
                            </div>

                            {/* Biometric Processing Button */}
                            <div className="relative">
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-tech-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <Fingerprint size={16} className="animate-pulse" />
                                            <span>Verifying Biometrics...</span>
                                        </>
                                    ) : (
                                        <span>Confirm & Initialize</span>
                                    )}
                                </button>

                                {/* Decorative Scan Line */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ left: '0%' }}
                                        animate={{ left: '100%' }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="absolute bottom-0 top-0 w-1 bg-tech-gold/30 blur-sm"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-zinc-900/30 text-center">
                            <p className="text-[9px] text-zinc-600 font-mono flex items-center justify-center gap-2">
                                <Lock size={10} /> 256-bit End-to-End Encryption Active
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Tier Gating Component
interface UpgradePromptProps {
    requiredTier: 'HELIX_PROTOCOL' | 'ARCHITECT_NODE';
    onUpgrade: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ requiredTier, onUpgrade }) => {
    const tierNames: Record<string, string> = {
        'HELIX_PROTOCOL': 'Operator',
        'ARCHITECT_NODE': 'Architect'
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 border border-white/20 rounded-full flex items-center justify-center mb-6 bg-black/50">
                <Lock size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-2">Access Restricted</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">
                This feature requires <span className="text-tech-gold font-mono">{tierNames[requiredTier]}</span> tier access.
                Upgrade to unlock deep system analysis.
            </p>
            <button
                onClick={onUpgrade}
                className="px-8 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-tech-gold transition-colors"
            >
                Upgrade Access
            </button>
        </div>
    );
};
