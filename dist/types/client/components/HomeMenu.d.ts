import type { ProfileResponse } from '../../shared/api';
type Props = {
    profile: ProfileResponse | null;
    onClose: () => void;
    onCreateCipher: () => void;
    onOpenRewards: () => void;
    onOpenLeaderboard: () => void;
    onOpenLevelUp: () => void;
};
export declare const HomeMenu: ({ profile, onClose, onCreateCipher, onOpenRewards, onOpenLeaderboard, onOpenLevelUp, }: Props) => import("react").JSX.Element;
export {};
