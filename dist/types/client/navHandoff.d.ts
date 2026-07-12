export type NavTarget = 'rewards' | 'leaderboard' | 'myciphers' | 'profile' | 'trending' | 'sound' | 'howto' | 'create';
export declare const setNavHandoff: (target: NavTarget) => void;
export declare const readNavHandoff: () => NavTarget | null;
export declare const clearNavHandoff: () => void;
