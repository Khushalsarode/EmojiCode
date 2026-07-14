// Automated safety classification — see 01_PRODUCT_DOCUMENTATION.md, Section 9.1
//
// Two layers:
// 1. A fast, dependency-free local denylist (wordFilter.ts) — always runs,
//    zero latency, zero cost, works even with no external services configured.
// 2. An optional hosted moderation classifier (moderation.ts) — only active
//    once an API key is set via `devvit settings set openaiApiKey`. When
//    active, a failed/erroring call fails CLOSED (rejects the submission)
//    rather than silently publishing — see 03_REDDIT_APP_SETUP.md, Section 7
//    ("Don't let the safety classifier fail open").

import { containsProfanity } from './wordFilter';
import { runHostedModeration } from './moderation';

const MAX_ANSWER_LENGTH = 80;
const GENERIC_REJECTION_REASON = "That didn't pass our content check — try another one.";

export type SafetyResult = {
  passed: boolean;
  reason?: string;
};

/**
 * The shared text-safety primitive — local denylist plus optional hosted
 * moderation, fail-closed. Used both for full cipher submissions (via
 * `runSafetyCheck` below, after shape validation) and for standalone text
 * like crowd-sourced alternate answers (core/answerDictionary.ts).
 */
export const runTextSafetyCheck = async (text: string): Promise<SafetyResult> => {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { passed: false, reason: 'Text cannot be empty.' };
  }

  // Checks hate speech/harassment AND adult content (Section 9.1) — the
  // broader profanity list, not just the severe-only one guess-censoring uses.
  if (containsProfanity(trimmed)) {
    return { passed: false, reason: GENERIC_REJECTION_REASON };
  }

  try {
    const moderation = await runHostedModeration(trimmed);
    if (moderation.checked && moderation.flagged) {
      return { passed: false, reason: GENERIC_REJECTION_REASON };
    }
  } catch (err) {
    console.error('Hosted moderation check failed, rejecting submission (fail-closed)', err);
    return {
      passed: false,
      reason: 'Safety check is temporarily unavailable — try again in a moment.',
    };
  }

  return { passed: true };
};

export const runSafetyCheck = async (
  emojis: string[],
  answer: string
): Promise<SafetyResult> => {
  const trimmed = answer.trim();

  if (trimmed.length === 0) {
    return { passed: false, reason: 'Answer cannot be empty.' };
  }

  if (trimmed.length > MAX_ANSWER_LENGTH) {
    return { passed: false, reason: 'Answer is too long.' };
  }

  if (emojis.length !== 5) {
    return { passed: false, reason: 'Pick exactly 5 emojis.' };
  }

  if (emojis.some((e) => !e || e.trim().length === 0)) {
    return { passed: false, reason: 'Every emoji slot must be filled.' };
  }

  return runTextSafetyCheck(`${emojis.join(' ')} ${trimmed}`);
};
