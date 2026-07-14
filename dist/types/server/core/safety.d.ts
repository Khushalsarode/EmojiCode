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
export declare const runTextSafetyCheck: (text: string) => Promise<SafetyResult>;
export declare const runSafetyCheck: (emojis: string[], answer: string) => Promise<SafetyResult>;
