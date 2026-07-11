export type MatchResult = {
    matched: boolean;
    closeMatch: boolean;
    similarity: number;
};
export declare const scoreGuess: (guessText: string, answer: string) => MatchResult;
export declare const censorGuess: (text: string) => string;
