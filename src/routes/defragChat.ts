import { Router, Request, Response } from 'express';
import fetch from 'node-fetch'; // Standard fetch or install cross-fetch if needed (using node-fetch from package.json)
import { z } from 'zod';
import { COGNITIVE_OS_SYSTEM_PROMPT } from '../agents/prompts/structural';

const router = Router();

// Validation Schema
const ChatSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1)
    })).min(1),
    model: z.string().optional().default('llama-3.1-sonar-small-128k-online') // Default Perplexity Model
});

router.post('/', async (req: Request, res: Response) => {
    // 1. Validation
    const validation = ChatSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            error: 'Invalid Request',
            details: validation.error.issues
        });
    }

    const { messages, model } = validation.data;
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        console.error('Missing PERPLEXITY_API_KEY');
        return res.status(500).json({ error: 'Service Misconfiguration' });
    }

    // 2. Prepare Headers & Body
    const systemMessage = { role: 'system', content: COGNITIVE_OS_SYSTEM_PROMPT };
    const apiMessages = [systemMessage, ...messages];

    try {
        // 3. Upstream Request
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: apiMessages,
                stream: true // ENABLE STREAMING
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API Error:', errorText);
            return res.status(response.status).json({ error: 'Upstream Error', details: errorText });
        }

        // 4. Stream Response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (response.body) {
            response.body.pipe(res);

            response.body.on('error', (err) => {
                console.error('Stream Error:', err);
                res.end();
            });

            res.on('close', () => {
                // response.body.destroy(); // Cleanup if supported
            });
        } else {
            throw new Error("No response body received");
        }

    } catch (error: any) {
        console.error('Chat Proxy Handler Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.end();
        }
    }
});

export default router;
