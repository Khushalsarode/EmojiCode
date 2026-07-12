// Home Menu — the app's main hub (01_PRODUCT_DOCUMENTATION.md, Section 13.1).
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse | null;
  onClose: () => void;
  onCreateCipher: () => void;
  onOpenRewards: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevelUp: () => void;
  onOpenMyCiphers: () => void;
};

export const HomeMenu = ({
  profile,
  onClose,
  onCreateCipher,
  onOpenRewards,
  onOpenLeaderboard,
  onOpenLevelUp,
  onOpenMyCiphers,
}: Props) => {
  const levelProgress =
    profile && profile.xpRangeEnd !== null
      ? Math.min(
          100,
          ((profile.xp - profile.xpRangeStart) / (profile.xpRangeEnd - profile.xpRangeStart + 1)) * 100
        )
      : 100;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="w-6" />
          <div className="flex flex-col items-center">
            <span className="text-3xl">🔐</span>
            <span className="font-heading font-bold text-lg">EmojiCode</span>
          </div>
          <button onClick={onClose} className="text-gray-400 w-6 text-right">✕</button>
        </div>

        <button
          className="h-11 rounded-lg text-white font-medium mt-2"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={onCreateCipher}
        >
          ✨ Create a Cipher
        </button>
        <button
          className="h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100"
          onClick={onOpenMyCiphers}
        >
          🔍 My Ciphers
        </button>
        <button
          className="h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100"
          onClick={onOpenRewards}
        >
          🏅 My Rewards
        </button>
        <button
          className="h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100"
          onClick={onOpenLeaderboard}
        >
          🏆 Leaderboard
        </button>

        {profile && (
          <button className="flex flex-col gap-1 mt-2 text-left" onClick={onOpenLevelUp}>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Level {profile.level} · {profile.label} →
            </span>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${levelProgress}%`, backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
