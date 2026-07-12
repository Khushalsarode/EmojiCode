// Automated safety classification — see 01_PRODUCT_DOCUMENTATION.md, Section 9.1
//
// Fast, dependency-free denylist so instant-publish stays gated without an
// external API. Swap `runSafetyCheck` for a hosted moderation call later —
// the function signature is the contract.

const DENYLIST: RegExp[] = [
  /\b(nazi|hitler|kkk)\b/i,
  /\b(kill\s+yourself|kys)\b/i,
  /\b(child\s*porn|cp\b|pedophil)/i,
  /\b(doxx?|social\s*security|ssn\b)\b/i,
  /\b(rape|rapist)\b/i,
  /\bslur\b/i,
];

const MAX_ANSWER_LENGTH = 80;

export type SafetyResult = {
  passed: boolean;
  reason?: string;
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

  const haystack = `${emojis.join(' ')} ${trimmed}`;
  for (const pattern of DENYLIST) {
    if (pattern.test(haystack)) {
      return {
        passed: false,
        reason: "That didn't pass our content check — try another one.",
      };
    }
  }

  return { passed: true };
};
