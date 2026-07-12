import { type GuessResponse } from '../../shared/api';
export type ProcessGuessInput = {
    postId: string;
    userId: string;
    username: string;
    guessText: string;
    /** When set, used to dedupe in-app guesses vs the comment trigger. */
    commentId?: string;
    /** Reply under the guess comment on a correct match (comment-trigger path). */
    replyOnMatch?: boolean;
};
/**
 * Scores a guess against the cipher for `postId`.
 * Returns null when this event was already processed (dedupe).
 */
export declare const processGuess: (input: ProcessGuessInput) => Promise<GuessResponse | null>;
