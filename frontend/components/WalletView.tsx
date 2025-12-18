import React, { useState } from 'react';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Wallet, QrCode } from 'lucide-react';
import { haptics, HapticPatterns } from '../src/services/haptics';
import { User } from '../hooks/useAuth';
import MandalaVisualizer from './MandalaVisualizer'; // Integrated

interface WalletViewProps {
    user: User;
    onClose?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user }) => {
    const [flipped, setFlipped] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [addedToWallet, setAddedToWallet] = useState(false);

    // Mouse Tilt Effects
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    // Holographic sheen position
    const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "200%"]);
    const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "200%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = (mouseXVal / width) - 0.5;
        const yPct = (mouseYVal / height) - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const handleAddToWallet = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setDownloading(true);

        try {
            const res = await apiClient.post(API_ENDPOINTS.WALLET_GENERATE, {
                userId: user.id || 'mock_user',
                tier: user.tier || 'ACCESS_SIGNAL'
            }, {
                headers: { 'Authorization': 'Bearer mock_token' }
            }); if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'defrag_artifact.pkpass';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                console.log("Pass downloaded");
                setAddedToWallet(true);
            } else {
                console.error("Failed to generate pass");
            }
        } catch (err) {
            console.error("Wallet error:", err);
        } finally {
            setDownloading(false);
            setTimeout(() => setAddedToWallet(false), 5000);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 relative overflow-hidden p-8 perspective-1000">
            {/* Background Context */}
            <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] opacity-[0.03]">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-white/20" />
                ))}
            </div>

            <div className="z-10 flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl pt-20 md:text-3xl font-serif text-white tracking-tight">IDENTITY // TOKEN</h2>
                    <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">
                        Secure Enclave access granted
                    </p>
                </div>

                {/* 3D Card Container */}
                <div className="relative w-[340px] h-[220px] md:w-[420px] md:h-[260px] cursor-pointer group perspective-1000"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => { setFlipped(!flipped); haptics.trigger(HapticPatterns.FLIP); }}
                >
                    <motion.div
                        className="w-full h-full relative preserve-3d transition-all duration-700"
                        style={{ rotateX, rotateY: flipped ? 180 : rotateY /* We handle flip manually via state for logic, or we could combine */ }}
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    >
                        {/* --- FRONT FACE --- */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                            {/* Holographic Background with Live Mandala */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute inset-0 opacity-30 mix-blend-screen scale-150">
                                    <MandalaVisualizer
                                        type="MANDALA"
                                        gateNumber={user.gate || 33}
                                        size={400}
                                    />
                                </div>
                                {/* Sheen Overlay */}
                                <motion.div
                                    className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
                                    style={{
                                        background: `linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 0, 150, 0.6) 45%, rgba(0, 255, 255, 0.6) 55%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)`,
                                        backgroundSize: '200% 200%',
                                        backgroundPositionX: sheenX,
                                        backgroundPositionY: sheenY
                                    }}
                                />
                            </div>

                            {/* Noise Texture */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            {/* Content Layer */}
                            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]" />
                                        </div>
                                        <span className="font-serif text-white text-lg tracking-wider">DEFRAG</span>
                                    </div>
                                    <QrCode className="text-white/80" size={24} />
                                </div>

                                <div className="space-y-4">
                                    {/* Artifact Token instead of Credit Card Number */}
                                    <div className="font-mono text-xl text-white tracking-widest text-shadow-glow opacity-90 truncate">
                                        {user.id ? `ARTIFACT // ${user.id.substring(0, 8).toUpperCase()}` : 'ARTIFACT // GUEST'}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Operative</div>
                                            <div className="text-sm text-white font-mono">{user?.name || "GUEST_USER"}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">Gate Key</div>
                                            <div className="text-sm text-emerald-400 font-mono">{user?.bioMetrics?.humanDesignType?.split(' ')[1] || "GATE_00"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- BACK FACE --- */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 rotate-y-180 flex flex-col">
                            {/* Removed Magnetic Strip for Artifact Feel */}
                            <div className="flex-1 p-6 flex flex-col justify-between relative bg-black/50">

                                {/* Geometric Background Pattern */}
                                <div className="absolute inset-0 opacity-10"
                                    style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                                />

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="text-[10px] text-zinc-500 font-mono max-w-[150px] leading-relaxed">
                                        This artifact is a secure key to your cognitive resonance field. Use it to share your state without revealing your source.
                                    </div>
                                    <div className="w-16 h-16 bg-white rounded-sm p-1">
                                        {/* Mock QR */}
                                        <div className="w-full h-full bg-black" style={{ maskImage: 'url(https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg)', maskSize: 'contain' }}></div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex gap-4 mt-auto">
                                    <button
                                        onClick={handleAddToWallet}
                                        disabled={downloading || addedToWallet}
                                        className={`
                                            flex-1 group relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300
                                            ${addedToWallet
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                                : 'bg-black border-zinc-700 hover:border-white hover:bg-zinc-900 text-white'
                                            }
                                        `}
                                    >
                                        <Wallet size={16} />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">
                                            {downloading ? 'Adding...' : addedToWallet ? 'Added' : 'Apple Wallet'}
                                        </span>
                                    </button>

                                    {/*
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            // Trigger Google Wallet Flow
                                            try {
                                                const res = await apiClient.post(`${API_ENDPOINTS.INIT}/../wallet/google-pass`, {
                                                    userId: user.id || 'mock_user',
                                                    gateKey: user.gate,
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    if (data.saveUrl) {
                                                        window.open(data.saveUrl, '_blank');
                                                    }
                                                }
                                            } catch(err) { console.error(err); }
                                        }}
                                        className="flex-1 group relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-zinc-700 hover:border-white hover:bg-zinc-900 bg-black text-white transition-all duration-300"
                                    >
                                        <Wallet size={16} />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">
                                            Google Wallet
                                        </span>
                                    </button>
                                     */}

                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                // Mock usage replacement of Share Token
                                                const apiUrl = API_ENDPOINTS.INIT;
                                                const res = await apiClient.post(`${apiUrl}/api/share/token`, { userId: user.id }); // Should probably be a real endpoint
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    if (navigator.clipboard) {
                                                        await navigator.clipboard.writeText(data.shareUrl);
                                                        console.log("Link copied:", data.shareUrl);
                                                        // Could add visual feedback state here
                                                        haptics.trigger(HapticPatterns.SUCCESS);
                                                    }
                                                }
                                            } catch (err) {
                                                console.error("Share failed", err);
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors active:scale-95"
                                    >
                                        <QrCode size={16} />
                                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <p className="text-zinc-600 font-mono text-[10px] animate-pulse">
                    {flipped ? "CLICK TO FLIP FRONT" : "CLICK TO FLIP BACK"}
                </p>
            </div>
        </div >
    );
};
