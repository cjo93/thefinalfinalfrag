import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AgentVisualizer } from './AgentVisualizer';
import { SoundManager } from '../src/services/SoundManager';
import { haptics, HapticPatterns } from '../src/services/haptics';

interface CommandHistory {
    type: 'input' | 'output' | 'error' | 'system' | 'agent';
    content: string;
}

type AgentState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export const DirectUplink = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<CommandHistory[]>([
        { type: 'system', content: 'COGNITIVE CORE V2.4.1 [SECURE]' },
        { type: 'system', content: 'UPLINK ESTABLISHED. WAITING FOR INPUT...' }
    ]);
    const [input, setInput] = useState('');
    const [agentState, setAgentState] = useState<AgentState>('IDLE');

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, agentState]);

    // Auto-focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const addHistory = (type: CommandHistory['type'], content: string) => {
        setHistory(prev => [...prev, { type, content }]);
        if (type === 'agent') SoundManager.play('UI_HOVER'); // Subtle data sound
    };

    const processCommand = async (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        // User Input
        addHistory('input', trimmed);
        setInput('');
        SoundManager.play('UI_CLICK');

        // Agent Thinking Simulation
        setAgentState('THINKING');

        // Safety / Tone Check & Response Generation
        setTimeout(() => {
            const lower = trimmed.toLowerCase();
            let response = "";
            let type: CommandHistory['type'] = 'output';

            // --- COMMAND PROCESSOR ---
            if (lower === 'help') {
                response = `AVAILABLE PROTOCOLS:
  query [data]  - Analyze specific data pattern
  status        - System integrity check
  clear         - Purge terminal buffer
  manifesto     - View core directives
  whoami        - Identity verification`;
            }
            else if (lower === 'status') {
                response = 'SYSTEM STATUS: NOMINAL\nNEURAL ENGINE: ACTIVE\nSAFETY GUARDRAILS: ENGAGED';
            }
            else if (lower === 'clear') {
                setHistory([]);
                setAgentState('IDLE');
                return;
            }
            else if (lower === 'whoami') {
                response = `SUBJECT_ID: ${user?.name || 'UNKNOWN'}\nACCESS_LEVEL: ${user?.tier || 'OBSERVER'}`;
            }
            else if (lower === 'manifesto') {
                response = 'DIRECTIVE: TO MAP THE INVISIBLE GEOMETRY OF THE SELF.\nOBJECTIVE: REINTEGRATION.';
            }
            // --- SAFETY GUARDRAILS (TONE ENFORCEMENT) ---
            else if (lower.includes('hurt') || lower.includes('kill') || lower.includes('die') || lower.includes('suicide')) {
                type = 'error';
                response = `*** SAFETY INTERVENTION ***\n\nThis system detects high-risk terminology. \nProtocol dictates immediate referral to biological care providers.\n\nSimulated/AI Guidance is NOT a substitute for crisis intervention.\nLink: https://988lifeline.org/`;
                SoundManager.play('SFX_LEVEL_UP'); // Use an alert-like sound if avail, or standard
            }
            else if (lower.includes('advice') || lower.includes('feel')) {
                type = 'agent';
                response = `OBSERVATION: I am a pattern recognition engine, not a therapist. \nI can analyze your structural geometry, but I cannot provide "advice" on emotional states.\n\nSUGGESTION: Input data into the 'Daily' module for structural analysis.`;
            }
            // --- DEFAULT AI RESPONSE ---
            else {
                type = 'agent';
                // Simulate "AI" analysis of the query
                response = `PROCESSING QUERY: "${trimmed}"...\n\n[ANALYSIS]: Data pattern insufficient for structural map. \nPlease specify a valid protocol or input raw topological data.`;
            }

            setAgentState('SPEAKING');
            haptics.trigger(HapticPatterns.SOFT);

            // "Type" the response (simulated by just adding it, but could delay)
            addHistory(type, response);

            // Finish Speaking
            setTimeout(() => setAgentState('IDLE'), 1500);

        }, 800 + Math.random() * 1000); // Random thinking time 0.8s - 1.8s
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processCommand(input);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black/90 font-mono text-sm overflow-hidden text-zinc-300 shadow-inner relative">
            {/* Header / Agent Presence */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Terminal size={12} />
                    <span>COGNITIVE CORE // DIAGNOSTICS LOG</span>
                </div>
                <div className="scale-75 origin-right">
                    <AgentVisualizer state={agentState} />
                </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {history.map((entry, idx) => (
                    <div key={idx} className={`leading-relaxed break-words animate-in fade-in slide-in-from-bottom-1 duration-300
                        ${entry.type === 'error' ? 'text-red-500 border-l-2 border-red-500 pl-2' :
                            entry.type === 'system' ? 'text-zinc-600 text-xs uppercase tracking-widest my-4' :
                                entry.type === 'input' ? 'text-white font-bold opacity-80' :
                                    entry.type === 'agent' ? 'text-emerald-400 font-normal pl-4 border-l border-emerald-500/30' :
                                        'text-zinc-400'}
                    `}>
                        {entry.type === 'input' && <span className="text-zinc-600 mr-2">{'>'}</span>}
                        {entry.type === 'agent' && <span className="block text-[10px] text-emerald-600 mb-1">CORE::RESPONSE</span>}
                        {entry.content}
                    </div>
                ))}

                {agentState === 'THINKING' && (
                    <div className="text-zinc-600 text-xs animate-pulse pl-4 border-l border-zinc-700">
                        PROCESSING_VECTOR...
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900/30 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                    <span className={`text-sm ${agentState === 'IDLE' ? 'text-emerald-500 animate-pulse' : 'text-zinc-600'}`}>
                        {agentState === 'THINKING' ? '...' : '>_'}
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={agentState === 'THINKING'}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-700 disabled:opacity-50"
                        placeholder={agentState === 'THINKING' ? "SYSTEM_BUSY..." : "ENTER_QUERY..."}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                    <button
                        onClick={() => processCommand(input)}
                        disabled={!input.trim() || agentState === 'THINKING'}
                        className="text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="px-4 py-1 bg-zinc-950 text-[9px] text-zinc-700 flex items-center justify-center gap-2">
                <ShieldAlert size={8} />
                <span>AI OUTPUT IS GENERATIVE AND MAY BE INACCURATE. DO NOT USE FOR MEDICAL DIAGNOSIS.</span>
            </div>
        </div>
    );
};
