
import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AudioEngine
 * Generates an ambient audio landscape using native Web Audio API oscillators/noise
 * to avoid large external dependencies or asset loading issues.
 */

interface AudioEngineProps {
    activeView: string;
    muted?: boolean;
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ activeView, muted = false }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const oscRef = useRef<OscillatorNode | null>(null);
    const lfoRef = useRef<OscillatorNode | null>(null);

    // Safety check for user interaction requirements
    const [isInitialized, setIsInitialized] = useState(false);

    const initAudio = useCallback(() => {
        if (isInitialized || audioContextRef.current) return;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            // Master Gain
            const master = ctx.createGain();
            master.gain.value = 0.05; // Keep it very subtle
            master.connect(ctx.destination);
            masterGainRef.current = master;

            // Base Drone (Sine/Triangle mix)
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 55; // A1 (Deep)
            osc.connect(master);
            osc.start();
            oscRef.current = osc;

            // LFO for "Breathing" effect on frequency
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // Very slow cycle (10s)

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 2; // Modulate pitch by +/- 2Hz
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();
            lfoRef.current = lfo;

            setIsInitialized(true);
        } catch (e) {
            console.error("AudioEngine: Init failed", e);
        }
    }, [isInitialized]);

    // Handle View Changes -> Modulate Sound
    useEffect(() => {
        if (!audioContextRef.current || !oscRef.current || !masterGainRef.current || !isInitialized) return;

        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const osc = oscRef.current;
        const master = masterGainRef.current;

        // Smooth transition params
        const transitionTime = 2;

        if (activeView === 'TOPOLOGY') {
            // Deep, mysterious, louder
            osc.frequency.exponentialRampToValueAtTime(40, now + transitionTime); // Drop pitch
            master.gain.exponentialRampToValueAtTime(0.1, now + transitionTime); // Boost volume
            osc.type = 'triangle'; // Richer harmonics
        } else if (activeView === 'WALLET') {
            // Mechanical, precise
            osc.frequency.exponentialRampToValueAtTime(110, now + transitionTime); // A2
            master.gain.exponentialRampToValueAtTime(0.03, now + transitionTime);
            osc.type = 'sine';
        } else {
            // Daily / Default: Neutral drone
            osc.frequency.exponentialRampToValueAtTime(55, now + transitionTime);
            master.gain.exponentialRampToValueAtTime(0.05, now + transitionTime);
            osc.type = 'sine';
        }

    }, [activeView, isInitialized]);

    // Mute handling
    useEffect(() => {
        if (masterGainRef.current && audioContextRef.current) {
            const target = muted ? 0.0001 : (activeView === 'TOPOLOGY' ? 0.1 : 0.05);
            masterGainRef.current.gain.exponentialRampToValueAtTime(target, audioContextRef.current.currentTime + 0.5);
        }

        // Suspend/Resume context based on mute to save battery
        if (muted && audioContextRef.current?.state === 'running') {
            // We keep it running but silent for smooth fades, unless specific battery requirement
        }
    }, [muted, activeView]);

    // Handle cleanup
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Render an invisible "Start" trigger if not initialized?
    // Actually, usually app requires user interaction first.
    // We'll rely on a global "Start Audio" or just waiting for the first interaction to call init.

    // We add a listener to document for first click to init if not done
    useEffect(() => {
        const handleInteraction = () => {
            if (!isInitialized && !muted) {
                initAudio();
            }
        };

        window.addEventListener('click', handleInteraction, { once: true });
        return () => window.removeEventListener('click', handleInteraction);
    }, [isInitialized, muted, initAudio]);

    return null; // Invisible component
};
