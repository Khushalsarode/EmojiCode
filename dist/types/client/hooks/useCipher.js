import { useCallback, useEffect, useState } from 'react';
// Pattern follows the template's useCounter.ts (fetch on mount, POST on
// action) — see 04_DEVVIT_WEB_BUILD_SKILL.md, Section 2.
export const useCipher = () => {
    const [state, setState] = useState({
        data: null,
        loading: true,
        lastGuessResult: null,
    });
    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/init');
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setState((prev) => ({ ...prev, data, loading: false }));
            }
            catch (err) {
                console.error('Failed to init cipher', err);
                setState((prev) => ({ ...prev, loading: false }));
            }
        };
        void init();
    }, []);
    const submitGuess = useCallback(async (guessText) => {
        try {
            const res = await fetch('/api/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guessText }),
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const result = await res.json();
            setState((prev) => ({ ...prev, lastGuessResult: result }));
            return result;
        }
        catch (err) {
            console.error('Failed to submit guess', err);
            return null;
        }
    }, []);
    return { ...state, submitGuess };
};
//# sourceMappingURL=useCipher.js.map