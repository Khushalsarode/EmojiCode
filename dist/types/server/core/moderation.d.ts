export type ModerationResult = {
    checked: true;
    flagged: boolean;
    categories: string[];
} | {
    checked: false;
};
export declare const runHostedModeration: (input: string) => Promise<ModerationResult>;
