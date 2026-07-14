import { useCallback, useEffect, useState } from 'react';
import type { InitResponse, GuessResponse, SuggestAnswerResponse } from '../../shared/api';

type CipherState = {
  data: InitResponse | null;
  loading: boolean;
  lastGuessResult: GuessResponse | null;
};

// Pattern follows the template's useCounter.ts (fetch on mount, POST on
// action) — see 04_DEVVIT_WEB_BUILD_SKILL.md, Section 2.
export const useCipher = () => {
  const [state, setState] = useState<CipherState>({
    data: null,
    loading: true,
    lastGuessResult: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InitResponse = await res.json();
        setState((prev) => ({ ...prev, data, loading: false }));
      } catch (err) {
        console.error('Failed to init cipher', err);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    void init();
  }, []);

  const submitGuess = useCallback(async (guessText: string) => {
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guessText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: GuessResponse = await res.json();
      setState((prev) => ({ ...prev, lastGuessResult: result }));
      return result;
    } catch (err) {
      console.error('Failed to submit guess', err);
      return null;
    }
  }, []);

  const suggestAnswer = useCallback(async (answerText: string): Promise<SuggestAnswerResponse | null> => {
    try {
      const res = await fetch('/api/suggest-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerText }),
      });
      return (await res.json()) as SuggestAnswerResponse;
    } catch (err) {
      console.error('Failed to suggest answer', err);
      return null;
    }
  }, []);

  return { ...state, submitGuess, suggestAnswer };
};
