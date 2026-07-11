// Level-Up / Level Details screen — browsable across every level, not just
// the viewer's current one (01_PRODUCT_DOCUMENTATION.md, Section 13.8).
import { useState } from 'react';
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse;
  onClose: () => void;
};

export const LevelUp = ({ profile, onClose }: Props) => {
  const startIndex = Math.max(
    0,
    profile.allTiers.findIndex((t) => t.level === profile.level)
  );
  const [index, setIndex] = useState(startIndex);
  const tier = profile.allTiers[index]!;
  const nextTier = profile.allTiers[index + 1];
  const unlocked = tier.level <= profile.level;

  const progress =
    tier.level === profile.level
      ? tier.xpRangeEnd !== null
        ? Math.min(100, ((profile.xp - tier.xpRangeStart) / (tier.xpRangeEnd - tier.xpRangeStart + 1)) * 100)
        : 100
      : unlocked
        ? 100
        : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg">Level {tier.level}</span>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{tier.label}</div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono-stat text-gray-500 dark:text-gray-400">
            <span>{tier.xpRangeStart}</span>
            <span>{tier.xpRangeEnd ?? '∞'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Rewards</div>
          <div className="flex flex-col gap-1">
            {tier.rewards.map((reward, i) => (
              <div key={i} className="text-sm text-gray-800 dark:text-gray-100">
                {unlocked ? (
                  <span style={{ color: 'var(--color-success)' }}>✔</span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-600">✗</span>
                )}{' '}
                {reward}
              </div>
            ))}
            {nextTier &&
              nextTier.rewards.map((reward, i) => (
                <div key={`next-${i}`} className="text-sm text-gray-400 dark:text-gray-600">
                  ✗ {reward} (Lv. {nextTier.level})
                </div>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <button
            className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30"
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0}
          >
            ←
          </button>
          <button
            className="h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30"
            onClick={() => setIndex((i) => i + 1)}
            disabled={index === profile.allTiers.length - 1}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
