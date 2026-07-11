// XP / Level / Rewards system — see 01_PRODUCT_DOCUMENTATION.md, Section 7.1
//
// Level and label are ALWAYS derived from stored xp via computeLevel(), never
// stored independently — this is the single source of truth so they can't
// drift out of sync (see 04_DEVVIT_WEB_BUILD_SKILL.md, Redis key patterns).

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
  { level: 8, xpStart: 6500, xpEnd: null, label: 'Legendary Cipher', rewards: ['Level 8+ flair (escalating tier)'] },
];

const XP_PER_STEP_PAST_TIER_8 = 3500;

export const computeLevel = (xp: number): LevelTier => {
  for (const tier of LEVEL_TIERS) {
    if (tier.xpEnd === null || xp <= tier.xpEnd) {
      if (xp >= tier.xpStart) return tier;
    }
  }
  // Past the last defined tier: keep climbing as "Legendary Cipher (Lv. N)"
  const base = LEVEL_TIERS[LEVEL_TIERS.length - 1]!;
  const stepsPast = Math.floor((xp - base.xpStart) / XP_PER_STEP_PAST_TIER_8);
  return {
    ...base,
    level: base.level + stepsPast,
    label: `${base.label} (Lv. ${base.level + stepsPast})`,
  };
};

export const baseDailySubmissionLimit = (level: number): number => {
  let limit = 5; // Section 5 MVP default
  if (level >= 2) limit += 1;
  if (level >= 5) limit += 2;
  return limit;
};

export const XP_REWARDS = {
  CORRECT_GUESS: 10,
  FIRST_CRACK_BONUS: 15,
  CIPHER_PUBLISHED: 20,
  PER_UPVOTE: 2,
  MAX_UPVOTE_XP_PER_POST: 100,
} as const;
