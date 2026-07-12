// Instant-publish mechanic — see 01_PRODUCT_DOCUMENTATION.md, Section 6 (Step 3)
// and 04_DEVVIT_WEB_BUILD_SKILL.md, Section 6.

import { reddit, redis, context } from '@devvit/web/server';
import { runSafetyCheck } from './safety';
import { inferCategory } from './category';
import { keys, defaultUserProfile, todayUtc, type StoredCipherPost } from './storage';
import { XP_REWARDS, computeLevel, baseDailySubmissionLimit } from './leveling';

export type CreateCipherResult =
  | { status: 'published'; postId: string; postUrl: string }
  | { status: 'rejected'; reason: string };

export const createCipherPost = async (
  emojis: string[],
  answer: string,
  hardMode = false
): Promise<CreateCipherResult> => {
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

  const profileRaw = await redis.get(keys.user(userId));
  const profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
  const tier = computeLevel(profile.xp);
  const dailyLimit = baseDailySubmissionLimit(tier.level);

  if (hardMode && tier.level < 3) {
    return { status: 'rejected', reason: 'Hard Mode unlocks at Level 3 (Code Breaker).' };
  }

  const day = todayUtc();
  const subsRaw = await redis.get(keys.dailySubs(userId, day));
  const subsToday = subsRaw ? Number(subsRaw) : 0;
  if (subsToday >= dailyLimit) {
    return {
      status: 'rejected',
      reason: `Daily limit reached (${dailyLimit} ciphers/day at your level). Come back tomorrow!`,
    };
  }

  // INSTANT PUBLISH — the actual Pixelary-style mechanism.
  const titlePrefix = hardMode ? '🔥 Hard Mode · ' : '';
  const post = await reddit.submitCustomPost({
    subredditName,
    title: `${titlePrefix}EmojiCode: ${emojis.join(' ')}`,
    entry: 'default',
  });

  const record: StoredCipherPost = {
    postId: post.id,
    submitterUserId: userId,
    submitterUsername: username,
    emojis,
    category: inferCategory(answer),
    answer,
    publishedAt: Date.now(),
    upvotes: 0,
    hardMode,
    decoderList: [],
    firstCrackUserId: null,
    firstCrackUsername: null,
    guessDistribution: {},
  };
  await redis.set(keys.cipher(post.id), JSON.stringify(record));

  // Track for My Ciphers + rate limit + XP.
  const cipherListRaw = await redis.get(keys.userCiphers(userId));
  const cipherList: string[] = cipherListRaw ? (JSON.parse(cipherListRaw) as string[]) : [];
  cipherList.unshift(post.id);
  await redis.set(keys.userCiphers(userId), JSON.stringify(cipherList.slice(0, 50)));
  await redis.set(keys.dailySubs(userId, day), String(subsToday + 1));

  profile.xp += XP_REWARDS.CIPHER_PUBLISHED;
  profile.totalPostsCreated += 1;
  profile.username = username;
  await redis.set(keys.user(userId), JSON.stringify(profile));
  await redis.zAdd(keys.leaderboardAllTime(), { member: userId, score: profile.xp });

  return {
    status: 'published',
    postId: post.id,
    postUrl: `https://www.reddit.com/r/${subredditName}/comments/${post.id}`,
  };
};
