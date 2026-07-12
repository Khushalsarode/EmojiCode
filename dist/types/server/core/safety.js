// Automated safety classification — see 01_PRODUCT_DOCUMENTATION.md, Section 9.1
//
// Fast, dependency-free denylist so instant-publish stays gated without an
// external API. Swap `runSafetyCheck` for a hosted moderation call later —
// the function signature is the contract.
import { containsProfanity } from './wordFilter';
const MAX_ANSWER_LENGTH = 80;
export const runSafetyCheck = async (emojis, answer) => {
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
    // Checks hate speech/harassment AND adult content (Section 9.1) — the
    // broader profanity list, not just the severe-only one guess-censoring uses.
    const haystack = `${emojis.join(' ')} ${trimmed}`;
    if (containsProfanity(haystack)) {
        return {
            passed: false,
            reason: "That didn't pass our content check — try another one.",
        };
    }
    return { passed: true };
};
//# sourceMappingURL=safety.js.map