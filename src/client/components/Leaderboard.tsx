// Leaderboard screen (01_PRODUCT_DOCUMENTATION.md, Section 13.9) — two
// distinct boards (Section 7): Decoders (total XP, guessing-driven) and
// Cipher Masters (upvote-driven creativity score on submitted posts).
import { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import type { LeaderboardBoard, LeaderboardResponse } from '../../shared/api';

type Props = {
  onClose: () => void;
};

export const Leaderboard = ({ onClose }: Props) => {
  const [window_, setWindow] = useState<'weekly' | 'alltime'>('weekly');
  const [board, setBoard] = useState<LeaderboardBoard>('decoders');
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setData(null);
      try {
        const res = await fetch(`/api/leaderboard?window=${window_}&board=${board}`);
        const json: LeaderboardResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
    };
    void load();
  }, [window_, board]);

  return (
    <Modal title="🏆 Leaderboard" onClose={onClose} scroll>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          aria-pressed={board === 'decoders'}
          className="flex-1 h-9 rounded-md text-sm font-medium transition-all text-gray-600 dark:text-gray-300"
          style={{
            backgroundColor: board === 'decoders' ? 'var(--color-primary)' : 'transparent',
            color: board === 'decoders' ? '#fff' : undefined,
          }}
          onClick={() => setBoard('decoders')}
        >
          🔎 Decoders
        </button>
        <button
          aria-pressed={board === 'cipherMasters'}
          className="flex-1 h-9 rounded-md text-sm font-medium transition-all text-gray-600 dark:text-gray-300"
          style={{
            backgroundColor: board === 'cipherMasters' ? 'var(--color-primary)' : 'transparent',
            color: board === 'cipherMasters' ? '#fff' : undefined,
          }}
          onClick={() => setBoard('cipherMasters')}
        >
          👑 Cipher Masters
        </button>
      </div>

      <select
        className="self-start text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-gray-800 dark:text-gray-100"
        value={window_}
        onChange={(e) => setWindow(e.target.value as 'weekly' | 'alltime')}
      >
        <option value="weekly">Weekly</option>
        <option value="alltime">All-Time</option>
      </select>

      <div className="flex flex-col gap-2">
        {!data ? (
          <Spinner />
        ) : data.entries.length === 0 ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No scores yet.</div>
        ) : (
          data.entries.map((entry, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            return (
              <div
                key={entry.userId}
                className="list-card list-item-in flex items-center gap-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2"
                style={{ ['--i' as string]: i }}
              >
                <span className="font-mono-stat text-gray-400 dark:text-gray-500 w-6 text-center shrink-0">
                  {medal ?? `${i + 1}.`}
                </span>
                <div className="min-w-0">
                  <span className="font-pixel text-gray-800 dark:text-gray-100">u/{entry.username}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    🏅 {entry.label} · {entry.score} pts
                    {entry.streak > 0 ? ` · 🔥 ${entry.streak}` : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {data && data.viewerRank !== null && (
        <div
          className="rounded-lg px-3 py-2 text-sm font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
            color: 'var(--color-primary)',
          }}
        >
          You: #{data.viewerRank}
          {data.viewerStreak > 0 ? ` · 🔥 ${data.viewerStreak}-day streak` : ''}
        </div>
      )}
    </Modal>
  );
};
