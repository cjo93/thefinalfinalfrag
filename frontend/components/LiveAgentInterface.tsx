import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import { motion } from 'framer-motion';
import { Send, Terminal as TerminalIcon, Mic, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    role: 'USER' | 'AGENT';
    content: string;
    timestamp: Date;
}

interface LiveAgentInterfaceProps {
    user?: { name: string;[key: string]: unknown };
}

export const LiveAgentInterface: React.FC<LiveAgentInterfaceProps> = ({ user }) => {
    // const user = useSovereignStore((state) => state.biometrics); // Removed incorrect usage
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'AGENT',
            content: `Connected. I am the cognitive interface for ${user?.name || 'Sovereign User'}. Awaiting query.`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'USER',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await apiClient.post(API_ENDPOINTS.CHAT, {
                message: newUserMsg.content,
                context: {
                    userName: user?.name,
                    activeView: 'LIVE_AGENT', // Pass current view as context
                    // TODO: Add recent actions or user state
                }
            });

            if (res.ok) {
                const data = await res.json();
                const agentMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'AGENT',
                    content: data.reply,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, agentMsg]);
            } else {
                throw new Error("API Failed");
            }
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'AGENT',
                content: "[ERROR] Uplink unstable. Connection reset.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl h-full flex flex-col border border-white/20 bg-black/80 backdrop-blur-md rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div>
                            <h2 className="text-sm font-mono text-white uppercase tracking-widest">Live Uplink // Gemini 2.0</h2>
                            <p className="text-[9px] text-zinc-500 font-mono">Secure Channel Established</p>
                        </div>
                    </div>
                    <TerminalIcon size={16} className="text-zinc-600" />
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] ${msg.role === 'USER' ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className={`px-4 py-3 rounded-sm border ${msg.role === 'USER'
                                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                                    : 'bg-tech-gold/5 border-tech-gold/20 text-tech-gold'
                                    }`}>
                                    <p className="text-xs md:text-sm font-mono leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-mono mt-1 uppercase tracking-widest">{msg.role} // {msg.timestamp.toLocaleTimeString()}</span>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-sm bg-tech-gold/5 border border-tech-gold/20 flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin text-tech-gold" />
                                <span className="text-[10px] font-mono text-tech-gold animate-pulse">Analyzing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-zinc-900/50 border-t border-white/10">
                    <form onSubmit={handleSend} className="flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter command or query..."
                                className="w-full bg-black border border-white/10 text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-tech-gold/50 transition-colors rounded-sm"
                                autoFocus
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button type="button" className="text-zinc-500 hover:text-white transition-colors">
                                    <Mic size={16} />
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className="bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-tech-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>Send</span> <Send size={12} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
