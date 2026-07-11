// Automated safety classification — see 01_PRODUCT_DOCUMENTATION.md, Section 9.1
//
// This starts as a fast, dependency-free denylist filter so the project has a
// working, testable safety gate from day one. Swap `runSafetyCheck` for a call
// to a hosted moderation/classification API later without touching any caller —
// the function signature is the contract, not the implementation.

const DENYLIST: RegExp[] = [
  // Intentionally minimal starter set — extend with a real moderation
  // wordlist/service before this goes live on a public subreddit.
  /\bslur\b/i,
];

const MAX_ANSWER_LENGTH = 80;

export type SafetyResult = {
  passed: boolean;
  reason?: string;
};

export const runSafetyCheck = async (
  _emojis: string[],
  answer: string
): Promise<SafetyResult> => {
  const trimmed = answer.trim();

  if (trimmed.length === 0) {
    return { passed: false, reason: 'Answer cannot be empty.' };
  }

  if (trimmed.length > MAX_ANSWER_LENGTH) {
    return { passed: false, reason: 'Answer is too long.' };
  }

  for (const pattern of DENYLIST) {
    if (pattern.test(trimmed)) {
      return {
        passed: false,
        reason: "That didn't pass our content check — try another one.",
      };
    }
  }

  // TODO: replace with a real hosted safety-classifier / embedding-based
  // moderation call per 04_DEVVIT_WEB_BUILD_SKILL.md, Section 6. Keep this
  // check synchronous relative to the form-submit handler — publishing must
  // never happen before this resolves.
  return { passed: true };
};
