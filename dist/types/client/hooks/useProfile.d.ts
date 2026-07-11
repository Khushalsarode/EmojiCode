import type { ProfileResponse } from '../../shared/api';
export declare const useProfile: () => {
    profile: ProfileResponse | null;
    loading: boolean;
    refresh: () => Promise<void>;
};
