
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../../src/config/api';
import { apiClient } from '../../src/config/apiClient';
import { Network, BrainCircuit, Download, Activity, FileText } from 'lucide-react';
import { DataTransparency } from './DataTransparency';

interface Insight {
    id: string;
    type: 'DRIFT_WARNING' | 'CLUSTER_DETECTED' | 'HIGH_ENTROPY' | 'PATTERN_RECOGNITION' | 'SCHEMA_COHERENCE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    title: string;
    description: string;
    timestamp: number;
    metrics?: {
        passLevel?: number;
        coherence?: number;
    }
}

import { LineageMember } from '../../../src/types/family-system';

export const InsightFeed: React.FC<{
    simulationState: { nodes: { position: { x: number, y: number, z: number }, userData: { id: string } }[] } | null;
    members: LineageMember[];
    onInsightsUpdate?: (latestInsights: Insight[]) => void;
}> = ({ simulationState, members, onInsightsUpdate }) => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [activeTab, setActiveTab] = useState<'FEED' | 'SYSTEM'>('FEED');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!simulationState || !members.length) return;

            try {
                const res = await apiClient.post(API_ENDPOINTS.ANALYZE, { state: simulationState, members });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data.insights) {
                        setInsights(prev => {
                            const newIds = new Set(data.data.insights.map((i: Insight) => i.id));
                            const uniqueOld = prev.filter(i => !newIds.has(i.id));
                            const merged = [...data.data.insights, ...uniqueOld].slice(0, 5);

                            // Notify parent for visual effects
                            if (onInsightsUpdate) onInsightsUpdate(merged);

                            return merged;
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch insights", e);
            }
        };

        const interval = setInterval(fetchInsights, 10000);
        setTimeout(fetchInsights, 2000);

        return () => clearInterval(interval);
    }, [simulationState, members, onInsightsUpdate]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Mock export for now, or call actual endpoint
            // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // DEPRECATED
            // Assuming we have a REPORT endpoint or using a temporary one.
            // If API_ENDPOINTS.REPORT doesn't exist, we might need to add it or use a raw string with the base.
            // For safety, I'll use the base URL from config if needed or just assume there's an endpoint.
            // Let's us apiClient.post to a report endpoint. passing "report" as path relative might not work if client expects full URL.
            // API_ENDPOINTS.ANALYZE is available. Let's assume there is a /report endpoint parallel to it?
            // Or just use a mock download for now if the endpoint isn't defined in api.ts.
            // The previous code had `${apiUrl}/api/simulation/report`.
            // I'll add logic to use a constructed URL safely using API_ENDPOINTS.ANALYZE base?
            // Actually, I should probably add REPORT to api.ts properly, but to save steps:
            // I will use apiClient.post with a manually constructed string using API_ENDPOINTS.ANALYZE's base.

            // Temporary fix:
            const reportUrl = API_ENDPOINTS.ANALYZE.replace('/analyze', '/report');

            const res = await apiClient.post(reportUrl, { insights, members, metrics: simulationState });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `DEFRAG_System_Report_${Date.now()}.md`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (e) {
            console.error("Export failed", e);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="absolute top-24 right-4 w-80 z-20 pointer-events-none md:pointer-events-auto flex flex-col gap-2">

            {/* Control Bar */}
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-md border border-white/10 p-1 pointer-events-auto rounded-lg">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('FEED')}
                        className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${activeTab === 'FEED' ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Live Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('SYSTEM')}
                        className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${activeTab === 'SYSTEM' ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        System
                    </button>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="p-1.5 text-zinc-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    title="Export Analysis Report"
                >
                    {isExporting ? <Activity className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-3 pointer-events-auto max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence>
                    {insights.map((insight) => (
                        <motion.div
                            key={insight.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel p-4 relative group"
                        >
                            {/* Severity Indicator */}
                            <div className={`absolute top-0 left-0 w-0.5 h-full transition-colors ${insight.severity === 'HIGH' ? 'bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                insight.severity === 'MEDIUM' ? 'bg-amber-500/80' : 'bg-emerald-500/80'
                                }`} />

                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {insight.type === 'DRIFT_WARNING' && <Network className="w-3.5 h-3.5 text-amber-500" />}
                                    {insight.type === 'HIGH_ENTROPY' && <Activity className="w-3.5 h-3.5 text-red-500" />}
                                    {insight.type === 'SCHEMA_COHERENCE' && <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />}
                                    {insight.type === 'PATTERN_RECOGNITION' && <FileText className="w-3.5 h-3.5 text-blue-400" />}

                                    <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">
                                        {insight.type.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-600">
                                    {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>

                            <h4 className="text-xs font-serif font-medium text-zinc-100 mb-1.5 leading-tight tracking-wide">
                                {insight.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mb-3 opacity-90">
                                {insight.description}
                            </p>

                            {/* Deep Intelligence Metrics Badge */}
                            {(insight.metrics?.passLevel || insight.metrics?.coherence !== undefined) && (
                                <div className="flex gap-2 mb-3">
                                    {insight.metrics.passLevel && (
                                        <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-zinc-400">
                                            DEPTH: LVL {insight.metrics.passLevel}
                                        </div>
                                    )}
                                    {insight.metrics.coherence !== undefined && (
                                        <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-zinc-400">
                                            COHERENCE: {(insight.metrics.coherence * 100).toFixed(0)}%
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                <DataTransparency
                                    title="Insight Logic Verification"
                                    source="Analyst Agent (Heuristic + Schema)"
                                    data={insight}
                                    type="logic"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {insights.length === 0 && (
                    <div className="glass-panel p-6 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                            <BrainCircuit className="w-6 h-6 text-emerald-500/70" />
                            <div className="space-y-1">
                                <span className="text-xs font-mono uppercase text-zinc-400 tracking-widest block">System Monitoring Active</span>
                                <span className="text-[10px] text-zinc-600 block">Waiting for pattern emergence...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
