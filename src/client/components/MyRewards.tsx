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
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      {profile && profile.rewardsUnlocked.length > 0 ? (
        profile.rewardsUnlocked.map((reward, i) => (
          <div
            key={i}
            className="list-item-in text-sm sm:text-base text-gray-800 dark:text-gray-100"
            style={{ ['--i' as string]: i }}
          >
            <span style={{ color: 'var(--color-success)' }}>✔</span> {reward}
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-400 dark:text-gray-500">No rewards earned yet.</div>
      )}
    </div>
  </Modal>
);
