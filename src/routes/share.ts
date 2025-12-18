
import { Router } from 'express';
import crypto from 'crypto';
import { collections } from '../services/firestore';

const router = Router();

// --- Crypto Helpers (Zero-Dep JWT) ---

const SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

const signPayload = (payload: any) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyPayload = (token: string) => {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) return null;

    const expectedSignature = crypto
        .createHmac('sha256', SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    return JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
};

// --- Routes ---

/**
 * POST /api/share/token
 * Generates a signed, stateless token containing the reading data.
 * Does NOT include PII (Name, Email).
 */
router.post('/token', async (req, res) => {
    try {
        const { userId, readingData } = req.body;

        // If userId is provided, we can fetch latest data from DB to ensure integrity
        // allow passing explicit readingData for flexibility
        let payload = { ...readingData };

        if (userId) {
            const userDoc = await collections.users.doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                // Extract only shareable data
                payload = {
                    gate: userData?.bioMetrics?.humanDesignType?.split(' ')[1] || 'Unknown',
                    headline: readingData?.headline || "System Analysis",
                    timestamp: new Date().toISOString()
                };
            }
        }

        const token = signPayload(payload);

        // Return the full shareable URL
        // In dev: http://localhost:3000/share?token=...
        // In prod: https://defrag.app/share?token=...
        const baseUrl = req.headers.origin || 'http://localhost:3000';
        const shareUrl = `${baseUrl}/?token=${token}`; // Direct App Link
        // The Preview URL points to the backend route we just made, which renders the OG tags
        // Assuming the API is mounted at same origin/api. If split, this needs the API base URL.
        // For this architecture, we assume relative path works or we construct it via req.protocol/host if needed.
        // But req.headers.host is reliable here.
        const apiUrl = `${req.protocol}://${req.get('host')}`;
        const previewUrl = `${apiUrl}/api/share/preview/${token}`;

        res.json({ token, shareUrl, previewUrl });

    } catch (error) {
        console.error('Share Token Error:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

/**
 * GET /api/share/read/:token
 * Decodes and verifies a token.
 */
router.get('/read/:token', (req, res) => {
    const { token } = req.params;
    const data = verifyPayload(token);

    if (!data) {
        return res.status(403).json({ error: 'Invalid or tampered token' });
    }

    res.json(data);
});

/**
 * GET /api/share/preview/:token
 * Returns a static HTML page with Open Graph tags for iMessage/Social unfurling,
 * then client-side redirects to the actual specific React app view.
 */
router.get('/preview/:token', (req, res) => {
    const { token } = req.params;
    const data = verifyPayload(token);

    // If invalid, just redirect to home
    if (!data) {
        return res.redirect('https://defrag.app');
    }

    // Basic sanitizer to prevent injection in meta tags
    const sanitize = (str: string) => str.replace(/["<>]/g, '');

    // Dynamic Metadata
    const title = `DEFRAG // ${sanitize(data.headline || 'System Artifact')}`;
    const description = `Verified Architecture: ${sanitize(data.gate || 'Unknown')} // ${data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'Now'}. Click to initialize visualizer.`;
    const image = data.image ? sanitize(data.image) : 'https://defrag.app/og-card.png';
    const appUrl = `https://defrag.app/?token=${token}`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>

            <!-- Open Graph / Facebook / iMessage -->
            <meta property="og:type" content="website">
            <meta property="og:url" content="${appUrl}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${image}">
            <meta property="og:site_name" content="DEFRAG_OS">

            <!-- Twitter -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${image}">

            <style>
                body { background: #000; color: #333; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .loader { text-align: center; }
            </style>
        </head>
        <body>
            <div class="loader">
                <p style="color: #666">INITIALIZING_UPLINK...</p>
            </div>
            <script>
                // Immediate Redirect
                window.location.href = "${appUrl}";
            </script>
        </body>
        </html>
    `;

    res.send(html);
});

export const shareRoutes = router;
