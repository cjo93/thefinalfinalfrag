
export interface UserGamificationState {
    xp: number;
    level: number;
    rank: 'INITIATE' | 'OBSERVER' | 'ARCHITECT' | 'SYSTEM_WEAVER';
    streak: number;
    lastActionTimestamp: number;
}

export const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, rank: 'INITIATE' },
    { level: 2, xp: 100, rank: 'OBSERVER' },
    { level: 3, xp: 500, rank: 'ARCHITECT' },
    { level: 4, xp: 2000, rank: 'SYSTEM_WEAVER' }
];

export const calculateNextLevel = (currentXp: number) => {
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel = LEVEL_THRESHOLDS[1];

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (currentXp >= LEVEL_THRESHOLDS[i].xp) {
            currentLevel = LEVEL_THRESHOLDS[i];
            nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
        }
    }

    return {
        level: currentLevel.level,
        rank: currentLevel.rank,
        xpForNext: nextLevel ? nextLevel.xp - currentXp : 0,
        progress: nextLevel ? (currentXp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp) : 1
    };
};
