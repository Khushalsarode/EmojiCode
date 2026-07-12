// Redis key-pattern helpers — see 04_DEVVIT_WEB_BUILD_SKILL.md, Section 8.
// Centralizing key formats here means every route uses the exact same
// pattern and nobody hand-rolls a key string inline.

export const keys = {
  cipher: (postId: string) => `cipher:${postId}`,
  user: (userId: string) => `user:${userId}`,
  userCiphers: (userId: string) => `user:${userId}:ciphers`,
  dailySubs: (userId: string, day: string) => `subs:${userId}:${day}`,
  processedComment: (commentId: string) => `processedComment:${commentId}`,
  guessTally: (postId: string, userId: string, normalizedGuess: string) =>
    `tally:${postId}:${userId}:${normalizedGuess}`,
  leaderboardAllTime: () => 'leaderboard:alltime',
  leaderboardWeekly: (isoWeek: string) => `leaderboard:weekly:${isoWeek}`,
};

export const todayUtc = (): string => new Date().toISOString().slice(0, 10);

export const currentIsoWeek = (): string => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

export type StoredUserProfile = {
  userId: string;
  username: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date, drives streak logic
  totalDecodes: number;
  totalPostsCreated: number;
  cipherMasterScore: number;
  rewardsUnlocked: string[];
  badges: string[];
};

export const defaultUserProfile = (userId: string, username: string): StoredUserProfile => ({
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
  decoderList: { userId: string; username: string; guessedAt: number }[];
  firstCrackUserId: string | null;
  firstCrackUsername: string | null;
  guessDistribution: Record<string, number>; // raw guess text -> count, censored at read time
};

// Applies a correct-guess streak update against "today" in UTC. Kept as a
// pure function so it's independently testable per the pre-submission
// checklist in 02_SETUP_AND_DEPLOYMENT.md.
export const applyStreak = (profile: StoredUserProfile): StoredUserProfile => {
  const today = new Date().toISOString().slice(0, 10);
  if (profile.lastActiveDate === today) return profile; // already counted today

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
