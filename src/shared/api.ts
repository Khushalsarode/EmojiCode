// Shared types between client and server — keep this the single source of truth
// for request/response shapes so client and server can never drift apart.

export type Emoji = string; // a single emoji character/grapheme

// Picked by the submitter at creation time (Section 13.5's submission form) —
// pre-filled with a best-guess auto-inferred default (core/category.ts) but
// always stored as whatever the submitter actually selected.
export const CATEGORY_OPTIONS = [
  'Movie',
  'TV Series',
  'Music',
  'Comics',
  'Book',
  'Game',
  'Anime',
  'Sub-Lore',
  'Other',
] as const;
export type CipherCategory = (typeof CATEGORY_OPTIONS)[number];

// Language of the answer/cipher, picked by the submitter alongside category.
export const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Marathi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Gujarati',
  'Punjabi',
  'Kannada',
  'Malayalam',
  'Urdu',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Russian',
  'Japanese',
  'Korean',
  'Chinese',
  'Arabic',
  'Other',
] as const;
export type CipherLanguage = (typeof LANGUAGE_OPTIONS)[number];

export type GuessDistributionEntry = {
  // The correct answer is shown in full. Everything else is pre-censored
  // server-side before it ever reaches the client (see core/censor.ts).
  guessTextCensored: string;
  count: number;
  isCorrectAnswer: boolean;
};

// Live stats + difficulty rating (core/difficulty.ts) — modeled on Pixelary's
// own stickied "Game Master" stats comment, rendered in our own UI instead.
export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard';

export type CipherStats = {
  uniquePlayers: number;
  totalGuesses: number;
  avgGuessesPerPlayer: number;
  uniqueWordsGuessed: number;
  skips: number;
  skipRate: number; // 0-100
  solves: number;
  solveRate: number; // 0-100
  difficultyScore: number; // 0-10
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
  // Wordle-style blank pattern (e.g. "___ ____ ____") for the guess screen's
  // Hint button — reveals word count/shape only, never a letter of the answer.
  answerHint: string;
  // Today's featured pick (core/dailyChallenge.ts, retention hook) — solving
  // it awards DAILY_BONUS_XP on top of the normal guess reward.
  isCipherOfDay: boolean;
  // answer is intentionally NEVER sent to the client until the post is solved
  // by the requesting user, or they explicitly "give up" (Section 13.3).
};

export type InitResponse = {
  type: 'init';
  // null means this post has no cipher record — it's the persistent hub post
  // (Section 13.1's Home Menu), not an individual cipher.
  post: CipherPost | null;
  viewerUsername: string;
  viewerHasSolved: boolean;
  // Lightweight retention-loop fields, sent here too (not just ProfileResponse)
  // so splash.tsx's home screen can show them without fetching full profile
  // data — see 04_DEVVIT_WEB_BUILD_SKILL.md Section 3 on keeping splash light.
  viewerStreak: number;
  viewerStreakAtRisk: boolean; // has an active streak but hasn't played today
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
  closeMatch: boolean; // "so close" amber state (Section 13.4)
  xpAwarded: number;
  firstCrack: boolean;
  // 1-based place this solver landed in (1 = firstCrack). 0 when not matched.
  solveRank: number;
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
  category?: CipherCategory; // defaults to core/category.ts's auto-inference if omitted
  language?: CipherLanguage; // defaults to 'English' if omitted
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

// Two distinct rankings (Section 7): "decoders" ranks by total XP (dominated
// by guessing activity), "cipherMasters" ranks by upvote-driven creativity
// score on submitted posts — kept separate so a great guesser and a great
// creator aren't blended into one number.
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
  ciphers: (CipherPost & { postUrl: string })[];
};

// Level 6's "Featured eligibility" reward (Section 7.1) — only posts from
// Level 6+ submitters are eligible to appear here, ranked by live upvotes.
export type TrendingResponse = {
  type: 'trending';
  posts: (CipherPost & { postUrl: string })[];
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

// Levels are computed on demand, not capped by a fixed table (core/leveling.ts's
// getTierByLevel) — this backs the Level-Up screen's indefinite prev/next
// browsing (Section 13.8) instead of stopping at whatever ships in allTiers.
export type LevelLookupResponse = {
  type: 'level';
  tier: LevelInfo;
};

export type BadgeInfo = {
  id: string;
  icon: string;
  label: string;
  // Powers the circular chip's accent color (Section 12: "single accent
  // color per tier (bronze/silver/gold)"). Undefined for one-off
  // achievements (First Crack, first submission) rather than tiered milestones.
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
  streakAtRisk: boolean; // has an active streak but hasn't played today
  totalDecodes: number;
  totalPostsCreated: number;
  bestPostUpvotes: number;
  rewardsUnlocked: string[];
  dailySubmissionLimit: number;
  allTiers: LevelInfo[];
  badges: BadgeInfo[];
  // "Almost there" progress teaser (Home Menu/Profile Card) — how close the
  // viewer is to the next level, surfaced beyond just the Level-Up screen.
  xpToNextLevel: number;
  nextLevelLabel: string;
  approxDecodesToNextLevel: number;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};

// "1st" / "2nd" / "3rd" / "4th"... — shared by the server's guess-confirmation
// comment reply and the client's in-app feedback (Section 13.4's "🥈 2nd to
// solve this one") so the two can never say something different.
export const ordinal = (n: number): string => {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};
export const rankMedal = (rank: number): string => (rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎖️');
