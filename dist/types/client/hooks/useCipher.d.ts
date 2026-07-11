import type { InitResponse, GuessResponse } from '../../shared/api';
export declare const useCipher: () => {
    submitGuess: (guessText: string) => Promise<GuessResponse | null>;
    data: InitResponse | null;
    loading: boolean;
    lastGuessResult: GuessResponse | null;
};
