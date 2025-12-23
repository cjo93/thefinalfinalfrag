/**
 * Minimal post-deploy smoke script:
 * - hits /health
 * - calls mandala preview endpoint
 * - requests voice synth preview
 * - attempts Stripe test checkout via API (if configured)
 */
const fetch = global.fetch || require('node-fetch');

(async () => {
  const base = process.env.DEPLOY_BASE_URL || 'https://api.defrag.app';
  try {
    const health = await fetch(`${base}/health`);
    console.log('health', health.status);
    if (health.status !== 200) throw new Error('health failed');

    // Mandala quick gen (non-blocking)
    const mandala = await fetch(`${base}/api/mandala/preview`, { method: 'GET' });
    console.log('mandala preview', mandala.status);

    // Voice synth check
    const voice = await fetch(`${base}/api/voice/preview`, { method: 'GET' });
    console.log('voice preview', voice.status);

    // If stripe test allowed, call checkout creation (requires test key)
    if (process.env.STRIPE_SECRET_KEY) {
      const checkout = await fetch(`${base}/api/payments/test-checkout`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ test: true })});
      console.log('checkout', checkout.status);
    }

    console.log('Post-deploy smoke: OK');
    process.exit(0);
  } catch (e) {
    console.error('Post-deploy smoke FAILED', e);
    process.exit(2);
  }
})();

