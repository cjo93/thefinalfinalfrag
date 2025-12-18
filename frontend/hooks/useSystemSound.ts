import { useRef } from 'react';

// Better approach: Use Web Audio API for a synthesized sci-fi sound
export const useSystemSound = () => {
    const audioContext = useRef<AudioContext | null>(null);

    const playBootSound = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sci-fi "Power Up" sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    };

    const playClickSound = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Short, crisp high-pitch blip
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    return { playBootSound, playClickSound };
};
