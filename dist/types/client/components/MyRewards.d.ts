import type { ProfileResponse } from '../../shared/api';
type Props = {
    profile: ProfileResponse | null;
    onClose: () => void;
};
export declare const MyRewards: ({ profile, onClose }: Props) => import("react").JSX.Element;
export {};
