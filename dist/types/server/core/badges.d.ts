export type BadgeDef = {
    id: string;
    icon: string;
    label: string;
    tier?: 1 | 2 | 3;
};
export declare const BADGE_DEFS: Record<string, BadgeDef>;
export declare const awardMilestoneBadges: (profile: {
    badges: string[];
    currentStreak: number;
    totalDecodes: number;
}) => string[];
export declare const awardCipherMasterBadges: (profile: {
    badges: string[];
    cipherMasterScore: number;
}) => string[];
export declare const toBadgeChips: (badgeIds: string[]) => BadgeDef[];
