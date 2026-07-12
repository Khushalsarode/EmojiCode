// Level-Up / Level Details screen — browsable across every level, not just
// the viewer's current one, and not capped by whatever ships in `allTiers`
// (01_PRODUCT_DOCUMENTATION.md, Section 13.8) — levels are dynamic, so
// browsing forward fetches the next tier on demand via GET /api/level/:level.
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { LevelInfo, LevelLookupResponse, ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse;
  onClose: () => void;
};

export const LevelUp = ({ profile, onClose }: Props) => {
  const startIndex = Math.max(
    0,
    profile.allTiers.findIndex((t) => t.level === profile.level)
  );
  const [tiers, setTiers] = useState<LevelInfo[]>(profile.allTiers);
  const [index, setIndex] = useState(startIndex);
  const [loadingNext, setLoadingNext] = useState(false);

  const tier = tiers[index]!;
  const nextTier = tiers[index + 1];
  const unlocked = tier.level <= profile.level;

  const progress =
    tier.level === profile.level
      ? tier.xpRangeEnd !== null
        ? Math.min(100, ((profile.xp - tier.xpRangeStart) / (tier.xpRangeEnd - tier.xpRangeStart + 1)) * 100)
        : 100
      : unlocked
        ? 100
        : 0;

  const goNext = async () => {
    if (index < tiers.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    setLoadingNext(true);
    try {
      const res = await fetch(`/api/level/${tier.level + 1}`);
      const json: LevelLookupResponse = await res.json();
      setTiers((prev) => [...prev, json.tier]);
      setIndex((i) => i + 1);
    } catch (err) {
      console.error('Failed to load next level', err);
    } finally {
      setLoadingNext(false);
    }
  };

  return (
    <Modal title={`Level ${tier.level}`} onClose={onClose}>
      <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 -mt-2">{tier.label}</div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs font-mono-stat text-gray-500 dark:text-gray-400">
          <span>{tier.xpRangeStart}</span>
          <span>{tier.xpRangeEnd ?? '∞'}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Rewards</div>
        <div className="flex flex-col gap-1">
          {tier.rewards.map((reward, i) => (
            <div
              key={i}
              className="list-item-in text-sm sm:text-base text-gray-800 dark:text-gray-100"
              style={{ ['--i' as string]: i }}
            >
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
              <div key={`next-${i}`} className="text-sm sm:text-base text-gray-400 dark:text-gray-600">
                ✗ {reward} (Lv. {nextTier.level})
              </div>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-9 px-0"
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
          aria-label="Previous level"
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-9 px-0"
          onClick={goNext}
          loading={loadingNext}
          aria-label="Next level"
        >
          {!loadingNext && '→'}
        </Button>
      </div>
    </Modal>
  );
};
