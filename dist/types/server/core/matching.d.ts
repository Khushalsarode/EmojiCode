export type MatchResult = {
    matched: boolean;
    closeMatch: boolean;
    similarity: number;
};
export declare const MAX_ACCEPTED_ANSWERS = 8;
export declare const scoreGuess: (guessText: string, answer: string) => MatchResult;
export type MultiMatchResult = MatchResult & {
    matchedAnswer: string | null;
};
export declare const scoreGuessAgainstAnswers: (guessText: string, answers: string[]) => MultiMatchResult;
export declare const censorGuess: (text: string) => string;
export declare const hintPattern: (answer: string) => string;
