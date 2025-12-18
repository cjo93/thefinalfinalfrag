
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
    apiVersion: '2024-11-20.acacia',
} as any);

async function initProducts() {
    try {
        console.log("Initializing DEFRAG Products in Stripe...");

        // 1. Operator Tier
        console.log("Creating/Checking 'Operator' Tier...");
        let operatorPriceId = '';

        // Search first to avoid duplicates (by name)
        const existingOperator = await stripe.products.search({ query: "name:'DEFRAG Operator' AND active:'true'" });

        if (existingOperator.data.length > 0) {
            console.log("Found existing 'DEFRAG Operator' product.");
            const p = existingOperator.data[0];
            if (typeof p.default_price === 'string') {
                operatorPriceId = p.default_price;
            } else if (p.default_price) {
                operatorPriceId = (p.default_price as any).id;
            }
        } else {
            console.log("Creating 'DEFRAG Operator' product...");
            const prod = await stripe.products.create({
                name: 'DEFRAG Operator',
                description: 'Daily Guidance & Protocol Access',
                default_price_data: {
                    currency: 'usd',
                    unit_amount: 1200, // $12.00
                    recurring: { interval: 'month' }
                }
            });
            operatorPriceId = prod.default_price as string;
        }
        console.log(`OPERATOR PRICE ID: ${operatorPriceId}`);


        // 2. Architect Tier
        console.log("Creating/Checking 'Architect' Tier...");
        let architectPriceId = '';

        const existingArchitect = await stripe.products.search({ query: "name:'DEFRAG Architect' AND active:'true'" });

        if (existingArchitect.data.length > 0) {
            console.log("Found existing 'DEFRAG Architect' product.");
            const p = existingArchitect.data[0];
            if (typeof p.default_price === 'string') {
                architectPriceId = p.default_price;
            } else if (p.default_price) {
                architectPriceId = (p.default_price as any).id;
            }
        } else {
            console.log("Creating 'DEFRAG Architect' product...");
            const prod = await stripe.products.create({
                name: 'DEFRAG Architect',
                description: 'Full Relational Topology & 3D Maps',
                default_price_data: {
                    currency: 'usd',
                    unit_amount: 4500, // $45.00
                    recurring: { interval: 'month' }
                }
            });
            architectPriceId = prod.default_price as string;
        }
        console.log(`ARCHITECT PRICE ID: ${architectPriceId}`);

        console.log("\n--- CONFIGURATION FOR .ENV ---");
        console.log(`STRIPE_PRICE_ID_OPERATOR=${operatorPriceId}`);
        console.log(`STRIPE_PRICE_ID_ARCHITECT=${architectPriceId}`);

    } catch (e) {
        console.error("Error initializing products:", e);
    }
}

initProducts();
