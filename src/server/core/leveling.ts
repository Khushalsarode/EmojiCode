// XP / Level / Rewards system — see 01_PRODUCT_DOCUMENTATION.md, Section 7.1
//
// Level and label are ALWAYS derived from stored xp via computeLevel(), never
// stored independently — this is the single source of truth so they can't
// drift out of sync (see 04_DEVVIT_WEB_BUILD_SKILL.md, Redis key patterns).
//
// Levels 1-8 are the authored table below; Level 8+ climbs indefinitely,
// computed on demand (getTierByLevel) rather than capped — this is what
// keeps leveling dynamic instead of stalling forever once xp crosses the
// Level 8 threshold.

export type LevelTier = {
  level: number;
  xpStart: number;
  xpEnd: number | null; // null = uncapped (Level 8+)
  label: string;
  rewards: string[];
};

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, xpStart: 0, xpEnd: 99, label: 'Rookie Decoder', rewards: ['Base gameplay (submit + guess)'] },
  { level: 2, xpStart: 100, xpEnd: 349, label: 'Apprentice Cracker', rewards: ['+1 daily submission', 'Level 2 flair'] },
  { level: 3, xpStart: 350, xpEnd: 699, label: 'Code Breaker', rewards: ['Hard Mode tagging', 'Level 3 flair'] },
  { level: 4, xpStart: 700, xpEnd: 1299, label: 'Cipher Sleuth', rewards: ['Full guess-distribution stats', 'Level 4 flair'] },
  { level: 5, xpStart: 1300, xpEnd: 2199, label: 'Emoji Whisperer', rewards: ['+2 daily submissions', 'Level 5 flair'] },
  { level: 6, xpStart: 2200, xpEnd: 3999, label: 'Master Decoder', rewards: ['Trending eligibility', 'Level 6 flair'] },
  { level: 7, xpStart: 4000, xpEnd: 6499, label: 'Grandmaster Cryptographer', rewards: ['Early feature access', 'Level 7 flair'] },
  { level: 8, xpStart: 6500, xpEnd: 9999, label: 'Legendary Cipher', rewards: ['Level 8+ flair (escalating tier)'] },
];

const BASE_TIER = LEVEL_TIERS[LEVEL_TIERS.length - 1]!;
const XP_PER_STEP_PAST_TIER_8 = 3500;

// Synthesizes tier info for any level >= 8 — the actual "no cap" mechanism.
// Levels < 8 always come from the authored table above.
const dynamicTierForLevel = (level: number): LevelTier => {
  const stepsPast = Math.max(0, level - BASE_TIER.level);
  const xpStart = BASE_TIER.xpStart + stepsPast * XP_PER_STEP_PAST_TIER_8;
  return {
    level: BASE_TIER.level + stepsPast,
    xpStart,
    xpEnd: xpStart + XP_PER_STEP_PAST_TIER_8 - 1,
    label: stepsPast === 0 ? BASE_TIER.label : `${BASE_TIER.label} (Lv. ${BASE_TIER.level + stepsPast})`,
    rewards: BASE_TIER.rewards,
  };
};

export const computeLevel = (xp: number): LevelTier => {
  for (const tier of LEVEL_TIERS.slice(0, -1)) {
    if (xp >= tier.xpStart && xp <= tier.xpEnd!) return tier;
  }
  if (xp < BASE_TIER.xpStart) return LEVEL_TIERS[0]!; // defensive fallback, shouldn't hit
  const stepsPast = Math.floor((xp - BASE_TIER.xpStart) / XP_PER_STEP_PAST_TIER_8);
  return dynamicTierForLevel(BASE_TIER.level + stepsPast);
};

// Looks up tier info for an arbitrary level number, not just the current
// user's — backs the Level-Up screen's indefinite prev/next browsing
// (Section 13.8), since levels are never capped by a fixed table length.
export const getTierByLevel = (level: number): LevelTier => {
  const known = LEVEL_TIERS.find((t) => t.level === level);
  if (known) return known;
  if (level < 1) return LEVEL_TIERS[0]!;
  return dynamicTierForLevel(level);
};

export const baseDailySubmissionLimit = (level: number): number => {
  let limit = 5; // Section 5 MVP default
  if (level >= 2) limit += 1;
  if (level >= 5) limit += 2;
  return limit;
};

// Optional Reddit flair sync (Section 7.1's "Optional stretch") — one color
// per early level, escalating tier colors thereafter (gameplay perks stop
// scaling meaningfully past Level 8, so flair color is the only signal left).
const FLAIR_COLORS = ['#9CA3AF', '#CD7F32', '#C0C0C0', '#D4AF37', '#6C5CE7', '#4B3FC0'];
export const flairColorForLevel = (level: number): string => {
  const index = Math.min(Math.max(0, level - 1), FLAIR_COLORS.length - 1);
  return FLAIR_COLORS[index]!;
};

export const XP_REWARDS = {
  CORRECT_GUESS: 10,
  FIRST_CRACK_BONUS: 15,
  CIPHER_PUBLISHED: 20,
  PER_UPVOTE: 2,
  MAX_UPVOTE_XP_PER_POST: 100,
} as const;
