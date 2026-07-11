// Leaderboard screen (01_PRODUCT_DOCUMENTATION.md, Section 13.9).
import { useEffect, useState } from 'react';
import type { LeaderboardResponse } from '../../shared/api';

type Props = {
  onClose: () => void;
};

export const Leaderboard = ({ onClose }: Props) => {
  const [window_, setWindow] = useState<'weekly' | 'alltime'>('weekly');
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setData(null);
      try {
        const res = await fetch(`/api/leaderboard?window=${window_}`);
        const json: LeaderboardResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
    };
    void load();
  }, [window_]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg">🏆 Leaderboard</span>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <select
          className="self-start text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1"
          value={window_}
          onChange={(e) => setWindow(e.target.value as 'weekly' | 'alltime')}
        >
          <option value="weekly">Weekly</option>
          <option value="alltime">All-Time</option>
        </select>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {!data ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Loading…</div>
          ) : data.entries.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No scores yet.</div>
          ) : (
            data.entries.map((entry, i) => (
              <div key={entry.userId} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono-stat text-gray-400 dark:text-gray-500 mr-2">{i + 1}.</span>
                  <span className="text-gray-800 dark:text-gray-100">u/{entry.username}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    🏅 {entry.label} · {entry.score} pts
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
