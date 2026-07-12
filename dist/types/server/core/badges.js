// Achievement badges — auto-awarded the instant their trigger condition is
// met (01_PRODUCT_DOCUMENTATION.md, Section 7: "First Crack per post, streak
// milestones, decode milestones, Cipher Master standing"). Pure functions so
// award logic can't drift between the in-app guess path, the onCommentSubmit
// trigger path, and the upvote-sync path.
export const BADGE_DEFS = {
    'first-crack': { id: 'first-crack', icon: '🥇', label: 'First Crack' },
    'first-submission': { id: 'first-submission', icon: '✨', label: 'First Cipher Posted' },
    'streak-3': { id: 'streak-3', icon: '🔥', label: '3-Day Streak', tier: 1 },
    'streak-7': { id: 'streak-7', icon: '🔥', label: '7-Day Streak', tier: 2 },
    'streak-30': { id: 'streak-30', icon: '🔥', label: '30-Day Streak', tier: 3 },
    'decode-10': { id: 'decode-10', icon: '🎯', label: '10 Decodes', tier: 1 },
    'decode-50': { id: 'decode-50', icon: '🎯', label: '50 Decodes', tier: 2 },
    'decode-100': { id: 'decode-100', icon: '🎯', label: '100 Decodes', tier: 3 },
    'cipher-master-100': { id: 'cipher-master-100', icon: '👑', label: 'Cipher Master', tier: 1 },
    'cipher-master-500': { id: 'cipher-master-500', icon: '👑', label: 'Elite Cipher Master', tier: 2 },
    'cipher-master-1000': { id: 'cipher-master-1000', icon: '👑', label: 'Legendary Cipher Master', tier: 3 },
};
const STREAK_MILESTONES = [3, 7, 30];
const DECODE_MILESTONES = [10, 50, 100];
const CIPHER_MASTER_MILESTONES = [100, 500, 1000];
// Returns the full updated badge list (existing + any newly earned) given the
// profile's current stats. Idempotent — safe to call on every XP-earning event.
export const awardMilestoneBadges = (profile) => {
    const badges = new Set(profile.badges);
    for (const n of STREAK_MILESTONES) {
        if (profile.currentStreak >= n)
            badges.add(`streak-${n}`);
    }
    for (const n of DECODE_MILESTONES) {
        if (profile.totalDecodes >= n)
            badges.add(`decode-${n}`);
    }
    return Array.from(badges);
};
// Cipher Master standing (Section 7) — separate from awardMilestoneBadges
// since it's driven by upvote-XP sync (core/upvotes.ts), not the guess path.
export const awardCipherMasterBadges = (profile) => {
    const badges = new Set(profile.badges);
    for (const n of CIPHER_MASTER_MILESTONES) {
        if (profile.cipherMasterScore >= n)
            badges.add(`cipher-master-${n}`);
    }
    return Array.from(badges);
};
export const toBadgeChips = (badgeIds) => badgeIds.map((id) => BADGE_DEFS[id]).filter((def) => Boolean(def));
//# sourceMappingURL=badges.js.map