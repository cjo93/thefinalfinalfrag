
import { Howl } from 'howler';

// Default to a professional sounding Web Speech voice if API key is missing
const PREFERRED_WEB_VOICES = [
    'Google US English',
    'Samantha',
    'Daniel',
    'Microsoft David'
];

// ElevenLabs Configuration
// Edge TTS Neural Voice (US Male)
const DEFAULT_VOICE_ID = 'en-US-ChristopherNeural';

export class VoiceAgent {
    private static instance: VoiceAgent;
    private synth: SpeechSynthesis;
    private currentHowl: Howl | null = null;
    private volume: number = 0.5;
    private muted: boolean = false;

    private constructor() {
        this.synth = window.speechSynthesis;
    }

    public static getInstance(): VoiceAgent {
        if (!VoiceAgent.instance) {
            VoiceAgent.instance = new VoiceAgent();
        }
        return VoiceAgent.instance;
    }

    public setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.currentHowl) {
            this.currentHowl.volume(this.volume);
        }
        // Web Speech doesn't support dynamic volume change mid-speech easily,
        // but it applies to next utterance.
    }

    public setMute(mute: boolean) {
        this.muted = mute;
        if (this.currentHowl) {
            this.currentHowl.mute(mute);
        }
        if (mute) {
            this.synth.cancel();
        }
    }

    public stop() {
        this.synth.cancel();
        if (this.currentHowl) {
            this.currentHowl.stop();
            this.currentHowl = null;
        }
    }

    public async speak(text: string): Promise<void> {
        if (this.muted) return;
        this.stop();

        try {
            await this.speakSecure(text);
        } catch (e) {
            console.warn("Secure Voice failed, falling back to Web Speech", e);
            this.speakWeb(text);
        }
    }

    private async speakSecure(text: string): Promise<void> {
        // [SECURE] Call Backend Proxy
        const response = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voiceId: DEFAULT_VOICE_ID })
        });

        if (!response.ok) throw new Error("Voice API Error");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            this.currentHowl = new Howl({
                src: [url],
                format: ['mp3'],
                html5: true,
                volume: this.volume,
                onend: () => {
                    URL.revokeObjectURL(url);
                    this.currentHowl = null;
                    resolve();
                },
                onloaderror: (id, err) => {
                    URL.revokeObjectURL(url);
                    reject(err);
                }
            });
            this.currentHowl.play();
        });
    }

    private speakWeb(text: string): void {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 0.9; // Slightly slower for gravity
        utterance.pitch = 0.95; // Slightly deeper

        // Select Voice
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => PREFERRED_WEB_VOICES.some(pw => v.name.includes(pw)));
        if (preferredVoice) utterance.voice = preferredVoice;

        this.synth.speak(utterance);
    }
}
