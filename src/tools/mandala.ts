import Replicate from "replicate";
import dotenv from 'dotenv';
dotenv.config();

// Ensure REPLICATE_API_TOKEN is set or handle gracefully
if (!process.env.REPLICATE_API_TOKEN) {
    console.warn("REPLICATE_API_TOKEN is not set.");
}

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || "missing_token",
});

export interface MandalaInput {
    userId: string;
    birthDate: string;      // ISO: 1993-07-26
    birthTime: string;      // 20:00:00
    birthLocation: string;  // "Upland, CA, USA"
}

export interface MandalaResult {
    imageUrl: string;
    modelVersion: string;
}

function buildMandalaPrompt(input: MandalaInput): string {
    return [
        "Generate a high-resolution monochrome radial mandala card.",
        "Style: DEFRAG OS, black continuum background, minimal, geometric.",
        `Birth ${input.birthDate} ${input.birthTime} at ${input.birthLocation}.`,
        "Emphasize: systemic integration, coherence, and architectural symmetry.",
    ].join(" ");
}

export async function generateMandalaCard(
    input: MandalaInput
): Promise<MandalaResult> {

    // T2-1: Remove Mocks - Enforce Real API
    if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error("REPLICATE_API_TOKEN is missing. Mock generation is disabled in v4.0.");
    }

    const prompt = buildMandalaPrompt(input);

    const model = "stability-ai/stable-diffusion-3.5-large";
    const version = "latest";

    try {
        const output = (await replicate.run(model, {
            input: {
                prompt,
                width: 1024,
                height: 1024,
                guidance_scale: 7,
                num_outputs: 1,
            },
        })) as string[] | null;

        if (!output || !output.length) {
            throw new Error("Mandala generation failed: no output URLs returned");
        }

        return {
            imageUrl: output[0],
            modelVersion: version,
        };
    } catch (error) {
        console.error("Replicate API Error:", error);
        throw error; // Fail hard if real API fails, no fallback mock.
    }
}
