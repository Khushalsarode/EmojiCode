// Home Menu — the app's main hub (01_PRODUCT_DOCUMENTATION.md, Section 13.1).
import { Button } from './Button';
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse | null;
  // Omit onClose when this renders as the hub's own main page (Section 13.1)
  // instead of an overlay opened from inside a cipher post — there's nothing
  // to close, this *is* the page.
  onClose?: () => void;
  onCreateCipher: () => void;
  onOpenRewards: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevelUp: () => void;
  onOpenMyCiphers: () => void;
  onOpenProfile: () => void;
  onOpenTrending: () => void;
  onOpenHowTo: () => void;
};

export const HomeMenu = ({
  profile,
  onClose,
  onCreateCipher,
  onOpenRewards,
  onOpenLeaderboard,
  onOpenLevelUp,
  onOpenMyCiphers,
  onOpenProfile,
  onOpenTrending,
  onOpenHowTo,
}: Props) => {
  const levelProgress =
    profile && profile.xpRangeEnd !== null
      ? Math.min(
          100,
          ((profile.xp - profile.xpRangeStart) / (profile.xpRangeEnd - profile.xpRangeStart + 1)) * 100
        )
      : 100;

  const content = (
    <div
      className={
        onClose
          ? 'card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-7 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto flex flex-col gap-3'
          : 'modal-pop w-full max-w-sm sm:max-w-md flex flex-col gap-3 mx-auto'
      }
    >
      <div className="flex items-center justify-between">
        <span className="w-6" />
        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl">🔐</span>
          <span className="font-wordmark text-lg sm:text-xl">EmojiCode</span>
        </div>
        {onClose ? (
          <button onClick={onClose} className="text-gray-400 w-6 text-right hover:text-[var(--color-primary)] hover:rotate-90 transition-all" aria-label="Close">✕</button>
        ) : (
          <span className="w-6" />
        )}
      </div>

      {profile && profile.streakAtRisk && (
        <div
          className="text-xs sm:text-sm text-center rounded-lg px-3 py-2 font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
            color: 'var(--color-warning)',
          }}
        >
          <span className="flame-icon">🔥</span> {profile.currentStreak}-day streak — solve today to keep it!
        </div>
      )}

      <Button fullWidth className="mt-2" onClick={onCreateCipher}>
        ✨ Create a Cipher
      </Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Button variant="outline" fullWidth onClick={onOpenMyCiphers}>
          🔍 My Ciphers
        </Button>
        <Button variant="outline" fullWidth onClick={onOpenRewards}>
          🏅 My Rewards
        </Button>
        <Button variant="outline" fullWidth onClick={onOpenLeaderboard}>
          🏆 Leaderboard
        </Button>
        <Button variant="outline" fullWidth onClick={onOpenProfile}>
          👤 My Profile
        </Button>
        <Button variant="outline" fullWidth onClick={onOpenHowTo}>
          ❓ How to Play
        </Button>
        <Button variant="outline" fullWidth onClick={onOpenTrending} className="sm:col-span-2">
          🌟 Trending
        </Button>
      </div>

      {profile && (
        <button className="flex flex-col gap-1 mt-2 text-left group" onClick={onOpenLevelUp}>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[var(--color-primary)] transition-colors">
            Level {profile.level} · {profile.label} →
          </span>
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${levelProgress}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">
            {profile.approxDecodesToNextLevel} more decode{profile.approxDecodesToNextLevel === 1 ? '' : 's'} to{' '}
            {profile.nextLevelLabel}
          </span>
        </button>
      )}
    </div>
  );

  if (!onClose) return content;

  return <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">{content}</div>;
};
