export type Emoji = string;
export type CipherCategory = 'Movie' | 'Show' | 'Game' | 'Book' | 'Sub-Lore' | 'Other';
export type GuessDistributionEntry = {
    guessTextCensored: string;
    count: number;
    isCorrectAnswer: boolean;
};
export type CipherPost = {
    postId: string;
    submitterUserId: string;
    submitterUsername: string;
    submitterLabel: string;
    emojis: Emoji[];
    category: CipherCategory;
    publishedAt: number;
    decoderCount: number;
    firstCrackUsername: string | null;
    upvotes: number;
};
export type InitResponse = {
    type: 'init';
    post: CipherPost;
    viewerUsername: string;
    viewerHasSolved: boolean;
};
export type GuessRequest = {
    guessText: string;
};
export type GuessResponse = {
    type: 'guess';
    matched: boolean;
    closeMatch: boolean;
    xpAwarded: number;
    firstCrack: boolean;
    newStreak: number;
    newXp: number;
    newLevel: number;
    newLabel: string;
    leveledUp: boolean;
};
export type SubmitCipherRequest = {
    emojis: Emoji[];
    answer: string;
};
export type SubmitCipherResponse = {
    status: 'published';
    postId: string;
    postUrl: string;
} | {
    status: 'rejected';
    reason: string;
};
export type LeaderboardEntry = {
    userId: string;
    username: string;
    label: string;
    score: number;
    streak: number;
};
export type LeaderboardResponse = {
    type: 'leaderboard';
    window: 'weekly' | 'alltime';
    entries: LeaderboardEntry[];
    viewerRank: number | null;
};
export type RecapResponse = {
    type: 'recap';
    post: CipherPost;
    distribution: GuessDistributionEntry[];
};
export type LevelInfo = {
    level: number;
    label: string;
    xpRangeStart: number;
    xpRangeEnd: number | null;
    rewards: string[];
};
export type ProfileResponse = {
    type: 'profile';
    username: string;
    xp: number;
    level: number;
    label: string;
    xpRangeStart: number;
    xpRangeEnd: number | null;
    currentStreak: number;
    longestStreak: number;
    totalDecodes: number;
    totalPostsCreated: number;
    rewardsUnlocked: string[];
    dailySubmissionLimit: number;
    allTiers: LevelInfo[];
};
export type ErrorResponse = {
    status: 'error';
    message: string;
};
