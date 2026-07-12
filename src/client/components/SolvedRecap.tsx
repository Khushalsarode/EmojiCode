// Cipher Solved Recap — ranked bar chart of guesses by frequency, wrong
// guesses partially censored server-side (01_PRODUCT_DOCUMENTATION.md, Section 13.6).
import { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import { Button } from './Button';
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
  const stats = recap?.post.stats;

  return (
    <Modal title="📊 Solved Recap" onClose={onClose} scroll>
      {!recap ? (
        <Spinner label="Loading recap…" />
      ) : (
        <>
          <div className="text-4xl sm:text-5xl text-center tracking-widest">{recap.post.emojis.join(' ')}</div>
          <div className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
            By <span className="font-pixel">u/{recap.post.submitterUsername}</span> · {recap.post.category} · 🌐{' '}
            {recap.post.language}
          </div>
          {stats && (
            <div className="text-xs text-center font-medium">
              {stats.difficultyIcon} {stats.difficultyLabel} ({stats.difficultyScore.toFixed(1)}/10)
            </div>
          )}
          <div className="text-sm text-center text-gray-600 dark:text-gray-300">
            {total} guesses by {recap.post.decoderCount} players
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <div>{stats.uniquePlayers} unique players guessed</div>
              <div>
                {stats.totalGuesses} total guesses (avg {stats.avgGuessesPerPlayer} per player)
              </div>
              <div>{stats.uniqueWordsGuessed} unique words guessed</div>
              <div>
                {stats.skips} skips ({stats.skipRate}% skip rate)
              </div>
              <div className="col-span-2">
                {stats.solves} solves ({stats.solveRate}% solved rate)
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            {recap.distribution.map((entry, i) => {
              const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
              return (
                <div
                  key={i}
                  className="list-item-in flex items-center gap-2 text-sm"
                  style={{ ['--i' as string]: i }}
                >
                  <div className="flex-1 relative h-6 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded transition-[width] duration-500 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: entry.isCorrectAnswer ? 'var(--color-primary)' : 'var(--color-gray-400)',
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

          <Button fullWidth onClick={onCreateCipher}>
            ✨ Create your own (+20 XP)
          </Button>
        </>
      )}
    </Modal>
  );
};
