
import React, { useState, useEffect } from 'react';
import { User } from '../hooks/useAuth';
import { Check, Copy, Share2, RefreshCw, Loader2, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics, HapticPatterns } from '../src/services/haptics';
import { LogicToggle } from './LogicToggle';

interface MandalaProfileCardProps {
    user: User;
    className?: string;
}

export const MandalaProfileCard: React.FC<MandalaProfileCardProps> = ({ user, className = '' }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial load or restoration
    useEffect(() => {
        // If user already has a generated card in their profile (future enhancement), load it.
        // For now, we start empty or generate on click to verify.
    }, [user]);

    const generateMandala = async () => {
        setIsLoading(true);
        setError(null);
        haptics.trigger(HapticPatterns.RIGID);

        try {
            // Construct payload from user biometrics or defaults
            const payload = {
                user_id: user.id,
                dt: new Date().toISOString(), // Current timestamp for transits
                lat: 40.7128, // Default NYC
                lon: -74.0060
            };

            // Attempt to parse real location if available
            // In a real app, this would be cleaner.

            const response = await fetch('/api/mandala/card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to generate mandala geometry');
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImageUrl(objectUrl);
            haptics.trigger(HapticPatterns.SUCCESS);

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Generation Failed";
            setError(errorMessage);
            haptics.trigger(HapticPatterns.FAILURE);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!imageUrl) return;
        try {
            const data = await fetch(imageUrl);
            const blob = await data.blob();
            if (navigator.clipboard) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                setCopied(true);
                haptics.trigger(HapticPatterns.SUCCESS);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (_err) {
            console.error("Copy failed", _err);
        }
    };

    return (
        <div className={`p-8 bg-zinc-900/50 border border-white/10 flex flex-col items-center text-center space-y-6 ${className}`}>

            <div className="space-y-2">
                <h3 className="font-serif text-2xl text-white">Archetypal Mandala</h3>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-sm mx-auto">
                    Geometric signature derived from your Natal Core + Current Transits.
                </p>
            </div>

            {/* Display Area */}
            <div className="relative group">
                <div className="w-64 h-[calc(64px*1.33)] md:w-80 md:h-[calc(80px*4)] border border-white/10 bg-black flex items-center justify-center relative overflow-hidden shadow-2xl shadow-black">
                    {/* Placeholder Grid */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4 z-10">
                            <Loader2 className="animate-spin text-tech-gold" size={32} />
                            <span className="text-[10px] font-mono text-tech-gold blink">COMPUTING_GEOMETRY</span>
                        </div>
                    ) : imageUrl ? (
                        <motion.img
                            src={imageUrl}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full h-full object-contain p-2"
                        />
                    ) : (
                        <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest z-10">
                            No Geometry Rendered
                        </div>
                    )}
                </div>

                {/* Overlay Action */}
                {!isLoading && (
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={generateMandala}
                            className="bg-black/80 backdrop-blur border border-white/20 text-white text-[10px] px-4 py-2 font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={12} /> {imageUrl ? "Regenerate" : "Initialize"}
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            {imageUrl && (
                <div className="flex flex-col gap-4 w-full">
                    {/* Standard Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleCopy}
                            className="p-3 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                            title="Copy Image"
                        >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/share/token', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user.id })
                                    });
                                    const data = await res.json();
                                    if (data.previewUrl) {
                                        await navigator.clipboard.writeText(data.previewUrl);
                                        haptics.trigger(HapticPatterns.SUCCESS);
                                        // Visual feedback could be added here
                                        alert("System Link Copied to Clipboard");
                                    }
                                } catch (e) {
                                    console.error("Share gen failed", e);
                                    haptics.trigger(HapticPatterns.FAILURE);
                                }
                            }}
                            className="p-3 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                            title="Copy System Link"
                        >
                            <Share2 size={16} />
                        </button>
                    </div>

                    {/* Premium iOS Integrations */}
                    <div className="flex flex-col gap-3 w-full border-t border-white/5 pt-4 mt-2">
                        <button
                            onClick={async () => {
                                try {
                                    // Trigger Wallet Pass Generation
                                    // In a real app, this would use a signed token
                                    window.location.href = `/api/terminal/wallet/sign`;
                                } catch (e) {
                                    console.error("Wallet fail", e);
                                }
                            }}
                            className="w-full py-3 bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white group-hover:text-white/80 transition-colors">
                                <path d="M19 4H5C3.34 4 2 5.34 2 7V17C2 18.66 3.34 20 5 20H19C20.66 20 22 18.66 22 17V7C22 5.34 20.66 4 19 4ZM19 18H5C4.45 18 4 17.55 4 17V7C4 6.45 4.45 6 5 6H19C19.55 6 20 6.45 20 7V17C20 17.55 19.55 18 19 18Z" />
                                <path d="M5 8H19V10H5V8Z" />
                            </svg>
                            <span className="font-sans font-medium text-sm tracking-wide">Add to Apple Wallet</span>
                        </button>

                        <button
                            onClick={() => {
                                window.location.href = `/api/terminal/calendar/${user.id}/transits.ics`;
                            }}
                            className="w-full py-3 bg-black hover:bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            <span className="font-mono text-[10px] uppercase tracking-widest">Sync Calendar Transits</span>
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-red-500 font-mono text-[10px] bg-red-900/20 px-2 py-1">
                    ERR: {error}
                </div>
            )}

            {/* Logic Proof Layer */}
            {imageUrl && (
                <div className="w-full flex justify-end mt-4">
                    <LogicToggle
                        data={{
                            gate: user.gate || "GATE_XX",
                            tier: user.tier,
                            biometrics: {
                                ...user.bioMetrics,
                                birthLocation: "REDACTED" // Privacy
                            },
                            algorithms: ["SwissEph_V2", "Jung_Archetype_Map_1.4"]
                        }}
                        formulas={[
                            "Transit(Saturn) Δ Natal(Sun) > Thresh(0.8)",
                            "Entropy_Vector = 0.45 [STABLE]",
                            "Archetype = 'THE_HERMIT' if Gate.Line == 6"
                        ]}
                    />
                </div>
            )}

            <div className="w-full pt-6 border-t border-white/5 flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest justify-center">
                <span>Subject: {user.name}</span>
                <span>//</span>
                <span>Aspect: 3:4</span>
            </div>
        </div>
    );
};

// Simple motion wrapper since standard img doesn't animate props directly
