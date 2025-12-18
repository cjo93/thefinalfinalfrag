
import { collections } from './firestore';
import { UserGamificationState, calculateNextLevel } from '../types/gamification';

export const awardXP = async (userId: string, actionType: 'CALIBRATION' | 'INSIGHT' | 'COHERENCE_STREAK') => {
    const userRef = collections.users.doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return null;

    let gamification: UserGamificationState = userDoc.data()?.gamification || {
        xp: 0,
        level: 1,
        rank: 'INITIATE',
        streak: 0,
        lastActionTimestamp: 0
    };

    let xpGain = 0;
    const now = Date.now();

    // Logic for Streak
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const isConsecutive = (now - gamification.lastActionTimestamp) < (ONE_DAY * 1.5); // 36h buffer

    if (actionType === 'CALIBRATION') {
        xpGain = 50;
        if (isConsecutive) {
            gamification.streak += 1;
            xpGain += Math.min(gamification.streak * 10, 100); // Streak Bonus cap
        } else {
            gamification.streak = 1; // Reset
        }
    } else if (actionType === 'INSIGHT') {
        xpGain = 25;
    } else if (actionType === 'COHERENCE_STREAK') {
        xpGain = 100; // Big bonus for maintaining stability
    }

    gamification.xp += xpGain;
    gamification.lastActionTimestamp = now;

    // Recalculate Rank
    const { level, rank } = calculateNextLevel(gamification.xp);
    gamification.level = level;
    gamification.rank = rank as any;

    await userRef.update({ gamification });

    return {
        newXp: gamification.xp,
        gained: xpGain,
        rank: gamification.rank,
        streak: gamification.streak
    };
};
