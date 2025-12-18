import { db, collections } from '../services/firestore';
import { Timestamp } from '@google-cloud/firestore';

// --- Types ---
interface HRVReading {
    userId: string;
    rmssd_ms: number;
    source: 'oura' | 'apple' | 'whoop' | 'manual';
    timestamp?: Timestamp;
}

interface HRVClassification {
    classification: 'excellent_recovery' | 'baseline' | 'mild_stress' | 'significant_stress';
    percentile: number;
    confidence: number;
}

// --- Tool: ingestHRVReading ---
export const ingestHRVReading = async (input: HRVReading) => {
    const { userId, rmssd_ms, source } = input;

    if (rmssd_ms < 0 || rmssd_ms > 200) {
        throw new Error('HRVValidationError: rmssd_ms must be between 0 and 200');
    }

    // Get user baseline
    const userDoc = await collections.users.doc(userId).get();
    if (!userDoc.exists) {
        throw new Error('User not found');
    }
    const userData = userDoc.data();
    const baseline = userData?.baseline_rmssd || 50; // Default if missing

    // Classify
    const classificationResult = await classifyHRVState({ rmssd_ms, baseline_rmssd: baseline });

    // Store
    const stored = await storeReading({
        userId,
        reading_data: { rmssd_ms, source, timestamp: Timestamp.now() },
        classification: classificationResult
    });

    // Track Cost
    await trackCost({ operation: 'hrv_ingest', estimated_cost: 0.001 });

  // Trigger Briefing
  /* const briefing = */ await triggerBriefingGeneration({ userId, classification: classificationResult.classification });

    return {
        success: true,
        classification: classificationResult.classification,
        stored_at: stored.reading_id
    };
};

// --- Tool: classifyHRVState ---
export const classifyHRVState = async (input: { rmssd_ms: number; baseline_rmssd: number }) => {
    const { rmssd_ms, baseline_rmssd } = input;
    const percentage = (rmssd_ms / baseline_rmssd) * 100;

    let classification: HRVClassification['classification'];
    if (percentage >= 100) classification = 'excellent_recovery';
    else if (percentage >= 70) classification = 'baseline';
    else if (percentage >= 40) classification = 'mild_stress';
    else classification = 'significant_stress';

    return {
        classification,
        percentile: Math.round(percentage),
        confidence: 1.0 // Deterministic logic
    };
};

// --- Tool: storeReading ---
export const storeReading = async (input: {
    userId: string;
    reading_data: any;
    classification: HRVClassification
}) => {
    const { userId, reading_data, classification } = input;
    const timestamp = reading_data.timestamp || Timestamp.now();

    // Create safe ID from timestamp
    const readingId = timestamp.toMillis().toString();

    const docRef = collections.users.doc(userId).collection('hrv_readings').doc(readingId);

    await docRef.set({
        rmssd_ms: reading_data.rmssd_ms,
        timestamp: timestamp,
        classification: classification.classification,
        source: reading_data.source,
        percentile: classification.percentile,
        created_at: Timestamp.now(),
    });

    return { success: true, reading_id: readingId };
};

// --- Tool: trackCost ---
export const trackCost = async (input: { operation: string; estimated_cost: number }) => {
    // Simple fire-and-forget log
    collections.costTracking.add({
        operation: input.operation,
        estimated_cost_usd: input.estimated_cost,
        timestamp: Timestamp.now(),
    }).catch(console.error);

    return { success: true };
};

// --- Tool: triggerBriefingGeneration ---
export const triggerBriefingGeneration = async (input: { userId: string; classification: string }) => {
    const { userId } = input;

    // Check subscription status
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data();

    if (userData?.subscription_status !== 'active') {
        return { success: false, reason: 'subscription_inactive' };
    }

    // In a real system, this might push to a queue (Cloud Tasks / PubSub)
    // For the prompt's purpose, we'll pretend we enqueued it.
    console.log(`Enqueuing briefing generation for ${userId}`);

    return { success: true, queued_at: Timestamp.now() };
};
