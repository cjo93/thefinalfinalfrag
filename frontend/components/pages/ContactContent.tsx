import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

export const ContactContent = () => {
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SENDING');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
            const res = await fetch(`${apiUrl}/api/contact/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('SUCCESS');
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error('Failed to transmit');
            }
        } catch (err) {
            console.error(err);
            setStatus('ERROR');
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/50">
                    <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-serif text-white">Transmission Received</h3>
                    <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                        Your signal has been logged by the Core Team. We will decrypt and respond shortly.
                    </p>
                </div>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="mt-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-transparent hover:border-white"
                >
                    Send Another Transmission
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-zinc-300 font-sans">
            <div className="space-y-2">
                <p className="text-sm">
                    Initiate a secure handshake with the development team.
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                    // All communications are encrypted end-to-end.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Operative Name</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white placeholder-zinc-700 focus:border-white/50 focus:outline-none transition-colors font-mono text-sm"
                        placeholder="e.g. Architect.Zero"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Return Signal (Email)</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white placeholder-zinc-700 focus:border-white/50 focus:outline-none transition-colors font-mono text-sm"
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Payload (Message)</label>
                    <textarea
                        required
                        rows={5}
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white placeholder-zinc-700 focus:border-white/50 focus:outline-none transition-colors font-mono text-sm resize-none"
                        placeholder="Enter system feedback or inquiry..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                {status === 'ERROR' && (
                    <div className="text-red-400 text-xs font-mono bg-red-900/10 p-2 border border-red-900/50">
                        ERR: TRANSMISSION_FAILED. RETRY.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'SENDING'}
                    className="w-full bg-white text-black font-mono uppercase tracking-widest text-xs py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === 'SENDING' ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    {status === 'SENDING' ? 'Encrypting & Sending...' : 'Transmit Signal'}
                </button>
            </form>
        </div>
    );
};
