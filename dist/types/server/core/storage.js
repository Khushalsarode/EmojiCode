// Redis key-pattern helpers — see 04_DEVVIT_WEB_BUILD_SKILL.md, Section 8.
// Centralizing key formats here means every route uses the exact same
// pattern and nobody hand-rolls a key string inline.
export const keys = {
    cipher: (postId) => `cipher:${postId}`,
    user: (userId) => `user:${userId}`,
    userCiphers: (userId) => `user:${userId}:ciphers`,
    dailySubs: (userId, day) => `subs:${userId}:${day}`,
    processedComment: (commentId) => `processedComment:${commentId}`,
    guessTally: (postId, userId, normalizedGuess) => `tally:${postId}:${userId}:${normalizedGuess}`,
    leaderboardAllTime: () => 'leaderboard:alltime',
    leaderboardWeekly: (isoWeek) => `leaderboard:weekly:${isoWeek}`,
};
export const todayUtc = () => new Date().toISOString().slice(0, 10);
export const currentIsoWeek = () => {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
    const week = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
};
export const defaultUserProfile = (userId, username) => ({
    userId,
    username,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalDecodes: 0,
    totalPostsCreated: 0,
    cipherMasterScore: 0,
    rewardsUnlocked: [],
    badges: [],
});
// Applies a correct-guess streak update against "today" in UTC. Kept as a
// pure function so it's independently testable per the pre-submission
// checklist in 02_SETUP_AND_DEPLOYMENT.md.
export const applyStreak = (profile) => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.lastActiveDate === today)
        return profile; // already counted today
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const continuesStreak = profile.lastActiveDate === yesterday;
    const newStreak = continuesStreak ? profile.currentStreak + 1 : 1;
    return {
        ...profile,
        currentStreak: newStreak,
        longestStreak: Math.max(profile.longestStreak, newStreak),
        lastActiveDate: today,
    };
};
//# sourceMappingURL=storage.js.map