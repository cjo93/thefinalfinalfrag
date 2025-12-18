
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import { motion } from 'framer-motion';
import MandalaVisualizer from './MandalaVisualizer';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface SharedReading {
    gate: string;
    headline: string;
    timestamp: string;
    system_vector?: string;
}

interface ShareViewProps {
    token: string;
    onClose: () => void;
}

export const ShareView: React.FC<ShareViewProps> = ({ token, onClose }) => {
    const [reading, setReading] = useState<SharedReading | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReading = async () => {
            try {
                // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // DEPRECATED
                const res = await apiClient.get(API_ENDPOINTS.SHARE_GET(token));
                if (res.ok) {
                    const data = await res.json();
                    setReading(data);
                } else {
                    setError("Artifact corrupted or expired.");
                }
            } catch {
                setError("Network interference detected.");
            } finally {
                setLoading(false);
            }
        };
        fetchReading();
    }, [token]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono text-xs text-zinc-500 animate-pulse">
                DECRYPTING_TOKEN_SIGNATURE...
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-red-500 gap-4">
                <ShieldCheck size={48} />
                <div>{error}</div>
                <button onClick={onClose} className="border border-red-500/50 px-6 py-2 hover:bg-red-900/20">
                    RETURN_TO_BASE
                </button>
            </div>
        );
    }

    // Parse Gate Number if possible for visualizer
    const gateNum = reading?.gate && !isNaN(parseInt(reading.gate)) ? parseInt(reading.gate) : 34;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Context */}
            <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] opacity-[0.03]">
                {Array.from({ length: 150 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/20" />
                ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 p-8 max-w-md w-full">
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-serif text-white tracking-tight"
                    >
                        SHARED RESONANCE
                    </motion.div>
                    <div className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">
                        {reading?.headline || "System Analysis"}
                    </div>
                </div>

                {/* The Artifact Card */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-[340px] h-[340px] rounded-full border border-white/10 bg-black shadow-2xl flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-50">
                        <MandalaVisualizer
                            type="MANDALA"
                            gateNumber={gateNum}
                            size={340}
                        />
                    </div>
                    <div className="relative z-10 bg-black/80 backdrop-blur-sm px-6 py-8 rounded-xl border border-white/10 text-center">
                        <div className="font-mono text-3xl text-white mb-2">{reading?.gate || "UNK"}</div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-400">Gate Activation</div>
                    </div>
                </motion.div>

                <div className="w-full space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="font-mono text-xs text-zinc-500">TIMESTAMP</span>
                        <span className="font-mono text-xs text-white">{new Date(reading?.timestamp || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="font-mono text-xs text-zinc-500">SIGNATURE</span>
                        <span className="font-mono text-xs text-emerald-500">VERIFIED_VALID</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <button onClick={onClose} className="w-full py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        Initialize Your Own System <ExternalLink size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
