import { Agent, AgentContext } from "../framework/AgentBase";
import * as EdgeTTS from 'edge-tts-universal';

export class VoiceSynthesisAgent extends Agent {
    private defaultVoice: string;

    constructor(context: AgentContext) {
        super("VoiceSynthesisAgent", context);
        // "Christopher" is a calm, deep male voice (Neural)
        this.defaultVoice = 'en-US-ChristopherNeural';
    }

    /**
     * Synthesizes text to speech using Microsoft Edge Neural API (Unofficial/Free).
     * Returns a Buffer of audio data (MP3).
     */
    async synthesizeText(text: string, voiceId?: string): Promise<Buffer> {
        const selectedVoice = voiceId || this.defaultVoice;
        console.log(`[VoiceAgent] Synthesizing via Edge/Neural: "${text.substring(0, 50)}..." using ${selectedVoice}`);

        try {
            // 1. Generate Audio using Edge TTS
            // Signature: new EdgeTTS(text, voice, options)
            const tts = new EdgeTTS.EdgeTTS(text, selectedVoice);

            // 2. Synthesize
            const result = await tts.synthesize();

            if (result && result.audio) {
                // result.audio is likely a Blob (Node.js global Blob).
                // Convert to ArrayBuffer then Buffer.
                const arrayBuffer = await result.audio.arrayBuffer();
                return Buffer.from(arrayBuffer);
            } else {
                throw new Error("No audio data returned from Edge TTS");
            }

        } catch (error) {
            console.error("[VoiceAgent] Edge Synthesis failed:", error);
            // Fallback to minimal buffer or re-throw
            throw error;
        }
    }
}
