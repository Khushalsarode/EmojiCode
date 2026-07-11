// My Rewards screen — dedicated earned-rewards checklist, separate from the
// leaderboard (01_PRODUCT_DOCUMENTATION.md, Section 13.7).
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse | null;
  onClose: () => void;
};

export const MyRewards = ({ profile, onClose }: Props) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-lg">🏅 My Rewards</span>
        <button onClick={onClose} className="text-gray-400">✕</button>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        {profile && profile.rewardsUnlocked.length > 0 ? (
          profile.rewardsUnlocked.map((reward, i) => (
            <div key={i} className="text-sm text-gray-800 dark:text-gray-100">
              <span style={{ color: 'var(--color-success)' }}>✔</span> {reward}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-400 dark:text-gray-500">No rewards earned yet.</div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Inventory</div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 text-sm text-gray-400 dark:text-gray-500">
          Your inventory is empty
        </div>
      </div>
    </div>
  </div>
);
