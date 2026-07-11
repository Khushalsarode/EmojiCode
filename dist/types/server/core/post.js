// Instant-publish mechanic — see 01_PRODUCT_DOCUMENTATION.md, Section 6 (Step 3)
// and 04_DEVVIT_WEB_BUILD_SKILL.md, Section 6. This is the exact Pixelary-style
// "submit and it's live immediately" call: reddit.submitCustomPost() runs
// synchronously inside the form-submit handler, gated only by runSafetyCheck.
import { reddit, redis, context } from '@devvit/web/server';
import { runSafetyCheck } from './safety';
import { keys, defaultUserProfile } from './storage';
import { XP_REWARDS } from './leveling';
export const createCipherPost = async (emojis, answer) => {
    if (emojis.length !== 5) {
        return { status: 'rejected', reason: 'Pick exactly 5 emojis.' };
    }
    const safety = await runSafetyCheck(emojis, answer);
    if (!safety.passed) {
        return { status: 'rejected', reason: safety.reason ?? 'Rejected by safety check.' };
    }
    const { subredditName, userId } = context;
    if (!subredditName || !userId) {
        return { status: 'rejected', reason: 'Missing subreddit or user context.' };
    }
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    // INSTANT PUBLISH — the actual Pixelary-style mechanism.
    const post = await reddit.submitCustomPost({
        subredditName,
        title: `EmojiCode: ${emojis.join(' ')}`,
        entry: 'default',
    });
    const record = {
        postId: post.id,
        submitterUserId: userId,
        submitterUsername: username,
        emojis,
        category: 'Other',
        answer,
        publishedAt: Date.now(),
        upvotes: 0,
        decoderList: [],
        firstCrackUserId: null,
        firstCrackUsername: null,
        guessDistribution: {},
    };
    await redis.set(keys.cipher(post.id), JSON.stringify(record));
    // Award submission XP and bump totalPostsCreated.
    const profileRaw = await redis.get(keys.user(userId));
    const profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
    profile.xp += XP_REWARDS.CIPHER_PUBLISHED;
    profile.totalPostsCreated += 1;
    await redis.set(keys.user(userId), JSON.stringify(profile));
    return {
        status: 'published',
        postId: post.id,
        postUrl: `https://reddit.com/r/${subredditName}/comments/${post.id}`,
    };
};
//# sourceMappingURL=post.js.map