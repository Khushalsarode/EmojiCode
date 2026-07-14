export type LevelTier = {
    level: number;
    xpStart: number;
    xpEnd: number | null;
    label: string;
    rewards: string[];
};
export declare const LEVEL_TIERS: LevelTier[];
export declare const computeLevel: (xp: number) => LevelTier;
export declare const getTierByLevel: (level: number) => LevelTier;
export declare const baseDailySubmissionLimit: (level: number) => number;
export declare const flairColorForLevel: (level: number) => string;
export declare const XP_REWARDS: {
    readonly CORRECT_GUESS: 10;
    readonly FIRST_CRACK_BONUS: 15;
    readonly CIPHER_PUBLISHED: 20;
    readonly PER_UPVOTE: 2;
    readonly MAX_UPVOTE_XP_PER_POST: 100;
};
