export type SafetyResult = {
    passed: boolean;
    reason?: string;
};
export declare const runSafetyCheck: (emojis: string[], answer: string) => Promise<SafetyResult>;
