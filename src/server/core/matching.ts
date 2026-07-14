// Automated semantic-ish answer matching — see 01_PRODUCT_DOCUMENTATION.md, Section 9.2
//
// MVP implementation: normalized string comparison + character-level
// Levenshtein distance (typos/casing/"The" prefixes) combined with word-level
// overlap (a guess missing or adding a whole word out of a multi-word answer
// still reads as close, instead of whole-string Levenshtein unfairly tanking
// the score) — no external API or manually-curated alternates list needed.
// This is intentionally dependency-free so the core loop works offline during
// playtesting. Swap `isMatch` for an embedding-similarity call later —
// callers only care about the boolean/score contract below.

import { containsProfanity } from './wordFilter';

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

// Whole-string Levenshtein badly over-penalizes a single dropped/extra word
// in a multi-word answer ("lion king" -> "lion" reads as barely-related by
// character distance alone, even though it's clearly the same answer minus
// one word). This scores word-level overlap instead (Sørensen–Dice
// coefficient, with each word itself Levenshtein-fuzzy-matched so per-word
// typos still count) so a guess missing/adding one word out of several still
// reads as close — matching.ts's final similarity is the max of this and the
// character-level score, so neither approach can make a real match worse.
const WORD_TYPO_TOLERANCE = 0.25; // fraction of the longer word's length allowed to differ

const wordsMatch = (w1: string, w2: string): boolean => {
  if (w1 === w2) return true;
  const maxLen = Math.max(w1.length, w2.length);
  if (maxLen <= 2) return false; // too short for fuzzy tolerance to be meaningful
  return levenshtein(w1, w2) / maxLen <= WORD_TYPO_TOLERANCE;
};

const wordSimilarity = (a: string, b: string): number => {
  const aWords = a.split(' ').filter(Boolean);
  const bWords = b.split(' ').filter(Boolean);
  if (aWords.length === 0 || bWords.length === 0) return 0;

  const bRemaining = [...bWords];
  let common = 0;
  for (const w of aWords) {
    const idx = bRemaining.findIndex((bw) => wordsMatch(w, bw));
    if (idx !== -1) {
      common++;
      bRemaining.splice(idx, 1); // each answer word can only be claimed once
    }
  }

  return (2 * common) / (aWords.length + bWords.length);
};

export type MatchResult = {
  matched: boolean;
  closeMatch: boolean; // Section 13.4 "so close" amber state
  similarity: number; // 0–1, higher = closer
};

// Crowd-sourced answer dictionary (core/answerDictionary.ts) — a free,
// dependency-free stand-in for true synonym/semantic matching (which would
// need a paid embeddings API). Instead of guessing that "Simba movie" means
// "The Lion King", players who've already solved a cipher can contribute
// that exact phrasing so future guessers get credit for it directly.
export const MAX_ACCEPTED_ANSWERS = 8;

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
  const charSimilarity = 1 - distance / maxLen;
  const wordSim = wordSimilarity(g, a);
  const similarity = Math.max(charSimilarity, wordSim);

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

export type MultiMatchResult = MatchResult & {
  // Which accepted answer produced the best score, if any (matched or close).
  matchedAnswer: string | null;
};

// Scores a guess against every accepted phrasing for a cipher (the original
// answer plus any crowd-sourced alternates) and returns the best result.
export const scoreGuessAgainstAnswers = (guessText: string, answers: string[]): MultiMatchResult => {
  let best: MultiMatchResult = { matched: false, closeMatch: false, similarity: 0, matchedAnswer: null };
  for (const answer of answers) {
    const result = scoreGuess(guessText, answer);
    if (result.matched) return { ...result, matchedAnswer: answer };
    if (result.similarity > best.similarity) {
      best = { ...result, matchedAnswer: result.closeMatch ? answer : null };
    }
  }
  return best;
};

// Partially censors a wrong guess for the Solved Recap screen (Section 13.6),
// e.g. "The Jungle Book" -> "T** J****e B**k". First and last letter of each
// word survive; everything else is masked. Profanity/adult-language guesses
// get fully masked instead — those never show their shape, matching Pixelary's
// own harder line on bad words vs. ordinary wrong guesses.
export const censorGuess = (text: string): string => {
  if (containsProfanity(text)) {
    return text
      .split(' ')
      .map((word) => '*'.repeat(word.length))
      .join(' ');
  }

  return text
    .split(' ')
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
    })
    .join(' ');
};

// Wordle-style blank pattern for the guess screen's optional Hint button —
// reveals word count/shape only (e.g. "The Lion King" -> "___ ____ ____"),
// never a letter of the actual answer.
export const hintPattern = (answer: string): string =>
  answer
    .split(' ')
    .map((word) => '_'.repeat(word.length))
    .join(' ');
