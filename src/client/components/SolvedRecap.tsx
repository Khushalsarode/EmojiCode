// Cipher Solved Recap — ranked bar chart of guesses by frequency, wrong
// guesses partially censored server-side (01_PRODUCT_DOCUMENTATION.md, Section 13.6).
import { useEffect, useState } from 'react';
import type { RecapResponse } from '../../shared/api';

type Props = {
  onClose: () => void;
  onCreateCipher: () => void;
};

export const SolvedRecap = ({ onClose, onCreateCipher }: Props) => {
  const [recap, setRecap] = useState<RecapResponse | null>(null);

  useEffect(() => {
    fetch('/api/recap')
      .then((res) => res.json())
      .then((json: RecapResponse) => setRecap(json))
      .catch((err) => console.error('Failed to load recap', err));
  }, []);

  const total = recap?.distribution.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg">📊 Solved Recap</span>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {!recap ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Loading…</div>
        ) : (
          <>
            <div className="text-4xl text-center tracking-widest">{recap.post.emojis.join(' ')}</div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              By u/{recap.post.submitterUsername}
            </div>
            <div className="text-sm text-center text-gray-600 dark:text-gray-300">
              {total} guesses by {recap.post.decoderCount} players
            </div>

            <div className="flex flex-col gap-1.5">
              {recap.distribution.map((entry, i) => {
                const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="flex-1 relative h-6 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: entry.isCorrectAnswer ? 'var(--color-primary)' : '#9ca3af',
                        }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-800 dark:text-gray-100 truncate">
                        {entry.guessTextCensored}
                      </span>
                    </div>
                    <span className="w-14 text-right text-xs font-mono-stat text-gray-500 dark:text-gray-400">
                      {entry.count} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-center text-gray-400 dark:text-gray-500">See comments for more</div>

            <button
              className="h-11 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={onCreateCipher}
            >
              ✨ Create your own
            </button>
          </>
        )}
      </div>
    </div>
  );
};
