// My Rewards screen — dedicated earned-rewards checklist, separate from the
// leaderboard (01_PRODUCT_DOCUMENTATION.md, Section 13.7).
import { Modal } from './Modal';
import type { ProfileResponse } from '../../shared/api';

type Props = {
  profile: ProfileResponse | null;
  onClose: () => void;
};

export const MyRewards = ({ profile, onClose }: Props) => (
  <Modal title="🏅 My Rewards" onClose={onClose}>
    <div className="flex flex-col gap-2">
      {profile && profile.rewardsUnlocked.length > 0 ? (
        profile.rewardsUnlocked.map((reward, i) => (
          <div
            key={i}
            className="list-card list-item-in flex items-center gap-2 text-sm sm:text-base text-gray-800 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2"
            style={{ ['--i' as string]: i }}
          >
            <span className="shrink-0" style={{ color: 'var(--color-success)' }}>✔</span> {reward}
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No rewards earned yet.</div>
      )}
    </div>
  </Modal>
);
