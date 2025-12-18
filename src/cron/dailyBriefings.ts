
import dotenv from 'dotenv';
dotenv.config(); // Ensure env vars are loaded

import * as admin from 'firebase-admin';
import { BriefingService } from '../services/BriefingService';
// import { db } from '../config/firebase'; // Assuming initialized or we init here

// Initialize Firebase if not already (Cron context)
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

const briefingService = new BriefingService();

async function runDailyBriefings() {
    console.log('Starting Daily Briefing Cron Job...');

    // 1. Fetch eligible users (Operator/Architect tier or subscribed)
    // Using simple query for now
    const snapshot = await db.collection('users')
        .where('tier', 'in', ['operator', 'architect']) // Only paid tiers? Or all? Prompt mentions "Daily Usage ~100 requests"
        .get();

    if (snapshot.empty) {
        console.log('No users found for briefing.');
        return;
    }

    console.log(`Found ${snapshot.size} users.`);

    for (const doc of snapshot.docs) {
        const user = doc.data();
        const userId = doc.id;

        try {
            console.log(`Processing briefing for ${userId}...`);
            await briefingService.generateDailyBriefing(userId, user);
            console.log(`Briefing sent to ${userId}.`);
        } catch (err) {
            console.error(`Failed to process ${userId}:`, err);
        }
    }

    console.log('Daily Briefing Job Completed.');
}

// Execute
runDailyBriefings().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
