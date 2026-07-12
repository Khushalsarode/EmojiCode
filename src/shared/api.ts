// Shared types between client and server — keep this the single source of truth
// for request/response shapes so client and server can never drift apart.

export type Emoji = string; // a single emoji character/grapheme

export type CipherCategory = 'Movie' | 'Show' | 'Game' | 'Book' | 'Sub-Lore' | 'Other';

export type GuessDistributionEntry = {
  // The correct answer is shown in full. Everything else is pre-censored
  // server-side before it ever reaches the client (see core/censor.ts).
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
  hardMode: boolean;
  // answer is intentionally NEVER sent to the client until the post is solved
  // by the requesting user, or they explicitly "give up" (Section 13.3).
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
  closeMatch: boolean; // "so close" amber state (Section 13.4)
  xpAwarded: number;
  firstCrack: boolean;
  newStreak: number;
  newXp: number;
  newLevel: number;
  newLabel: string;
  leveledUp: boolean;
};

export type SubmitCipherRequest = {
  emojis: Emoji[]; // must be exactly 5
  answer: string;
  hardMode?: boolean; // Level 3+ perk
};

export type SubmitCipherResponse =
  | { status: 'published'; postId: string; postUrl: string }
  | { status: 'rejected'; reason: string };

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
  viewerStreak: number;
};

export type MyCiphersResponse = {
  type: 'my-ciphers';
  ciphers: (CipherPost & { postUrl: string })[];
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
  xpRangeEnd: number | null; // null = uncapped top tier
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
