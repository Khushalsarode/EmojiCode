import type { ProfileResponse } from '../../shared/api';
type Props = {
    profile: ProfileResponse;
    onClose: () => void;
};
export declare const ProfileCard: ({ profile, onClose }: Props) => import("react").JSX.Element;
export {};
