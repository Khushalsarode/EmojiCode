// Automated semantic-ish answer matching — see 01_PRODUCT_DOCUMENTATION.md, Section 9.2
//
// MVP implementation: normalized string comparison + Levenshtein distance,
// which handles capitalization, "The" prefixes, punctuation, and minor typos
// without any external API or manually-curated alternates list. This is
// intentionally dependency-free so the core loop works offline during
// playtesting. Swap `isMatch` for an embedding-similarity call later —
// callers only care about the boolean/score contract below.

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const levenshtein = (a: string, b: string): number => {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const row = dp[i]!;
      const prevRow = dp[i - 1]!;
      row[j] = Math.min(prevRow[j]! + 1, row[j - 1]! + 1, prevRow[j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
};

export type MatchResult = {
  matched: boolean;
  closeMatch: boolean; // Section 13.4 "so close" amber state
  similarity: number; // 0–1, higher = closer
};

export const scoreGuess = (guessText: string, answer: string): MatchResult => {
  const g = normalize(guessText);
  const a = normalize(answer);

  if (g.length === 0) {
    return { matched: false, closeMatch: false, similarity: 0 };
  }

  if (g === a) {
    return { matched: true, closeMatch: false, similarity: 1 };
  }

  const distance = levenshtein(g, a);
  const maxLen = Math.max(g.length, a.length);
  const similarity = 1 - distance / maxLen;

  // Tuned thresholds — recalibrate against real playtest data per the
  // pre-submission testing checklist in 02_SETUP_AND_DEPLOYMENT.md.
  const MATCH_THRESHOLD = 0.85;
  const CLOSE_THRESHOLD = 0.65;

  return {
    matched: similarity >= MATCH_THRESHOLD,
    closeMatch: similarity >= CLOSE_THRESHOLD && similarity < MATCH_THRESHOLD,
    similarity,
  };
};

// Partially censors a wrong guess for the Solved Recap screen (Section 13.6),
// e.g. "The Jungle Book" -> "T** J****e B**k". First and last letter of each
// word survive; everything else is masked.
export const censorGuess = (text: string): string =>
  text
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
    })
    .join(' ');
