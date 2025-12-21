/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
// Lazy Load Heavy Components
const HeroScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.HeroScene })));
const MemoryScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.MemoryScene })));
const TrustScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.TrustScene })));
const NeuralTopologyScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.NeuralTopologyScene })));
const EthosScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.EthosScene })));
const ManifestoScene = lazy(() => import('./components/QuantumScene').then(module => ({ default: module.ManifestoScene })));
const NeuralInterface = lazy(() => import('./components/NeuralInterface').then(module => ({ default: module.NeuralInterface })));

import { AuthModal, CheckoutModal } from './components/Auth';
import { ConceptVisualizer } from './components/ConceptVisualizer';
import { ShareView } from './components/ShareView';
import { ContentOverlay } from './components/ContentOverlay';
import { TermsContent } from './components/pages/TermsContent';
import { AboutContent } from './components/pages/AboutContent';
import { LogicContent } from './components/pages/LogicContent';
import { ContactContent } from './components/pages/ContactContent';
import { CircularProgress, DataGraph } from './components/Diagrams';
import { useAuth } from './hooks/useAuth';
import { Activity, Shield, GitBranch, ScanFace, LogOut, ChevronDown, Terminal, ArrowRight } from 'lucide-react';
import { MANIFESTO } from './src/content/manifesto';
import { SystemHeartbeat } from './components/SystemHeartbeat';
import { SoundManager } from './src/services/SoundManager';
import { haptics, HapticPatterns } from './src/services/haptics';
import { GlitchReveal } from './components/ui/GlitchReveal';
import { TierProvider } from './src/context/TierContext';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

// --- ERROR BOUNDARY ---
// --- ERROR BOUNDARY ---
interface SceneErrorBoundaryProps {
    children: React.ReactNode;
}
interface SceneErrorBoundaryState {
    hasError: boolean;
    error: unknown;
}

class SceneErrorBoundary extends React.Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
    state: SceneErrorBoundaryState = { hasError: false, error: null };
    constructor(props: SceneErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError(error: unknown) {
        return { hasError: true, error };
    }

    componentDidCatch(error: unknown, _errorInfo: unknown) {
        console.error("WebGL Error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/80 text-white font-mono text-xs p-4">
                    CANVAS CRASH: {(this.state.error as Error)?.message || "Unknown WebGL Error"}
                </div>
            );
        }
        // @ts-expect-error: Suppress children type check for ErrorBoundary (children is valid)
        return this.props.children;
    }
}

// --- MAIN APPLICATION ---

const App = () => {
    const { user, login, upgradeTier, isLoading, updateUser } = useAuth();
    const [isAuthOpen, setAuthOpen] = useState(false);
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);
    const [isTerminalOpen, setTerminalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<unknown | null>(null);
    const [shareToken, setShareToken] = useState<string | null>(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    });
    const [activePage, setActivePage] = useState<'TERMS' | 'ABOUT' | 'LOGIC' | 'CONTACT' | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const handleInitialize = () => {
        if (user) {
            setTerminalOpen(true);
        } else {
            setAuthOpen(true);
        }
    };

    // Audio Mode Switching
    useEffect(() => {
        if (isTerminalOpen) {
            SoundManager.enterFocusMode();
        } else {
            SoundManager.enterObserverMode();
        }
    }, [isTerminalOpen]);

    // Audio Initialization
    useEffect(() => {
        // Start Ambient (will be muted initially)
        // [User Request]: Keep defaulted to OFF until interaction.
        // SoundManager.playAmbient('AMB_DRONE_A');
    }, []);

    const handlePlanSelect = (plan: unknown) => {
        if (!user) {
            setAuthOpen(true);
            return;
        }
        setSelectedPlan(plan);
        setCheckoutOpen(true);
    };

    const sections = [
        {
            ...MANIFESTO.sections[0],
            component: MemoryScene,
            icon: Activity,
        },
        {
            ...MANIFESTO.sections[1],
            component: TrustScene,
            icon: Shield,
        },
        {
            ...MANIFESTO.sections[2],
            component: NeuralTopologyScene,
            icon: GitBranch,
        },
        {
            ...MANIFESTO.sections[3],
            component: EthosScene,
            icon: ScanFace,
        },
    ];

    return (
        <TierProvider>
            <div ref={containerRef} className="h-[100dvh] w-full overflow-y-scroll overflow-x-hidden bg-black text-white snap-y snap-mandatory scroll-smooth font-sans selection:bg-tech-gold selection:text-black">

                {/* Progress Bar */}
                <motion.div className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-50 mix-blend-difference" style={{ scaleX }} />

                {/* Header */}
                <header className="fixed top-0 left-0 w-full p-4 md:p-6 z-40 flex justify-between items-start pointer-events-none mix-blend-difference">
                    <div className="pointer-events-auto flex items-center gap-4">
                        <span className="font-mono font-bold text-lg md:text-xl tracking-tight text-white">DEFRAG_SYS</span>
                        <SystemHeartbeat />
                    </div>
                    <div className="pointer-events-auto flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setTerminalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-sm hover:bg-white hover:text-black transition-all group bg-black/50 backdrop-blur-md"
                                >
                                    <Terminal size={12} className="md:w-3.5 md:h-3.5" />
                                    <span className="font-mono text-[10px] uppercase tracking-widest">Neural Core</span>
                                </button>
                                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest hidden md:inline">ID: {user.name}</span>
                                <button onClick={() => window.location.reload()} className="hover:text-friction-red transition-colors"><LogOut size={16} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthOpen(true)}
                                className="font-mono text-[10px] uppercase tracking-widest hover:text-tech-gold transition-colors flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-sm border border-white/10"
                            >
                                [ Login ] <ArrowRight size={12} />
                            </button>
                        )}
                    </div>
                </header>

                {/* --- HERO SECTION --- */}
                <section className="h-[100dvh] w-full relative snap-start flex flex-col items-center justify-center overflow-hidden bg-black">
                    {/* Dark Background Scene */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <SceneErrorBoundary>
                            <Suspense fallback={null}>
                                <HeroScene />
                            </Suspense>
                        </SceneErrorBoundary>
                    </div>

                    {/* Geometric Wireframe Overlay */}
                    <motion.div
                        className="absolute inset-0 z-10 pointer-events-none"
                        style={{
                            rotateX: useSpring(0, { damping: 20 }),
                            rotateY: useSpring(0, { damping: 20 }),
                            perspective: 1000
                        }}
                        onMouseMove={(e) => {
                            // This would need to be in a parent or tracked via window
                        }}
                    >
                        {/* Vertical Axis */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>

                        {/* Diagonal Lines (Pyramid/Diamond) */}
                        <div className="absolute top-1/2 left-1/2 w-[70vmin] h-[70vmin] md:w-[60vmin] md:h-[60vmin] border border-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45 transform origin-center"></div>
                    </motion.div>

                    {/* Core UI Container */}
                    <div className="relative z-20 w-full px-4 flex flex-col items-center justify-center h-full">

                        {/* Title with staggered reveal */}
                        <motion.div
                            className="relative z-30 mb-8 flex items-baseline justify-center"
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-20 pointer-events-none mix-blend-screen" />
                            <div className="flex bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-[0_0_80px_rgba(255,255,255,0.15)]">
                                {['D', 'E', 'F', 'R', 'A', 'G'].map((char, i) => (
                                    <motion.span
                                        key={i}
                                        custom={i}
                                        variants={{
                                            hidden: { opacity: 0, y: 50, filter: 'blur(20px)' },
                                            visible: (i) => ({
                                                opacity: 1,
                                                y: 0,
                                                filter: 'blur(0px)',
                                                transition: { delay: 0.2 + i * 0.1, duration: 1.0, ease: [0.22, 1, 0.36, 1] }
                                            })
                                        }}
                                        className="text-[12vw] md:text-[8vw] font-black tracking-tighter font-sans leading-[0.9] py-4 scale-y-110 inline-block"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                            <motion.span
                                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                animate={{ opacity: 0.8, x: 0, filter: 'blur(0px)' }}
                                transition={{ delay: 1.0, duration: 1.2, ease: "easeOut" }}
                                className="text-[4vw] md:text-[2.5vw] text-zinc-600 font-thin align-top ml-2"
                            >
                                //OS
                            </motion.span>
                        </motion.div>

                        {/* System Meta Data with Stagger */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.4 }}
                            className="flex flex-col items-center gap-4 relative z-30"
                        >
                            <div className="flex items-center gap-4 text-[10px] md:text-xs font-mono text-zinc-500 tracking-widest uppercase">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></div>
                                    <GlitchReveal text="SYS_VER.2.4.1" />
                                </span>
                                <span className="w-px h-3 bg-zinc-800"></span>
                                <GlitchReveal text="STATUS: OPERATIONAL" />
                            </div>
                        </motion.div>

                        {/* Connection to top axis */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                            className="absolute -top-16 left-1/2 w-px h-16 bg-gradient-to-b from-transparent to-white/10 -translate-x-1/2 origin-bottom"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.6 }}
                            className="mt-8 mb-12 text-center"
                        >
                            <span className="font-mono text-xs md:text-sm text-zinc-300 tracking-[0.3em] uppercase block text-shadow-glow mb-2">
                                <GlitchReveal text="SPECTRAL ARCHITECTURE" />
                            </span>
                            <span className="font-mono text-[8px] md:text-[10px] text-zinc-500 tracking-[0.2em] block opacity-70">
                                <GlitchReveal text="COHERENT LIGHT • BIO-METRIC SYNTHESIS" />
                            </span>
                        </motion.div>

                        {/* Connection to bottom button */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 1, delay: 1.2, ease: "circOut" }}
                            className="absolute -bottom-16 left-1/2 w-px h-16 bg-gradient-to-t from-transparent to-white/10 -translate-x-1/2 origin-top"
                        />

                        {/* CTA Button with Hover Awe */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 2.0 }}
                            className="relative z-40"
                        >
                            <button
                                onClick={() => {
                                    handleInitialize();
                                    try {
                                        // System Unmute & Initial Thrum
                                        SoundManager.toggleMute(); // First interaction unmute
                                        SoundManager.play('SONIC_LOGO');
                                        haptics.trigger(HapticPatterns.SOLID);
                                    } catch (e) {
                                        console.warn("Audio/Haptic Init Failed", e);
                                    }
                                }}
                                onMouseEnter={() => {
                                    try {
                                        SoundManager.play('UI_HOVER');
                                        haptics.trigger(HapticPatterns.SOFT);
                                    } catch (e) { /* ignore hover error */ }
                                }}
                                className="glass-button px-12 py-5 md:px-16 md:py-6 text-xs md:text-sm tracking-[0.3em] font-mono hover:text-white group relative z-30 transition-all duration-500 ease-out hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {user ? "ENTER INTERFACE" : "INITIALIZE SYSTEM"}
                                </span>
                                {/* Inner glow effect */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg blur-xl" />
                            </button>
                            <div className="mt-6 text-center">
                                <p className="font-serif italic text-zinc-500 text-xs tracking-wide opacity-60">"The noise is deafening. Find your signal."</p>
                            </div>
                        </motion.div>


                    </div>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-30 pointer-events-none">
                        <ChevronDown size={24} className="text-zinc-600" />
                    </div>
                </section>

                {/* --- CONTENT SECTIONS --- */}
                {
                    sections.map((section, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <section key={section.id} id={section.id} className="h-[100dvh] w-full relative snap-start flex items-center justify-center border-t border-white/10 bg-black overflow-hidden group">
                                {/* Background Scene */}
                                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none transition-opacity duration-1000 group-hover:opacity-100">
                                    <SceneErrorBoundary>
                                        <Suspense fallback={null}>
                                            <section.component />
                                        </Suspense>
                                    </SceneErrorBoundary>
                                </div>

                                {/* Wireframe Accents */}
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className={`absolute top-0 bottom-0 ${isEven ? 'left-12' : 'right-12'} w-px bg-white/5 hidden md:block`}></div>
                                    <div className={`absolute ${isEven ? 'top-24 left-0' : 'bottom-24 right-0'} w-24 h-px bg-white/10`}></div>
                                </div>

                                <div className="relative z-20 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full pointer-events-none">
                                    {/* Visual Anchor */}
                                    <div className={`hidden md:flex justify-center items-center h-full order-1 ${isEven ? '' : 'md:order-2'}`}>
                                        {section.id === 'memory' && (
                                            <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                <div className="absolute inset-0 border-t border-white/20 rounded-full animate-spin-slow"></div>
                                                <ConceptVisualizer type="SCATTER" />
                                                <div className="absolute -bottom-8 font-mono text-[10px] text-zinc-500 tracking-widest">{section.visualLabel}</div>
                                            </div>
                                        )}
                                        {section.id === 'trust' && (
                                            <div className="relative">
                                                <CircularProgress value={78} label="REFRACTION" size={240} color="#ffffff" />
                                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 font-mono text-[10px] text-zinc-500 tracking-widest whitespace-nowrap">{section.visualLabel}</div>
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/40"></div>
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/40"></div>
                                            </div>
                                        )}
                                        {section.id === 'neural' && (
                                            <div className="w-full max-w-sm aspect-video border border-white/10 bg-black/40 backdrop-blur-md p-6 relative">
                                                <DataGraph />
                                                <div className="absolute top-0 left-0 bg-white/10 px-2 py-1 text-[8px] font-mono uppercase text-white tracking-widest">Waveform_Interference</div>
                                                <div className="absolute -bottom-8 left-0 font-mono text-[10px] text-zinc-500 tracking-widest">{section.visualLabel}</div>
                                            </div>
                                        )}
                                        {section.id === 'ethos' && (
                                            <div className="relative w-80 h-80 flex items-center justify-center">
                                                <ConceptVisualizer type="SYNTHESIS" />
                                                <div className="absolute -bottom-12 font-mono text-[10px] text-zinc-500 tracking-widest">{section.visualLabel}</div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Mobile Visual for Synthesis (since it was hidden) */}
                                    {section.id === 'ethos' && (
                                        <div className="md:hidden flex justify-center items-center py-12 order-1">
                                            <div className="relative scale-75">
                                                <ConceptVisualizer type="SYNTHESIS" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Side */}
                                    <div className={`flex flex-col justify-center h-full pointer-events-auto z-30 ${isEven ? 'order-2 pl-0 md:pl-12 text-left' : 'order-2 md:order-1 pr-0 md:pr-12 text-left md:text-right items-start md:items-end'} ${section.id === 'ethos' ? 'col-span-1 md:col-span-2 items-center text-center' : ''} relative`}>

                                        {/* Mobile Gradient Backdrop for Legibility */}
                                        <div className="absolute -inset-8 bg-gradient-to-b from-black/0 via-black/80 to-black/0 md:hidden z-[-1] blur-xl"></div>

                                        {section.id !== 'ethos' && (
                                            <div className={`flex items-center gap-4 mb-6 ${isEven ? '' : 'flex-row-reverse'}`}>
                                                <span className="font-mono text-tech-gold/80 text-[10px] tracking-widest uppercase border border-tech-gold/30 px-2 py-1">
                                                    {section.stage}
                                                </span>
                                                <div className="h-px w-8 md:w-12 bg-white/20"></div>
                                                <span className="font-mono text-zinc-500 text-[9px] md:text-[10px] tracking-[0.2em] uppercase">{section.descriptor}</span>
                                            </div>
                                        )}

                                        {section.id === 'ethos' && (
                                            <div className="flex items-center gap-4 mb-8 pointer-events-auto">
                                                <span className="font-mono text-white/80 text-[10px] tracking-widest uppercase border border-white/20 bg-white/5 px-2 py-1">
                                                    {section.stage}
                                                </span>
                                                <span className="font-mono text-zinc-500 text-[10px] tracking-[0.2em] uppercase">{section.descriptor}</span>
                                            </div>
                                        )}

                                        <h2 className={`text-4xl md:text-8xl font-sans font-bold text-white mb-8 tracking-tighter leading-[0.9] mix-blend-normal md:mix-blend-screen ${section.id === 'ethos' ? 'md:text-9xl drop-shadow-2xl' : ''} drop-shadow-md md:drop-shadow-none`}>
                                            <GlitchReveal text={section.headline} isActive={true} />
                                        </h2>

                                        {section.id === 'ethos' && (<div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mb-10"></div>)}

                                        {/* Mobile: Smaller Text, More Leading */}
                                        <p className={`font-sans font-light text-zinc-300 text-sm md:text-lg leading-relaxed max-w-sm md:max-w-md mb-8 md:mb-10 ${isEven ? 'border-l pl-4 md:pl-6' : 'md:border-r border-l md:border-l-0 pl-4 md:pl-0 md:pr-6'} border-white/20 ${section.id === 'ethos' ? 'border-none max-w-xs md:max-w-2xl md:text-xl mx-auto' : ''}`}>
                                            {section.body}
                                        </p>

                                        <button className={`flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-white hover:text-tech-gold transition-colors group w-max ${!isEven && section.id !== 'ethos' ? 'flex-row-reverse' : ''} ${section.id === 'ethos' ? 'bg-white text-black px-8 py-4 hover:bg-zinc-200' : ''}`}>
                                            {section.id !== 'ethos' && (
                                                <>
                                                    <section.icon size={16} className="text-zinc-500 group-hover:text-tech-gold transition-colors" />
                                                    <span>{section.buttonText}</span>
                                                    <ArrowRight size={12} className={`opacity-0 group-hover:opacity-100 transition-all ${isEven ? '-translate-x-2 group-hover:translate-x-0' : 'translate-x-2 group-hover:translate-x-0'}`} />
                                                </>
                                            )}
                                            {section.id === 'ethos' && (
                                                <>
                                                    <ScanFace size={18} />
                                                    <span>{section.buttonText}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        );
                    })
                }

                {/* --- PRICING --- */}
                <section className="min-h-[100dvh] w-full relative snap-start flex flex-col items-center justify-center py-24 md:py-20 bg-zinc-900">
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <SceneErrorBoundary>
                            <Suspense fallback={null}>
                                <ManifestoScene />
                            </Suspense>
                        </SceneErrorBoundary>
                    </div>

                    <div className="relative z-10 max-w-6xl w-full px-6">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-6xl font-mono font-bold tracking-tighter mb-4 uppercase">Join the Protocol</h2>
                            <p className="font-mono text-zinc-500 text-[10px] md:text-xs uppercase tracking-widest">Select your level of clarity</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                            {MANIFESTO.pricing.map((plan) => (
                                <div
                                    key={plan.name}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select ${plan.name} plan - $${plan.price} per month`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handlePlanSelect(plan);
                                        }
                                    }}
                                    onClick={() => handlePlanSelect(plan)}
                                    className={`
                            relative p-6 md:p-8 border cursor-pointer transition-all duration-300 group flex flex-col h-full
                            focus-visible:ring-2 focus-visible:ring-tech-gold focus-visible:outline-none
                            ${plan.recommended
                                            ? 'bg-white/5 border-tech-gold/50 hover:bg-white/10'
                                            : 'bg-black/50 border-white/10 hover:border-white/30'
                                        }
                        `}
                                >
                                    {plan.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tech-gold text-black px-3 py-1 text-[9px] font-mono uppercase tracking-widest">
                                            Recommended
                                        </div>
                                    )}
                                    <h3 className="text-xl font-serif mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-light">${plan.price}</span>
                                        <span className="text-zinc-500 text-xs">/mo</span>
                                    </div>
                                    <p className="text-xs text-zinc-300 mb-2 leading-relaxed italic">{plan.emotionalDesc}</p>
                                    <p className="text-[10px] text-zinc-500 mb-6 leading-relaxed">{plan.technicalDesc}</p>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                                                <div className={`w-1 h-1 rounded-full ${plan.recommended ? 'bg-tech-gold' : 'bg-zinc-600'}`}></div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={`
                            w-full py-3 text-center text-[10px] font-mono uppercase tracking-widest border mt-auto transition-colors
                            ${plan.recommended
                                            ? 'bg-tech-gold text-black border-tech-gold'
                                            : 'bg-transparent border-white/20 text-zinc-400 group-hover:border-white/50 group-hover:text-white'
                                        }
                        `}>
                                        Initialize {plan.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <footer className="w-full text-center py-8 md:py-12 border-t border-white/5 mt-auto relative z-10 bg-black pb-safe">
                        <p className="font-mono font-bold tracking-tight text-xl md:text-2xl opacity-30 mb-4">DEFRAG</p>

                        <div className="flex justify-center gap-6 font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-4">
                            <button onClick={() => setActivePage('ABOUT')} className="hover:text-white transition-colors">About</button>
                            <button onClick={() => setActivePage('LOGIC')} className="hover:text-white transition-colors">Logic Core</button>
                            <button onClick={() => setActivePage('TERMS')} className="hover:text-white transition-colors">Terms & Privacy</button>
                            <button onClick={() => setActivePage('CONTACT')} className="hover:text-white transition-colors">Contact</button>
                        </div>
                    </footer>
                </section>


                {/* --- MODALS --- */}
                <PwaInstallPrompt />
                <AuthModal
                    isOpen={isAuthOpen}
                    onClose={() => setAuthOpen(false)}
                    onLogin={login}
                    isLoading={isLoading}
                />

                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    plan={selectedPlan}
                    onConfirm={async () => {
                        const tierMap: Record<string, 'HELIX_PROTOCOL' | 'ARCHITECT_NODE'> = {
                            'Operator': 'HELIX_PROTOCOL',
                            'Architect': 'ARCHITECT_NODE'
                        };
                        const tier = tierMap[selectedPlan.name] || 'HELIX_PROTOCOL';
                        await upgradeTier(tier);
                        setCheckoutOpen(false);
                    }}
                    isLoading={isLoading}
                />

                {/* Content Overlays */}
                <AnimatePresence>
                    {activePage && (
                        <ContentOverlay
                            title={activePage === 'TERMS' ? 'Terms of Service' : activePage === 'ABOUT' ? 'Mission & Team' : activePage === 'LOGIC' ? 'Logic Core' : 'Contact Core'}
                            subtitle={activePage === 'TERMS' ? 'Legal & Privacy Protocol' : activePage === 'ABOUT' ? 'Defragmenting the Soul' : activePage === 'LOGIC' ? 'Physics & Math Architecture' : 'Secure Transmission Line'}
                            icon={activePage}
                            onClose={() => setActivePage(null)}
                        >
                            {activePage === 'TERMS' && <TermsContent />}
                            {activePage === 'ABOUT' && <AboutContent />}
                            {activePage === 'LOGIC' && <LogicContent />}
                            {activePage === 'CONTACT' && <ContactContent />}
                        </ContentOverlay>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isTerminalOpen && user && (
                        <Suspense fallback={<div className="fixed inset-0 bg-black z-50 flex items-center justify-center font-mono text-xs text-white">LOADING_NEURAL_UPLINK...</div>}>
                            <NeuralInterface
                                user={user}
                                onClose={() => setTerminalOpen(false)}
                                onUpdateUser={updateUser}
                            />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* Share Overlay */}
                {
                    shareToken && (
                        <SceneErrorBoundary>
                            <ShareView
                                token={shareToken}
                                onClose={() => {
                                    setShareToken(null);
                                    window.history.replaceState({}, document.title, window.location.pathname);
                                }}
                            />
                        </SceneErrorBoundary>
                    )
                }

            </div >
        </TierProvider >
    );
};

export default App;