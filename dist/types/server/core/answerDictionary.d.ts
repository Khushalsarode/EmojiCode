import { type StoredCipherPost } from './storage';
export type SuggestAnswerResult = {
    status: 'added';
    acceptedAnswers: string[];
} | {
    status: 'rejected';
    reason: string;
};
export declare const suggestAlternateAnswer: (cipher: StoredCipherPost, hasSolved: boolean, rawText: string) => Promise<SuggestAnswerResult>;
