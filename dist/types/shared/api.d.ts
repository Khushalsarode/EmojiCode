export type Emoji = string;
export declare const CATEGORY_OPTIONS: readonly ["Movie", "TV Series", "Music", "Comics", "Book", "Game", "Anime", "Sub-Lore", "Other"];
export type CipherCategory = (typeof CATEGORY_OPTIONS)[number];
export declare const LANGUAGE_OPTIONS: readonly ["English", "Hindi", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati", "Punjabi", "Kannada", "Malayalam", "Urdu", "Spanish", "French", "German", "Portuguese", "Russian", "Japanese", "Korean", "Chinese", "Arabic", "Other"];
export type CipherLanguage = (typeof LANGUAGE_OPTIONS)[number];
export type GuessDistributionEntry = {
    guessTextCensored: string;
    count: number;
    isCorrectAnswer: boolean;
};
export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard';
export type CipherStats = {
    uniquePlayers: number;
    totalGuesses: number;
    avgGuessesPerPlayer: number;
    uniqueWordsGuessed: number;
    skips: number;
    skipRate: number;
    solves: number;
    solveRate: number;
    difficultyScore: number;
    difficultyLabel: DifficultyLabel;
    difficultyIcon: string;
};
export type CipherPost = {
    postId: string;
    submitterUserId: string;
    submitterUsername: string;
    submitterLabel: string;
    emojis: Emoji[];
    category: CipherCategory;
    language: CipherLanguage;
    publishedAt: number;
    decoderCount: number;
    firstCrackUsername: string | null;
    upvotes: number;
    hardMode: boolean;
    stats: CipherStats;
    answerHint: string;
    isCipherOfDay: boolean;
};
export type InitResponse = {
    type: 'init';
    post: CipherPost | null;
    viewerUsername: string;
    viewerHasSolved: boolean;
    viewerStreak: number;
    viewerStreakAtRisk: boolean;
    viewerXpToNextLevel: number;
    viewerNextLevelLabel: string;
    viewerApproxDecodesToNextLevel: number;
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
    solveRank: number;
    newStreak: number;
    newXp: number;
    newLevel: number;
    newLabel: string;
    leveledUp: boolean;
};
export type SubmitCipherRequest = {
    emojis: Emoji[];
    answer: string;
    hardMode?: boolean;
    category?: CipherCategory;
    language?: CipherLanguage;
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
export type LeaderboardBoard = 'decoders' | 'cipherMasters';
export type LeaderboardResponse = {
    type: 'leaderboard';
    board: LeaderboardBoard;
    window: 'weekly' | 'alltime';
    entries: LeaderboardEntry[];
    viewerRank: number | null;
    viewerStreak: number;
};
export type MyCiphersResponse = {
    type: 'my-ciphers';
    ciphers: (CipherPost & {
        postUrl: string;
    })[];
};
export type TrendingResponse = {
    type: 'trending';
    posts: (CipherPost & {
        postUrl: string;
    })[];
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
export type LevelLookupResponse = {
    type: 'level';
    tier: LevelInfo;
};
export type BadgeInfo = {
    id: string;
    icon: string;
    label: string;
    tier?: 1 | 2 | 3;
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
    streakAtRisk: boolean;
    totalDecodes: number;
    totalPostsCreated: number;
    bestPostUpvotes: number;
    rewardsUnlocked: string[];
    dailySubmissionLimit: number;
    allTiers: LevelInfo[];
    badges: BadgeInfo[];
    xpToNextLevel: number;
    nextLevelLabel: string;
    approxDecodesToNextLevel: number;
};
export type SuggestAnswerRequest = {
    answerText: string;
};
export type SuggestAnswerResponse = {
    status: 'added';
    acceptedAnswerCount: number;
} | {
    status: 'rejected';
    reason: string;
};
export type ErrorResponse = {
    status: 'error';
    message: string;
};
export declare const ordinal: (n: number) => string;
export declare const rankMedal: (rank: number) => string;
