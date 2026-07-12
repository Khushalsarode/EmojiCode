// Personal Profile Card — stretch goal (01_PRODUCT_DOCUMENTATION.md, Section 13.10).
import { Modal } from './Modal';
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse;
  onClose: () => void;
};

export const ProfileCard = ({ profile, onClose }: Props) => {
  const nextTier = profile.allTiers.find((t) => t.level === profile.level + 1);
  const progress =
    profile.xpRangeEnd !== null
      ? Math.min(100, ((profile.xp - profile.xpRangeStart) / (profile.xpRangeEnd - profile.xpRangeStart + 1)) * 100)
      : 100;

  return (
    <Modal title={<span className="font-pixel">u/{profile.username}</span>} onClose={onClose}>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          🏅 {profile.label} · Level {profile.level}
        </div>
        {profile.currentStreak > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <span className="flame-icon">🔥</span> {profile.currentStreak}-day streak
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
          <span className="text-xs font-mono-stat text-gray-500 dark:text-gray-400">
            {profile.xp} / {profile.xpRangeEnd !== null ? profile.xpRangeEnd + 1 : '∞'} XP
            {nextTier ? ` toward ${nextTier.label}` : ''}
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Total decodes:</span>
            <span className="font-mono-stat text-gray-800 dark:text-gray-100">{profile.totalDecodes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Ciphers posted:</span>
            <span className="font-mono-stat text-gray-800 dark:text-gray-100">{profile.totalPostsCreated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Best post (upvotes):</span>
            <span className="font-mono-stat text-gray-800 dark:text-gray-100">{profile.bestPostUpvotes}</span>
          </div>
        </div>

        {profile.badges.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Badges</div>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, i) => (
                <span
                  key={badge.id}
                  title={badge.label}
                  className="badge-pop w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg border hover:scale-110 transition-transform"
                  style={{
                    ['--i' as string]: i,
                    backgroundColor:
                      badge.tier === 1
                        ? 'color-mix(in srgb, #CD7F32 25%, transparent)'
                        : badge.tier === 2
                          ? 'color-mix(in srgb, #C0C0C0 30%, transparent)'
                          : badge.tier === 3
                            ? 'color-mix(in srgb, #FFD700 30%, transparent)'
                            : 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                    borderColor:
                      badge.tier === 1
                        ? '#CD7F32'
                        : badge.tier === 2
                          ? '#C0C0C0'
                          : badge.tier === 3
                            ? '#FFD700'
                            : 'var(--color-primary)',
                  }}
                >
                  {badge.icon}
                </span>
              ))}
            </div>
          </div>
        )}
    </Modal>
  );
};
