import type { InitResponse, GuessResponse, SuggestAnswerResponse } from '../../shared/api';
export declare const useCipher: () => {
    submitGuess: (guessText: string) => Promise<GuessResponse | null>;
    suggestAnswer: (answerText: string) => Promise<SuggestAnswerResponse | null>;
    data: InitResponse | null;
    loading: boolean;
    lastGuessResult: GuessResponse | null;
};
