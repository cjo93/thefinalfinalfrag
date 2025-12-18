
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
    console.error("No STRIPE_SECRET_KEY found in .env");
    process.exit(1);
}

const stripe = new Stripe(key, {
    // apiVersion: '2024-11-20.acacia', // Keep this, but if it fails we might need to remove it.
    // Actually, '2024-11-20.acacia' is very new. If installed version is older, TS will yell.
    // Let's perform a runtime check or just cast to any for the constructor options if needed.
    // Better yet, let's remove the apiVersion strict type check by casting the config or just removing it if not strictly needed for this simple list call.
} as any);

async function listPrices() {
    try {
        console.log("Fetching Products and Prices from Stripe...");
        const products = await stripe.products.list({ active: true, expand: ['data.default_price'] });

        if (products.data.length === 0) {
            console.log("No active products found.");
            return;
        }

        console.log("\n--- Active Products ---");
        products.data.forEach((p: any) => {
            const price = p.default_price;
            const priceId = price?.id || 'No Default Price';
            const amount = price?.unit_amount ? `$${price.unit_amount / 100}` : 'N/A';
            const interval = price?.recurring?.interval ? `/${price.recurring.interval}` : '';

            console.log(`Product: ${p.name}`);
            console.log(`  ID: ${p.id}`);
            console.log(`  Price ID: ${priceId} (${amount}${interval})`);
            console.log('---');
        });
    } catch (e) {
        console.error("Error fetching from Stripe:", e);
    }
}

listPrices();
