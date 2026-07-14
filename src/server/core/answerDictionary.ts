// Crowd-sourced answer dictionary — see 01_PRODUCT_DOCUMENTATION.md.
//
// A free, dependency-free stand-in for true synonym/semantic matching: rather
// than a paid embedding model inferring that "Simba movie" means "The Lion
// King", a player who has already solved the cipher can contribute that exact
// phrasing so the fuzzy matcher (core/matching.ts) picks it up directly for
// everyone after them. Gated on `hasSolved` so only players who've proven
// they know the real answer can add to it — prevents trolls from poisoning
// the dictionary with wrong answers.

import { runTextSafetyCheck } from './safety';
import { MAX_ACCEPTED_ANSWERS } from './matching';
import { answersFor, type StoredCipherPost } from './storage';

const MAX_ALT_ANSWER_LENGTH = 80;

export type SuggestAnswerResult =
  | { status: 'added'; acceptedAnswers: string[] }
  | { status: 'rejected'; reason: string };

export const suggestAlternateAnswer = async (
  cipher: StoredCipherPost,
  hasSolved: boolean,
  rawText: string
): Promise<SuggestAnswerResult> => {
  if (!hasSolved) {
    return { status: 'rejected', reason: 'Solve the cipher first to suggest an alternate phrasing.' };
  }

  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return { status: 'rejected', reason: 'Suggestion cannot be empty.' };
  }
  if (trimmed.length > MAX_ALT_ANSWER_LENGTH) {
    return { status: 'rejected', reason: 'Suggestion is too long.' };
  }

  const current = answersFor(cipher);
  if (current.length >= MAX_ACCEPTED_ANSWERS) {
    return { status: 'rejected', reason: 'This cipher already has enough accepted phrasings.' };
  }

  const normalized = trimmed.toLowerCase();
  if (current.some((a) => a.toLowerCase() === normalized)) {
    return { status: 'rejected', reason: 'That phrasing is already accepted.' };
  }

  // Reuses the same local-denylist + optional hosted-moderation safety gate
  // as full cipher submissions (core/safety.ts) — crowd-sourced entries can
  // never introduce unsafe text.
  const safety = await runTextSafetyCheck(trimmed);
  if (!safety.passed) {
    return { status: 'rejected', reason: safety.reason ?? 'Rejected by safety check.' };
  }

  return { status: 'added', acceptedAnswers: [...current, trimmed] };
};
