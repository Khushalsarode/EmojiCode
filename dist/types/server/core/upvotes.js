// Syncs a cipher post's live Reddit upvote count and awards the "creativity
// score" XP described in 01_PRODUCT_DOCUMENTATION.md Section 7 / 7.1 — +2 XP
// per net upvote, capped at 100 XP per post so one viral post can't trivially
// max out a level. Also feeds the Trending sorted set (Level 6's "Featured
// eligibility" reward, Section 7.1).
//
// Pull-based (synced whenever the post is viewed via /api/init or /api/recap)
// rather than scheduler-based: Reddit doesn't push vote-count events to
// Devvit apps, and adding the Scheduler permission solely for this isn't
// justified — see 03_REDDIT_APP_SETUP.md Section 5 on not over-requesting scopes.
import { reddit, redis } from '@devvit/web/server';
import { keys, defaultUserProfile, currentIsoWeek } from './storage';
import { XP_REWARDS } from './leveling';
import { awardCipherMasterBadges } from './badges';
export const syncCipherUpvotes = async (cipher) => {
    try {
        const post = await reddit.getPostById(cipher.postId.startsWith('t3_') ? cipher.postId : `t3_${cipher.postId}`);
        const liveScore = post.score;
        if (liveScore !== cipher.upvotes) {
            cipher.upvotes = liveScore;
            await redis.zAdd(keys.trending(), { member: cipher.postId, score: Math.max(0, liveScore) });
        }
        const awardedSoFar = cipher.upvoteXpAwarded ?? 0;
        const targetTotal = Math.min(Math.max(0, liveScore) * XP_REWARDS.PER_UPVOTE, XP_REWARDS.MAX_UPVOTE_XP_PER_POST);
        const xpToAward = Math.max(0, targetTotal - awardedSoFar);
        if (xpToAward > 0) {
            const profileRaw = await redis.get(keys.user(cipher.submitterUserId));
            const profile = profileRaw
                ? JSON.parse(profileRaw)
                : defaultUserProfile(cipher.submitterUserId, cipher.submitterUsername);
            profile.xp += xpToAward;
            profile.cipherMasterScore += xpToAward;
            profile.badges = awardCipherMasterBadges(profile);
            await redis.set(keys.user(cipher.submitterUserId), JSON.stringify(profile));
            await redis.zAdd(keys.leaderboardAllTime(), { member: cipher.submitterUserId, score: profile.xp });
            await redis.zAdd(keys.leaderboardWeekly(currentIsoWeek()), {
                member: cipher.submitterUserId,
                score: profile.xp,
            });
            await redis.zAdd(keys.cipherMasterAllTime(), {
                member: cipher.submitterUserId,
                score: profile.cipherMasterScore,
            });
            await redis.zAdd(keys.cipherMasterWeekly(currentIsoWeek()), {
                member: cipher.submitterUserId,
                score: profile.cipherMasterScore,
            });
            cipher.upvoteXpAwarded = awardedSoFar + xpToAward;
        }
        await redis.set(keys.cipher(cipher.postId), JSON.stringify(cipher));
    }
    catch (err) {
        console.log('Upvote sync failed (non-fatal)', err);
    }
    return cipher;
};
//# sourceMappingURL=upvotes.js.map