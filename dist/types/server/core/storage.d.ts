export declare const keys: {
    cipher: (postId: string) => string;
    user: (userId: string) => string;
    userCiphers: (userId: string) => string;
    dailySubs: (userId: string, day: string) => string;
    processedComment: (commentId: string) => string;
    guessTally: (postId: string, userId: string, normalizedGuess: string) => string;
    leaderboardAllTime: () => string;
    leaderboardWeekly: (isoWeek: string) => string;
};
export declare const todayUtc: () => string;
export declare const currentIsoWeek: () => string;
export type StoredUserProfile = {
    userId: string;
    username: string;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    totalDecodes: number;
    totalPostsCreated: number;
    cipherMasterScore: number;
    rewardsUnlocked: string[];
    badges: string[];
};
export declare const defaultUserProfile: (userId: string, username: string) => StoredUserProfile;
export type StoredCipherPost = {
    postId: string;
    submitterUserId: string;
    submitterUsername: string;
    emojis: string[];
    category: string;
    answer: string;
    publishedAt: number;
    upvotes: number;
    hardMode: boolean;
    decoderList: {
        userId: string;
        username: string;
        guessedAt: number;
    }[];
    firstCrackUserId: string | null;
    firstCrackUsername: string | null;
    guessDistribution: Record<string, number>;
};
export declare const applyStreak: (profile: StoredUserProfile) => StoredUserProfile;
