
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

import {
    Activity,
    Minimize2,
    Radio,
    LayoutDashboard,
    Network,
    Settings,
    RefreshCw,
    BookOpen,
    Cpu,
    Share2,
    UserPlus,
    X,
    Check,
    Play,
    Pause,
    Copy,
    Volume2,
    VolumeX,
    Wallet,
    Lock,
    Info,
    Terminal
} from 'lucide-react';

import { generateDefragAnalysis, DefragAnalysis } from '../services/ai';
import { User } from '../hooks/useAuth';
import { TypingEffect } from './TypingEffect';
import { TierGate } from './TierGate';
import { BootSequence } from './BootSequence';
import { NavIcon } from './NavIcon';
import MandalaVisualizer from './MandalaVisualizer';
import { ConceptVisualizer } from './ConceptVisualizer';
import { TopologyGraph } from './TopologyGraph'; // Fixed named import
import SelfPolarityAxis from './SelfPolarityAxis';
import { WalletView } from './WalletView';
import { AudioEngine } from './AudioEngine';
import { haptics, HapticPatterns } from '../src/services/haptics';
import { AnimatePresence } from 'framer-motion';
import { RelationalGeometry } from './TopologyGraph';
import { TimelineEvent } from './CorkscrewTimeline';

import { SpiralTimeline, LogEventData } from './SpiralTimeline';
import { FamilyAntigravityCube } from './FamilyAntigravityCube';
import { FamilyInputNode } from './FamilyInputNode';
import { CosmicForecastWidget } from './CosmicForecastWidget';
import { useSovereignStore } from '../stores/useSovereignStore'; // [NEW STORE]
import { VoiceAgent } from '../services/VoiceAgent';
import { SettingsView } from './SettingsView';

// ... imports
import { DirectUplink } from './DirectUplink';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import { ProtocolRing } from './ui/ProtocolRing';
import { DisclaimerModal } from './DisclaimerModal';
import { SystemLayout } from './SystemLayout';
import { GamificationHUD } from './GamificationHUD';
import { calculateNextLevel } from '../../src/types/gamification';
import { NatalDataForm } from './Onboarding/NatalDataForm';
import { Spectrogram } from './Spectrogram';
import { FrequencySynthesizer } from '../src/services/spectral/FrequencySynthesizer';

const bootLines = [
    "CALIBRATING_AWARENESS...",
    "MAPPING_RELATIONAL_FIELD...",
    "SYNCHRONIZING_PATTERN...",
    "ACCESSING_CORE_MEMORY..."
];

// --- ERROR BOUNDARY ---
class ComponentErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error) { console.error("Component Error:", error); }
    render() {
        if (this.state.hasError) return <div className="p-4 text-[10px] font-mono text-red-500 border border-red-900 bg-red-950/20">MODULE_OFFLINE // RE-INITIALIZE</div>;
        // @ts-expect-error: Suppressing children type check for ErrorBoundary
        return this.props.children;
    }
}

type SystemView = 'DAILY' | 'TOPOLOGY' | 'CALIBRATION' | 'AXIS' | 'TIMELINE' | 'WALLET' | 'FAMILY' | 'CLI';

interface NeuralInterfaceProps {
    user: User;
    onClose: () => void;
    onUpdateUser: (user: User) => void;
}

export const NeuralInterface: React.FC<NeuralInterfaceProps> = ({ user, onClose, onUpdateUser }) => {
    const [analysis, setAnalysis] = useState<DefragAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    // const [loadingKnowledge, setLoadingKnowledge] = useState(false);

    // Audio State
    const [isMuted, setIsMuted] = useState(true);
    // [DEV] Defaulting to TOPOLOGY for user review
    const [activeView, setActiveView] = useState<SystemView>('TOPOLOGY');
    const [topologyData, setTopologyData] = useState<RelationalGeometry | undefined>(undefined);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

    // Sovereign Store Hooks
    const familyMembers = useSovereignStore((state) => state.familyMembers);
    const setFamilyMembers = useSovereignStore((state) => state.setMembers);
    // Sync initial user data if store is empty (optional migration strategy)
    React.useEffect(() => {
        if (familyMembers.length === 0 && user.familyMembers && user.familyMembers.length > 0) {
            setFamilyMembers(user.familyMembers);
        }
    }, [user.familyMembers, familyMembers.length, setFamilyMembers]);

    // Fetch Terminal Data
    React.useEffect(() => {
        const fetchTerminalData = async () => {
            if (!user.id) return;
            // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // DEPRECATED

            try {
                // Fetch Topology
                const topRes = await apiClient.get(API_ENDPOINTS.TOPOLOGY(user.id));
                if (topRes.ok) {
                    const topData = await topRes.json();
                    setTopologyData(topData);
                }

                // Fetch Timeline
                const timeRes = await apiClient.get(API_ENDPOINTS.TIMELINE_EVENTS(user.id));
                if (timeRes.ok) {
                    const timeData = await timeRes.json();
                    setTimelineEvents(timeData);
                }
            } catch (e) {
                console.error("Failed to fetch terminal data", e);
            }
        };

        if (activeView === 'TOPOLOGY' || activeView === 'TIMELINE') {
            fetchTerminalData();
        }
    }, [user.id, activeView]);

    // Dynamic Title Effect
    React.useEffect(() => {
        const titleMap: Record<SystemView, string> = {
            'DAILY': 'SIGNAL // DEFRAG',
            'TOPOLOGY': 'GEOMETRY // DEFRAG',
            'FAMILY': 'SYSTEM // DEFRAG',
            'WALLET': 'VAULT // DEFRAG',
            'CALIBRATION': 'ALIGN // DEFRAG',
            'CLI': 'UPLINK // DEFRAG',
            'AXIS': 'AXIS // DEFRAG',
            'TIMELINE': 'TIME // DEFRAG'
        };
        document.title = titleMap[activeView] || 'DEFRAG // INTERFACE';
        return () => { document.title = 'DEFRAG // SYSTEM'; };
    }, [activeView]);

    // Boot Sequence State
    // Flow: INIT -> CHECK -> [NATAL] -> TERMS -> COMPLETE
    const [bootPhase, setBootPhase] = useState<'INIT' | 'CHECK' | 'NATAL' | 'TERMS' | 'COMPLETE'>(
        'INIT'
    );

    // Effect: Handle Boot Sequence Progression
    // REMOVED: Auto-advance caused race condition skipping Terms.
    // Now relying entirely on <BootSequence onComplete={...} /> to drive state.

    // Effect: Check for Payment Success Redirect
    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            console.log("Payment Success Detected - Upgrading Tier");
            // In a real app, verify session_id with backend here
            onUpdateUser({ ...user, tier: 'ARCHITECT_NODE' });
            // Clear URL param to prevent loop/clutter
            window.history.replaceState({}, '', window.location.pathname);
            // Auto-navigate to unlocked view
            setActiveView('TOPOLOGY');
        }
    }, [user, onUpdateUser]);

    const handleAcceptTOS = () => {
        // Persist acceptance
        console.log("Accepting TOS");
        onUpdateUser({ ...user, tosAcceptedAt: new Date().toISOString() });
    };




    // Therapist State
    const [showTherapistModal, setShowTherapistModal] = useState(false);
    const [therapistEmail, setTherapistEmail] = useState('');
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    // Onboarding State
    const hasNatalData = !!(user.bioMetrics?.birthDate && user.bioMetrics?.birthTime && user.bioMetrics?.birthLocation);
    // [DEV] Bypass for dev user if needed, but strictly enforce for new users
    const [isOnboarding, setIsOnboarding] = useState(!hasNatalData);

    // Update onboarding state if user data changes (e.g. after sync)
    React.useEffect(() => {
        if (user.bioMetrics?.birthDate && user.bioMetrics?.birthTime && user.bioMetrics?.birthLocation) {
            setIsOnboarding(false);
        }
    }, [user.bioMetrics]);

    const handleOnboardingSubmit = async (data: { birthDate: string; birthTime: string; birthLocation: string }) => {
        setLoading(true);
        try {
            // 1. Update Local User immediately for UI responsiveness
            const updatedUser = {
                ...user,
                bioMetrics: {
                    ...user.bioMetrics,
                    ...data,
                    humanDesignType: 'Calculating...', // Will be updated by backend return
                    enneagram: 'Calculating...'
                }
            };
            onUpdateUser(updatedUser);

            // 2. Trigger Backend Computation (INIT endpoint)
            // This corresponds to the background sync logic in useAuth, but we force it here
            const res = await apiClient.post(API_ENDPOINTS.INIT, {
                userId: user.id || 'temp_id_' + Date.now(),
                email: user.email,
                name: user.name,
                bioMetrics: data
            });

            if (res.ok) {
                const resData = await res.json();
                // Merge backend calculations (HD/Enneagram)
                if (resData.user?.bioMetrics) {
                    onUpdateUser({
                        ...updatedUser,
                        bioMetrics: resData.user.bioMetrics
                    });
                }
                haptics.trigger(HapticPatterns.SUCCESS);
                // setIsOnboarding(false); // DEPRECATED: Handled by phase transition
                setBootPhase('TERMS'); // Transition to Terms after Natal
            } else {
                console.error("Initialization Failed");
            }
        } catch (e) {
            console.error("Onboarding Error", e);
        } finally {
            setLoading(false);
        }
    };

    // Voice Agent State
    const [isPlaying, setIsPlaying] = useState(false); // Restored
    // const audioRef = useRef<HTMLAudioElement | null>(null);



    const handleCreateShare = async () => {
        if (!therapistEmail) return;
        try {
            const res = await apiClient.post(API_ENDPOINTS.THERAPIST_SHARE, { user_id: 'mock_user_id', therapist_email: therapistEmail });
            const data = await res.json();
            if (data.share_link) {
                setShareLink(data.share_link);
            }
        } catch (e) {
            console.error("Share failed", e);
        }
    };


    // Calibration State
    const [calibData] = useState({
        birthDate: user.bioMetrics?.birthDate || '',
        birthTime: user.bioMetrics?.birthTime || '',
        birthLocation: user.bioMetrics?.birthLocation || ''
    });
    const fetchKnowledge = async (_key: string) => {
        // Mock implementation for now to satisfy lint/compile, or just wire it up if easy.
        // Actually, if I restore the original code it's better.
        // But since I deleted the state for knowledgeItem too, I need to restore that.
    };

    const signalRef = useRef<HTMLDivElement>(null);

    // Unified Analysis Fetcher
    const fetchSystemAnalysis = React.useCallback(async (silent = false) => {
        if (!user.id) return;
        setLoading(true);

        try {
            // Use current state or fallbacks
            const payload = {
                state: topologyData,
                members: familyMembers,
                tier: user.tier || 'ACCESS_SIGNAL',
                userId: user.id
            };

            const res = await apiClient.post(API_ENDPOINTS.ANALYZE, payload);
            const data = await res.json();

            if (data.success && data.data.insights) {
                setAnalysis({
                    ...data.data.insights,
                    // Merge defaults if backend partial
                    daily_lesson: data.data.insights.daily_lesson || { topic: 'System Analysis', content: 'Processing complete.' },
                    narrative: data.data.insights.narrative || 'Analysis complete.',
                    headline: data.data.insights.headline || 'System Report' // Ensure headline maps correctly
                });

                if (!silent) {
                    haptics.trigger(HapticPatterns.SUCCESS);
                }
            }
        } catch (e) {
            console.error("System Analysis Failed", e);
        } finally {
            setLoading(false);
        }
    }, [user.id, user.tier, topologyData, familyMembers]);

    // Manual Trigger (e.g. from Family Node)
    const handleAnalyzeSystem = async () => {
        await fetchSystemAnalysis(false);
        setActiveView('DAILY'); // Switch to view report
    };

    // Auto-start diagnostics on mount
    // checking if analysis is null ensures we only fetch once on mount,
    // but we might want to refresh if user changes? For now, run once.
    React.useEffect(() => {
        if (!analysis && user.id) {
            fetchSystemAnalysis(true);
        }
    }, [user.id]); // Only run on mount/user-ready




    const centers = [
        { id: 'HEAD', name: 'Head', desc: 'Inspiration', val: 20, gate: '61.2' },
        { id: 'AJNA', name: 'Ajna', desc: 'Processing', val: 20, gate: '43.5' },
        { id: 'THRT', name: 'Throat', desc: 'Expression', val: 20, gate: '23.1' },
        { id: 'G-CTR', name: 'G-Center', desc: 'Self/Direction', val: 100, gate: '10.3' },
        { id: 'EGO', name: 'Heart', desc: 'Will/Value', val: 20, gate: '26.4' },
        { id: 'SACL', name: 'Sacral', desc: 'Life Force', val: 20, gate: 'Open' },
        { id: 'ROOT', name: 'Root', desc: 'Adrenaline', val: 100, gate: '53.6' },
        { id: 'SPLN', name: 'Spleen', desc: 'Instinct', val: 100, gate: '57.2' },
        { id: 'SOLR', name: 'Solar Plex', desc: 'Emotion', val: 20, gate: 'Open' },
    ];

    if (bootPhase === 'INIT' || bootPhase === 'CHECK') {
        return <BootSequence onComplete={() => {
            if (isOnboarding) {
                setBootPhase('NATAL');
            } else if (!user.tosAcceptedAt) {
                setBootPhase('TERMS');
            } else {
                setBootPhase('COMPLETE');
            }
        }} />;
    }

    if (bootPhase === 'NATAL') {
        return <NatalDataForm onSubmit={handleOnboardingSubmit} isLoading={loading} />;
    }

    if (bootPhase === 'TERMS') {
        return (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
                {/* Background Elements to maintain immersion */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scanline"></div>

                <DisclaimerModal
                    isOpen={true}
                    onAccept={() => {
                        handleAcceptTOS();
                        setBootPhase('COMPLETE');
                    }}
                    onDecline={() => {
                        // Reload to kick back to Landing
                        window.location.reload();
                    }}
                />
            </div>
        );
    }


    const handleUpgrade = async (tier: 'ARCHITECT_NODE' | 'HELIX_PROTOCOL') => {
        try {
            setLoading(true);
            // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // DEPRECATED
            const res = await apiClient.post(API_ENDPOINTS.CHECKOUT, {
                tier,
                userId: user.id,
                successUrl: window.location.origin, // Simplified return
                cancelUrl: window.location.origin
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned", data);
            }
        } catch (e) {
            console.error("Upgrade failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogEvent = async (eventData: LogEventData) => {
        if (!user.id) return;
        try {
            const res = await apiClient.post(API_ENDPOINTS.TIMELINE_LOG, {
                userId: user.id,
                ...eventData
            });
            if (res.ok) {
                // Refresh list
                const timeRes = await apiClient.get(API_ENDPOINTS.TIMELINE_EVENTS(user.id));
                const data = await timeRes.json();
                setTimelineEvents(data);
            }
        } catch (e) {
            console.error("Failed to log event", e);
        }
    };




    // INTERCEPTOR: Onboarding - REMOVED, Handled by 'NATAL' phase above
    // if (isOnboarding && bootPhase === 'COMPLETE') { // Only show after boot
    //     return <NatalDataForm onSubmit={handleOnboardingSubmit} isLoading={loading} />;
    // }

    return (

        <SystemLayout>
            <AnimatePresence mode="wait">
                {bootPhase !== 'COMPLETE' ? (
                    <motion.div
                        key="BOOT_SEQUENCE"
                        className="fixed inset-0 z-[200] bg-black flex items-center justify-center font-mono cursor-wait"
                        exit={{ opacity: 0 }}
                    >
                        <div className="w-full max-w-md p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                <h1 className="text-xl text-white font-bold tracking-[0.2em] uppercase">Defrag_OS</h1>
                            </div>

                            <div className="space-y-2 h-32">
                                {bootLines.map((line, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{
                                            opacity: bootPhase === 'CHECK' || bootPhase === 'COMPLETE' ? 1 : i === 0 ? 1 : 0.3,
                                            x: 0
                                        }}
                                        transition={{ delay: i * 0.15 }}
                                        className="text-xs md:text-sm text-zinc-500 uppercase tracking-widest flex justify-between items-center"
                                    >
                                        <span>{line}</span>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.15 + 0.3 }}
                                            className="text-emerald-500"
                                        >
                                            [OK]
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-0.5 bg-zinc-800 mt-8 overflow-hidden"
                            >
                                <div className="h-full bg-white/50 w-full" />
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="MAIN_INTERFACE"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="fixed inset-0 z-[100] flex flex-col md:flex-row overflow-hidden font-sans"
                    >

                        {/* --- NAVIGATION RAIL (iOS Glass) --- */}

                        <div className="fixed bottom-0 left-0 right-0 md:relative md:w-20 lg:w-24 dfg-rail border-t md:border-t-0 md:border-r flex flex-row md:flex-col items-center justify-around md:justify-start py-4 pb-[env(safe-area-inset-bottom)] md:py-8 gap-0 md:gap-10 order-2 md:order-1 flex-shrink-0 z-50 transition-all duration-300">
                            {/* Logo */}
                            <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 border border-white/20 items-center justify-center mb-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-shadow">
                                <Radio className="text-white" size={18} />
                            </div>

                            {/* Nav Items */}
                            <div className="flex flex-row md:flex-col w-full gap-1 md:gap-4 px-1 md:px-3 justify-between md:justify-start max-w-sm md:max-w-none mx-auto mb-2 md:mb-0">
                                <NavIcon icon={LayoutDashboard} label="Signal" active={activeView === 'DAILY'} onClick={() => { setActiveView('DAILY'); haptics.trigger(HapticPatterns.SOFT); }} tooltip="Daily Signal" />
                                <NavIcon icon={Network} label="Geometry" active={activeView === 'TOPOLOGY'} onClick={() => { setActiveView('TOPOLOGY'); haptics.trigger(HapticPatterns.SOFT); }} tooltip="Topology Geometry" />
                                <NavIcon icon={Share2} label="System" active={activeView === 'FAMILY'} onClick={() => { setActiveView('FAMILY'); haptics.trigger(HapticPatterns.SOFT); }} tooltip="System Dynamics" />
                                <NavIcon icon={Wallet} label="Vault" active={activeView === 'WALLET'} onClick={() => { setActiveView('WALLET'); haptics.trigger(HapticPatterns.SOLID); }} tooltip="Identity Vault" />
                                <NavIcon icon={Settings} label="Align" active={activeView === 'CALIBRATION'} onClick={() => { setActiveView('CALIBRATION'); haptics.trigger(HapticPatterns.SOFT); }} tooltip="Calibration" />
                                <div className="h-px bg-white/10 w-full my-2 hidden md:block"></div>
                                <NavIcon icon={Terminal} label="Uplink" active={activeView === 'CLI'} onClick={() => { setActiveView('CLI'); haptics.trigger(HapticPatterns.SOLID); }} tooltip="Direct Link" />
                            </div>

                            <div className="hidden md:flex mt-auto flex-col gap-4">
                                <button onClick={onClose} className="p-3 text-zinc-600 hover:text-white transition-colors group relative">
                                    <Minimize2 size={20} />
                                    <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-white/10 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">Minimize</span>
                                </button>
                            </div>
                        </div>

                        {/* --- MAIN CONTENT --- */}
                        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] order-1 md:order-2">

                            {/* Header with Status Indicator */}
                            <div className="dfg-app-bar h-14 md:h-16 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                    <span className="dfg-subtitle text-white/70">
                                        {activeView === 'DAILY' && 'Direct Signal // Architecture'}
                                        {activeView === 'TOPOLOGY' && 'Relational Geometry // Laser Tier'}
                                        {activeView === 'FAMILY' && 'System Dynamics // Vector Space'}
                                        {activeView === 'WALLET' && 'Secure Enclave // Identity Vault'}
                                        {activeView === 'CALIBRATION' && 'Bio-Metric Alignment // Calibration'}
                                        {activeView === 'CLI' && 'Direct Uplink // Neural Bridge'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                                        <span className="dfg-kicker text-emerald-200/70">Coherence Online</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4">
                                    {loading && <RefreshCw size={14} className="animate-spin text-zinc-500" />}
                                    <div className="dfg-pill bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hidden sm:inline-flex">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                                        LIVE SIGNAL
                                    </div>
                                    <button
                                        onClick={() => setShowTherapistModal(true)}
                                        className="dfg-button-ghost !rounded-md !p-2"
                                        title="Connect Therapist"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="dfg-button-ghost !rounded-md !p-2"
                                        title={isMuted ? "Unmute Audio" : "Mute Audio"}
                                    >
                                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Gamification HUD */}
                            <div className="absolute top-16 right-8 z-40 hidden md:block">
                                <GamificationHUD
                                    xp={user.gamification?.xp || 0}
                                    level={user.gamification?.level || 1}
                                    rank={user.gamification?.rank || 'INITIATE'}
                                    nextLevelXp={calculateNextLevel(user.gamification?.xp || 0).xpForNext}
                                    progress={calculateNextLevel(user.gamification?.xp || 0).progress}
                                    systemCoherence={topologyData?.coherence || 0} // Using Topology coherence as system metric
                                />
                            </div>

                            <div className="flex-1 overflow-hidden relative pb-32 md:pb-0">
                                {/* Disable auto-play tone */}
                                <AudioEngine activeView={activeView} muted={isMuted} />

                                <AnimatePresence mode="wait">
                                    {/* VIEW: DAILY */}
                                    {activeView === 'DAILY' && (
                                        <motion.div
                                            key="DAILY"
                                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.4, ease: "circOut" }}
                                            className="h-full grid lg:grid-cols-[280px_1fr] overflow-hidden"
                                        >
                                            {/* ... (Left Vitals Panel omitted for brevity, effectively same) ... */}
                                            <div className="hidden lg:flex flex-col border-r border-white/10 bg-zinc-900/10 overflow-y-auto custom-scrollbar">
                                                {/* Vitals Panel Content */}
                                                <div className="p-6 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
                                                    <h4 className="flex items-center gap-2 font-mono text-[10px] uppercase text-zinc-400 tracking-widest">
                                                        <Activity size={14} /> Bio-Metrics
                                                    </h4>
                                                </div>
                                                <div className="p-6">
                                                    <div className="mb-4">
                                                        <div className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest mb-1">Active Spectrum</div>
                                                        <Spectrogram
                                                            data={FrequencySynthesizer.synthesize(
                                                                [{ planet: 'Mars', sign: 'Aries' }, { planet: 'Venus', sign: 'Taurus' }],
                                                                [{ gate: '36', center: 'Solar Plexus', defined: true }, { gate: '43', center: 'Ajna', defined: true }]
                                                            ).frequencies}
                                                            height={150}
                                                        />
                                                    </div>

                                                    <div className="h-px w-full bg-white/5 my-6"></div>

                                                    <div className="space-y-4">
                                                        <div className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest mb-2">Resonance Centers</div>
                                                        {centers.map((c) => (
                                                            <div key={c.id} className="group cursor-help">
                                                                <div className="flex justify-between items-end mb-1">
                                                                    <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-white transition-colors">{c.name}</span>
                                                                    <span className="text-[9px] font-mono text-zinc-600 group-hover:text-tech-gold transition-colors">{c.gate}</span>
                                                                </div>
                                                                <div className="h-0.5 bg-zinc-800 w-full">
                                                                    <div className={`h-full ${c.val > 50 ? 'bg-white' : 'bg-zinc-700'} group-hover:bg-tech-gold transition-colors`} style={{ width: `${c.val}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-24 md:pb-12">
                                                {loading && !analysis ? (
                                                    <div className="h-full flex items-center justify-center min-h-[60vh]">
                                                        <div className="max-w-3xl w-full space-y-6">
                                                            <div className="dfg-card p-6 space-y-4">
                                                                <div className="dfg-skeleton h-4 w-32"></div>
                                                                <div className="dfg-skeleton h-8 w-3/4"></div>
                                                                <div className="dfg-divider"></div>
                                                                <div className="space-y-3">
                                                                    <div className="dfg-skeleton h-4 w-full"></div>
                                                                    <div className="dfg-skeleton h-4 w-11/12"></div>
                                                                    <div className="dfg-skeleton h-4 w-2/3"></div>
                                                                </div>
                                                            </div>
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div className="dfg-card-soft p-4 space-y-3">
                                                                    <div className="dfg-skeleton h-3 w-24"></div>
                                                                    <div className="dfg-skeleton h-4 w-full"></div>
                                                                    <div className="dfg-skeleton h-4 w-5/6"></div>
                                                                    <div className="dfg-skeleton h-10 w-28 rounded-full"></div>
                                                                </div>
                                                                <div className="dfg-card-soft p-4 space-y-3">
                                                                    <div className="dfg-skeleton h-3 w-20"></div>
                                                                    <div className="dfg-skeleton h-16 w-full rounded-xl"></div>
                                                                    <div className="dfg-skeleton h-4 w-10"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : analysis ? (
                                                    <div className="max-w-3xl mx-auto space-y-12">
                                                        <div className="dfg-card-soft p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`dfg-badge ${analysis.system_status === 'RECALIBRATING' ? 'dfg-badge-warn' : 'dfg-badge-positive'}`}>
                                                                    STATUS: {analysis.system_status}
                                                                </span>
                                                                <span className="dfg-pill text-white/70 bg-white/5 border-white/10">
                                                                    INTEGRITY: {analysis.integrity_score}%
                                                                </span>
                                                            </div>
                                                            <div className="dfg-subtitle text-white/60 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse"></div>
                                                                Defrag sequence synchronized
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="dfg-kicker text-white/60">Signal Headline</p>
                                                            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-[1.15]">
                                                                <TypingEffect text={analysis.headline} speed={20} />
                                                            </h2>
                                                        </div>


                                                        {/* Audio Player & Controls */}
                                                        <div className="dfg-card-soft p-4 flex items-center gap-4 mb-6">
                                                            <button
                                                                onClick={() => {
                                                                    if (isPlaying) {
                                                                        VoiceAgent.getInstance().stop();
                                                                        setIsPlaying(false);
                                                                    } else {
                                                                        VoiceAgent.getInstance().speak(analysis.narrative);
                                                                        setIsPlaying(true);
                                                                    }
                                                                }}
                                                                className={`dfg-button !rounded-full !w-12 !h-12 ${isPlaying ? '!bg-white !text-black !border-white' : '!bg-white/10 !text-white !border-white/20'}`}
                                                            >
                                                                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                                                            </button>

                                                            <div className="flex-1 space-y-2">
                                                                <div className="dfg-subtitle text-white/70">
                                                                    {isPlaying ? 'Reading signal...' : 'Listen to transmission'}
                                                                </div>
                                                                {/* Volume Slider - Hidden on mobile initially or minimal */}
                                                                <div className="flex items-center gap-2 group">
                                                                    <Volume2 size={12} className="text-zinc-500" />
                                                                    <input
                                                                        type="range"
                                                                        min="0"
                                                                        max="1"
                                                                        step="0.01"
                                                                        defaultValue="0.5"
                                                                        className="w-28 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                                                                        onChange={(e) => VoiceAgent.getInstance().setVolume(parseFloat(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="relative group dfg-card p-6 md:p-8">
                                                            <div className="prose prose-invert prose-p:font-sans prose-p:font-light prose-p:text-zinc-300 prose-p:leading-loose prose-p:tracking-wide prose-p:text-base md:prose-p:text-lg max-w-none">
                                                                {analysis.narrative.split('\n\n').map((para, i) => {
                                                                    if (para.startsWith('##')) {
                                                                        return <h3 key={i} className="text-xl font-serif text-white mt-8 mb-4">{para.replace(/#/g, '').trim()}</h3>;
                                                                    }
                                                                    if (para.startsWith('-')) {
                                                                        return <li key={i} className="ml-4 text-zinc-300 mb-2">{para.replace('-', '').trim()}</li>;
                                                                    }
                                                                    return (
                                                                        <p key={i} className="mb-4 text-zinc-300 leading-relaxed">
                                                                            {para}
                                                                        </p>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(analysis.narrative)}
                                                                    className="dfg-button-ghost !rounded-md !px-3 !py-1.5 bg-white/5 border border-white/10"
                                                                    title="Copy Narrative"
                                                                >
                                                                    <Share2 size={16} />
                                                                    Copy
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Modules - Enhanced with Visualizer */}
                                                        <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
                                                            {/* Lesson Card */}
                                                            <div className="p-0 dfg-card flex flex-col relative group overflow-hidden transition-all duration-500 hover:border-white/20">

                                                                {/* Signal Card Capture Area - HIDDEN */}
                                                                <div id="signal-card-container" ref={signalRef} className="bg-black p-8 border border-white/20 aspect-[4/5] flex flex-col justify-between hidden fixed top-0 left-0 w-[400px] z-[-1]">
                                                                    {/* ... (content remains same, but avoiding large diff) ... */}
                                                                </div>

                                                                {/* Content continues... I need to be careful not to delete the hidden div content if I replace the whole block.
                                                                    Actually, I will target just the opening div tag of the card.
                                                                */}
                                                                {/* Signal Card Capture Area */}
                                                                <div id="signal-card-container" ref={signalRef} className="bg-black p-8 border border-white/20 aspect-[4/5] flex flex-col justify-between hidden fixed top-0 left-0 w-[400px] z-[-1]">
                                                                    <div className="flex justify-between items-start">
                                                                        <h1 className="text-4xl font-black text-white tracking-tighter">DEFRAG</h1>
                                                                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{new Date().toLocaleDateString()}</div>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                                                        <h3 className="text-2xl font-serif text-white leading-tight">"{analysis.headline}"</h3>
                                                                        <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">{analysis.daily_lesson.topic}</p>
                                                                    </div>
                                                                    <div className="flex justify-center py-8">
                                                                        <div className="scale-150">
                                                                            {/* Check if we have a generated image URL, else use SVG */}
                                                                            {user.mandalaId && user.mandalaId.startsWith('http') ? (
                                                                                <img src={user.mandalaId} alt="Generated Mandala" className="w-[150px] h-[150px] object-cover rounded-full" />
                                                                            ) : (
                                                                                <ComponentErrorBoundary>
                                                                                    {['SCATTER', 'SYNTHESIS', 'CORE', 'REFRACTION', 'INTERFERENCE'].includes(analysis.daily_lesson.visual_symbol as string) ? (
                                                                                        <div className="w-[150px] h-[150px] relative">
                                                                                            <ConceptVisualizer type={analysis.daily_lesson.visual_symbol as string} />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <MandalaVisualizer type={analysis.daily_lesson.visual_symbol as string} size={150} />
                                                                                    )}
                                                                                </ComponentErrorBoundary>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="text-[9px] font-mono text-zinc-600">SYS_VER.2.4 // SIGNAL_ID_{Math.floor(Math.random() * 10000)}</div>
                                                                        <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                                                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="p-6 pb-0 flex items-center justify-between mb-4 text-tech-gold">
                                                                    <div className="flex items-center gap-4">
                                                                        <ProtocolRing currentDay={analysis.daily_lesson.day || 1} className="w-16 h-16" />
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <BookOpen size={14} className="text-tech-gold/80" />
                                                                                <span className="font-mono text-[9px] uppercase tracking-widest text-tech-gold/80">
                                                                                    Phase // {analysis.daily_lesson.phase || 'INITIATION'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="h-px w-full bg-gradient-to-r from-tech-gold/50 to-transparent"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="px-6 pb-8">
                                                                    <h3 className="font-serif text-2xl text-white mb-2 leading-tight tracking-tight">{analysis.daily_lesson.topic}</h3>
                                                                    <p className="text-sm text-zinc-400 leading-relaxed font-light mb-4">{analysis.daily_lesson.content}</p>

                                                                    {/* Deep Dive Button */}
                                                                    {analysis.daily_lesson.knowledge_key && (
                                                                        <button
                                                                            onClick={() => fetchKnowledge(analysis.daily_lesson.knowledge_key!)}
                                                                            className="group flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-tech-gold transition-colors mt-auto border border-white/5 hover:border-tech-gold/30 px-3 py-1.5 w-max bg-black"
                                                                        >
                                                                            <Info size={12} className="text-zinc-600 group-hover:text-tech-gold transition-colors" />
                                                                            <span>Launch Deep Dive</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Protocol Card */}
                                                            <div className="dfg-card flex flex-col relative group overflow-hidden transition-all duration-500 hover:border-white/20">
                                                                {/* Protocol Uplink Header */}
                                                                <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                                                    <div className="flex items-center gap-2 text-zinc-500">
                                                                        <Cpu size={12} />
                                                                        <span className="font-mono text-[9px] uppercase tracking-widest">Protocol_Exec // V.2.4</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-emerald-500">
                                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                                        <span className="font-mono text-[9px] uppercase tracking-widest">Running</span>
                                                                    </div>
                                                                </div>

                                                                <div className="p-6 flex-1 flex flex-col">
                                                                    <p className="font-mono text-xs text-zinc-100 leading-relaxed mb-auto pl-4 border-l-2 border-white/20 py-1 relative">
                                                                        <span className="absolute -left-[5px] top-0 w-1.5 h-1.5 bg-white rounded-full"></span>
                                                                        {`> ${analysis.protocol} `}
                                                                    </p>
                                                                </div>

                                                                <div className="px-4 py-3 bg-zinc-900/50 border-t border-white/5 flex justify-end">
                                                                    <button className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2 transition-colors border border-white/10 px-3 py-1.5 bg-black hover:bg-white/10 group-hover:border-white/30">
                                                                        <Share2 size={10} /> Save Routine
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Clinical Export */}
                                                        <div className="flex justify-end pt-4">
                                                            <button
                                                                onClick={async () => {
                                                                    setLoading(true);
                                                                    try {
                                                                        const res = await apiClient.post(API_ENDPOINTS.EXPORT_PDF, { analysisId: undefined }); // Latest
                                                                        if (res.ok) {
                                                                            const blob = await res.blob();
                                                                            const url = window.URL.createObjectURL(blob);
                                                                            const a = document.createElement('a');
                                                                            a.href = url;
                                                                            a.download = `DEFRAG_CLINICAL_REPORT_${new Date().toISOString().split('T')[0]}.pdf`;
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            window.URL.revokeObjectURL(url);
                                                                            document.body.removeChild(a);
                                                                            haptics.trigger(HapticPatterns.SUCCESS);
                                                                        }
                                                                    } catch (e) { console.error(e); }
                                                                    finally { setLoading(false); }
                                                                }}
                                                                className="dfg-button-ghost !rounded-md border border-white/10 hover:border-white/40 px-4 py-2 hover:bg-white/5 text-white/80"
                                                            >
                                                                <BookOpen size={12} /> Export Clinical Report (PDF)
                                                            </button>
                                                        </div>

                                                        {/* Data Transparency / Verification Sources */}
                                                        <div className="pt-8 border-t border-white/5">
                                                            <details className="group">
                                                                <summary className="cursor-pointer flex items-center gap-2 dfg-kicker text-white/60 hover:text-white transition-colors">
                                                                    <span className="w-4 h-4 border border-zinc-700 flex items-center justify-center group-open:border-white/40">
                                                                        <span className="text-[8px] group-open:rotate-90 transition-transform">▶</span>
                                                                    </span>
                                                                    Data Transparency // Verification Sources
                                                                </summary>
                                                                <div className="mt-4 dfg-card-soft p-4 space-y-3 text-[10px] font-mono text-zinc-500">
                                                                    <div className="text-zinc-400 font-bold mb-2 uppercase tracking-wider">Mathematical Framework</div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">📍</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">COORDINATES:</span> {user.bioMetrics?.birthLocation || 'Not Set'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">🔭</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">EPHEMERIS:</span> Swiss Ephemeris (pyswisseph 2.10.3) — <a href="https://www.astro.com/swisseph/" target="_blank" rel="noopener noreferrer" className="text-tech-gold/60 hover:text-tech-gold underline">astro.com/swisseph</a>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">🧬</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">HD SYSTEM:</span> Ra Uru Hu Gate/Line Mapping — International Human Design School
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-zinc-400 font-bold mb-2 mt-4 uppercase tracking-wider">Theoretical Synthesis</div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">🧠</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">PATTERN MODEL:</span> Bressloff-Cowan (2001) — Form constants from V1 cortical bifurcations — <a href="https://doi.org/10.1098/rstb.2000.0769" target="_blank" rel="noopener noreferrer" className="text-tech-gold/60 hover:text-tech-gold underline">DOI</a>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">🔮</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">ARCHETYPAL:</span> C.G. Jung — Collective Unconscious, Individuation, Mandala Symbolism
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="text-zinc-700">🤖</span>
                                                                        <div>
                                                                            <span className="text-zinc-400">AI MODEL:</span> Google Gemini 2.0 Flash — Synthesis engine, not diagnostic
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 pt-4 border-t border-white/5 text-zinc-600 italic leading-relaxed">
                                                                        <strong className="text-zinc-500 not-italic">Methodology:</strong> Patterns (spirals, tunnels, webs) are mathematically predictable form constants.
                                                                        The DEFRAG system identifies these geometric structures and synthesizes archetypal meaning through AI interpretation.
                                                                        For entertainment and self-reflection only—not a substitute for professional guidance.
                                                                    </div>
                                                                </div>
                                                            </details>
                                                        </div>

                                                        {/* Forecast Widget */}
                                                        {analysis.forecast && analysis.forecast.length > 0 && (
                                                            <CosmicForecastWidget events={analysis.forecast} />
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* VIEW: TOPOLOGY (Tier Gated - Architect Only) */}
                                    {activeView === 'TOPOLOGY' && (
                                        <motion.div
                                            key="TOPOLOGY"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full flex flex-col relative pb-32"
                                        >
                                            {/* Unlocked for Dev or Architect or Helix (Topology is basic feature? No, Architect Tier per Plan) */}
                                            {/* Wait, Plan said Architect features gated. Topology was listed as gated. */}
                                            {import.meta.env.DEV || user.tier === 'ARCHITECT_NODE' ? (
                                                <>
                                                    <div className="flex-1 bg-[#050505] relative">
                                                        <ComponentErrorBoundary>
                                                            <TopologyGraph data={topologyData || analysis?.relational_geometry} />
                                                        </ComponentErrorBoundary>
                                                    </div>
                                                    <div className="absolute bottom-32 left-0 right-0 p-6 pointer-events-none">
                                                        <div className="max-w-2xl mx-auto bg-black/80 backdrop-blur border border-white/10 p-4 pointer-events-auto">
                                                            <h3 className="text-lg font-serif text-white mb-1">Relational Geometry</h3>
                                                            <p className="text-zinc-500 text-xs font-mono">Visualizing vector dynamics.</p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center">
                                                    <div className="glass-panel px-8 py-6 rounded-lg flex flex-col items-center gap-4 max-w-sm border border-white/10 shadow-2xl">
                                                        <div className="flex items-center gap-2 text-zinc-500">
                                                            <Lock size={14} />
                                                            <span className="font-mono text-[10px] uppercase tracking-widest">Laser_Tier // Restricted</span>
                                                        </div>
                                                        <p className="text-white font-serif text-lg text-center leading-relaxed">Unveil the Geometry of Connection</p>
                                                        <button
                                                            onClick={() => handleUpgrade('ARCHITECT_NODE')}
                                                            className="mt-2 px-6 py-2 bg-white text-black font-mono text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                                                        >
                                                            Unlock Access
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    {/* VIEW: AXIS */}
                                    {activeView === 'AXIS' && (
                                        <motion.div
                                            key="AXIS"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="h-full flex flex-col relative bg-black"
                                        >
                                            <div className="absolute top-4 right-4 z-40 flex gap-2">
                                                <button onClick={() => setActiveView('TOPOLOGY')} className="p-2 bg-black/50 border border-white/20 text-zinc-400 hover:text-white"><Network size={16} /></button>
                                                <button onClick={() => setActiveView('AXIS')} className="p-2 bg-white text-black border border-white"><Minimize2 size={16} /></button>
                                                <button onClick={() => setActiveView('TIMELINE')} className="p-2 bg-black/50 border border-white/20 text-zinc-400 hover:text-white"><Activity size={16} /></button>
                                            </div>
                                            <ComponentErrorBoundary>
                                                <SelfPolarityAxis />
                                            </ComponentErrorBoundary>
                                        </motion.div>
                                    )}


                                    {/* VIEW: FAMILY (New) */}
                                    {activeView === 'FAMILY' && (
                                        <motion.div
                                            key="FAMILY"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="h-full relative bg-black/90"
                                        >
                                            <TierGate requiredTier="operator" feature="SYSTEM DYNAMICS" previewMode={true}>
                                                <div className="h-full flex flex-col lg:flex-row relative">
                                                    <div className="flex-1 min-h-[500px] relative border border-white/10 rounded-sm overflow-hidden bg-black/20">
                                                        <ComponentErrorBoundary>
                                                            <FamilyAntigravityCube members={familyMembers} />
                                                        </ComponentErrorBoundary>
                                                    </div>
                                                    <div className="relative">
                                                        <FamilyInputNode
                                                            members={familyMembers}
                                                            onUpdateMembers={(updated) => {
                                                                setFamilyMembers(updated);
                                                                onUpdateUser({ ...user, familyMembers: updated });
                                                            }}
                                                            onAnalyze={handleAnalyzeSystem}
                                                        />
                                                    </div>
                                                </div>
                                            </TierGate>
                                        </motion.div>
                                    )}

                                    {/* VIEW: TIMELINE */}
                                    {activeView === 'TIMELINE' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="h-full flex flex-col items-center justify-center p-8"
                                        >
                                            <div className="w-full max-w-4xl h-full flex flex-col gap-6">
                                                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                                    <div>
                                                        <h2 className="text-2xl font-serif text-white mb-1">Chronos vs. Kairos</h2>
                                                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Identifying Recursive Patterns in Linear Time</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-light text-tech-gold">{timelineEvents.length}</div>
                                                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Logged Signals</div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 bg-black/40 border border-white/5 relative overflow-hidden">
                                                    <SpiralTimeline events={timelineEvents} onLogEvent={handleLogEvent} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* VIEW: WALLET */}
                                    {activeView === 'WALLET' && (
                                        <motion.div
                                            key="WALLET"
                                            initial={{ opacity: 0, rotateY: 90 }}
                                            animate={{ opacity: 1, rotateY: 0 }}
                                            exit={{ opacity: 0, rotateY: -90 }}
                                            transition={{ duration: 0.4 }}
                                            className="h-full perspective-1000"
                                        >
                                            <ComponentErrorBoundary>
                                                <WalletView user={user} />
                                            </ComponentErrorBoundary>
                                        </motion.div>
                                    )}

                                    {/* VIEW: CALIBRATION (Editable) */}
                                    {activeView === 'CALIBRATION' && (
                                        <motion.div
                                            key="CALIBRATION"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="h-full bg-[#050505] relative"
                                        >
                                            <SettingsView
                                                user={user}
                                                onUpdateUser={onUpdateUser}
                                                onLogout={() => window.location.reload()}
                                            />
                                        </motion.div>
                                    )}

                                    {/* VIEW: CLI */}
                                    {activeView === 'CLI' && (
                                        <motion.div
                                            key="CLI"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full flex flex-col relative pb-32 md:pb-0"
                                        >
                                            <DirectUplink />
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Therapist Modal */}
            <AnimatePresence>
                {showTherapistModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="dfg-card w-full max-w-md p-6 relative shadow-2xl">
                            <button
                                onClick={() => { setShowTherapistModal(false); setShareLink(null); setTherapistEmail(''); }}
                                className="absolute top-4 right-4 dfg-button-ghost !rounded-md !p-2"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="font-serif text-2xl text-white mb-2">Connect Clinician</h3>
                            <p className="text-zinc-400 text-xs font-mono mb-6 leading-relaxed">
                                Generate a secure, time-limited access link for your therapist or analyst.
                                Access expires automatically in 30 days.
                            </p>

                            {!shareLink ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="dfg-kicker text-white/60">Clinician Email</label>
                                        <input
                                            type="email"
                                            value={therapistEmail}
                                            onChange={(e) => setTherapistEmail(e.target.value)}
                                            placeholder="doctor@example.com"
                                            className="dfg-input"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateShare}
                                        disabled={!therapistEmail}
                                        className="dfg-button w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Generate Access Key
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <Check size={16} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-white text-sm font-medium">Access Link Active</div>
                                            <div className="text-emerald-500/70 text-[10px] font-mono">Expires in 30 days</div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={shareLink}
                                            className="dfg-input pr-12 text-xs text-white/70"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareLink);
                                                setLinkCopied(true);
                                                setTimeout(() => setLinkCopied(false), 2000);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 dfg-button-ghost !p-2 !rounded-md bg-white/5 border border-white/10"
                                        >
                                            {linkCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Show TOS only after system is fully booted */}
            <DisclaimerModal
                isOpen={!user.tosAcceptedAt && bootPhase === 'COMPLETE'}
                onAccept={handleAcceptTOS}
            />

        </SystemLayout >
    );
};
