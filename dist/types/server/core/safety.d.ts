export type SafetyResult = {
    passed: boolean;
    reason?: string;
};
export declare const runSafetyCheck: (_emojis: string[], answer: string) => Promise<SafetyResult>;
