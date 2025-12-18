import { Howl, Howler } from 'howler';

type SoundType = 'UI' | 'AMBIENT' | 'SFX';

interface SoundConfig {
    id: string;
    src: string;
    volume: number;
    loop?: boolean;
    type: SoundType;
}

const SOUND_MANIFEST: SoundConfig[] = [
    { id: 'UI_CLICK', src: '/sounds/click.mp3', volume: 0.5, type: 'UI' },
    { id: 'UI_HOVER', src: '/sounds/hover.mp3', volume: 0.2, type: 'UI' },
    { id: 'SFX_LEVEL_UP', src: '/sounds/level_up.mp3', volume: 0.8, type: 'SFX' },
    { id: 'AMB_DRONE_A', src: '/sounds/drone_a.mp3', volume: 0.3, loop: true, type: 'AMBIENT' }, // Observer
    { id: 'AMB_DRONE_B', src: '/sounds/drone_b.mp3', volume: 0.3, loop: true, type: 'AMBIENT' }, // Focus/Operator
];

class SoundManagerService {
    private sounds: Map<string, Howl> = new Map();
    private isMuted: boolean = true;
    private activeAmbient: string | null = null;
    private synthContext: AudioContext | null = null;

    constructor() {
        this.initialize();
        if (typeof window !== 'undefined') {
            window.addEventListener('click', () => this.initSynth(), { once: true });
        }
    }

    private initSynth() {
        if (!this.synthContext) {
            this.synthContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private initialize() {
        SOUND_MANIFEST.forEach(config => {
            const sound = new Howl({
                src: [config.src],
                volume: config.volume,
                loop: config.loop || false,
                preload: true,
                onloaderror: (_id, _err) => {
                    // Silent fail is okay, we fall back to synth
                }
            });
            this.sounds.set(config.id, sound);
        });
    }

    private playSynth(id: string) {
        if (!this.synthContext) this.initSynth();
        const ctx = this.synthContext!;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (id) {
            case 'UI_CLICK':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'UI_HOVER':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'SFX_LEVEL_UP':
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554, now + 0.1);
                osc.frequency.setValueAtTime(659, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'BOOT_KEYSTROKE':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
                break;
            case 'BOOT_SUCCESS':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'SONIC_LOGO':
                // Deep, Cinematic Thrum (The 'Defrag' Sonic Signature)
                // Fundamental
                osc.type = 'sine';
                osc.frequency.setValueAtTime(55, now); // Low G1
                osc.frequency.exponentialRampToValueAtTime(48.99, now + 2.0); // Drift to G1
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.5, now + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

                // Texture (Higher Overtone)
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(110, now); // Low G2
                osc2.frequency.exponentialRampToValueAtTime(111, now + 1.5); // Slight detune
                gain2.gain.setValueAtTime(0, now);
                gain2.gain.linearRampToValueAtTime(0.1, now + 0.8);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

                // Filter for 'Spectral' feel
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.frequency.exponentialRampToValueAtTime(200, now + 2.0);

                osc2.connect(gain2);
                gain2.connect(filter);
                filter.connect(ctx.destination);

                osc.start(now);
                osc2.start(now);
                osc.stop(now + 3.0);
                osc2.stop(now + 3.0);
                break;
        }
    }

    public play(id: string) {
        if (this.isMuted) return;

        const sound = this.sounds.get(id);
        if (sound && sound.state() === 'loaded') {
            const config = SOUND_MANIFEST.find(s => s.id === id);
            if (config?.type === 'AMBIENT') {
                this.playAmbient(id);
            } else {
                sound.play();
            }
        } else {
            this.playSynth(id);
        }
    }

    public playAmbient(id: string) {
        if (this.activeAmbient === id) return;

        if (this.activeAmbient) {
            const current = this.sounds.get(this.activeAmbient);
            if (current && current.state() === 'loaded') current.fade(current.volume(), 0, 1000);
        }

        const next = this.sounds.get(id);
        if (next && next.state() === 'loaded') {
            next.volume(0);
            next.play();
            const targetVol = SOUND_MANIFEST.find(s => s.id === id)?.volume || 0.3;
            next.fade(0, targetVol, 1000);
            this.activeAmbient = id;
        }
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        Howler.mute(this.isMuted);

        if (!this.isMuted && this.synthContext?.state === 'suspended') {
            this.synthContext.resume();
        }

        if (!this.isMuted && this.activeAmbient) {
            const sound = this.sounds.get(this.activeAmbient);
            if (sound && !sound.playing()) sound.play();
        }
    }

    public setVolume(vol: number) {
        Howler.volume(vol);
    }

    public enterFocusMode() {
        this.playAmbient('AMB_DRONE_B');
    }

    public enterObserverMode() {
        this.playAmbient('AMB_DRONE_A');
    }
}

export const SoundManager = new SoundManagerService();
