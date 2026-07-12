import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import { keys, defaultUserProfile, currentIsoWeek, type StoredCipherPost } from '../core/storage';
import { scoreGuess, censorGuess } from '../core/matching';
import { processGuess } from '../core/guessing';
import { computeLevel, baseDailySubmissionLimit, LEVEL_TIERS } from '../core/leveling';
import { createCipherPost } from '../core/post';
import type {
  InitResponse,
  GuessRequest,
  GuessResponse,
  LeaderboardResponse,
  ProfileResponse,
  RecapResponse,
  ErrorResponse,
  GuessDistributionEntry,
  SubmitCipherRequest,
  SubmitCipherResponse,
  MyCiphersResponse,
} from '../../shared/api';

export const api = new Hono();

const loadCipher = async (postId: string): Promise<StoredCipherPost | null> => {
  const raw = await redis.get(keys.cipher(postId));
  return raw ? (JSON.parse(raw) as StoredCipherPost) : null;
};

const toPublicPost = (
  cipher: StoredCipherPost,
  submitterLabel: string
): InitResponse['post'] => ({
  postId: cipher.postId,
  submitterUserId: cipher.submitterUserId,
  submitterUsername: cipher.submitterUsername,
  submitterLabel,
  emojis: cipher.emojis,
  category: cipher.category as InitResponse['post']['category'],
  publishedAt: cipher.publishedAt,
  decoderCount: cipher.decoderList.length,
  firstCrackUsername: cipher.firstCrackUsername,
  upvotes: cipher.upvotes,
  hardMode: Boolean(cipher.hardMode),
});

api.post('/submit-cipher', async (c) => {
  const body = await c.req.json<SubmitCipherRequest>();
  const result = await createCipherPost(body.emojis, body.answer, Boolean(body.hardMode));

  if (result.status === 'rejected') {
    return c.json<SubmitCipherResponse>({ status: 'rejected', reason: result.reason }, 400);
  }
  return c.json<SubmitCipherResponse>(
    { status: 'published', postId: result.postId, postUrl: result.postUrl },
    200
  );
});

api.get('/init', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId missing from context' }, 400);
  }

  const cipher = await loadCipher(postId);
  if (!cipher) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Cipher not found' }, 404);
  }

  const viewerUsername = (await reddit.getCurrentUsername()) ?? 'anonymous';
  const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
  const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
  const submitterLabel = submitterProfile ? computeLevel(submitterProfile.xp).label : 'Rookie Decoder';

  return c.json<InitResponse>({
    type: 'init',
    post: toPublicPost(cipher, submitterLabel),
    viewerUsername,
    viewerHasSolved: cipher.decoderList.some((d) => d.username === viewerUsername),
  });
});

api.post('/guess', async (c) => {
  const { postId, userId } = context;
  if (!postId || !userId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Missing context' }, 400);
  }

  const { guessText } = await c.req.json<GuessRequest>();
  const username = (await reddit.getCurrentUsername()) ?? 'anonymous';

  // Post as a real comment first, then score. Mark the comment so onCommentSubmit
  // does not double-count this guess.
  const comment = await reddit.submitComment({
    id: postId.startsWith('t3_') ? postId : `t3_${postId}`,
    text: guessText,
    runAs: 'USER',
  });

  const result = await processGuess({
    postId,
    userId,
    username,
    guessText,
    commentId: comment.id,
  });

  if (!result) {
    return c.json<GuessResponse>({
      type: 'guess',
      matched: false,
      closeMatch: false,
      xpAwarded: 0,
      firstCrack: false,
      newStreak: 0,
      newXp: 0,
      newLevel: 0,
      newLabel: '',
      leveledUp: false,
    });
  }

  return c.json<GuessResponse>(result);
});

api.post('/give-up', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId missing' }, 400);
  }
  const cipher = await loadCipher(postId);
  if (!cipher) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Cipher not found' }, 404);
  }
  return c.json({ answer: cipher.answer });
});

api.get('/profile', async (c) => {
  const { userId } = context;
  if (!userId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'userId missing from context' }, 400);
  }

  const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
  const profileRaw = await redis.get(keys.user(userId));
  const profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
  const tier = computeLevel(profile.xp);

  return c.json<ProfileResponse>({
    type: 'profile',
    username: profile.username || username,
    xp: profile.xp,
    level: tier.level,
    label: tier.label,
    xpRangeStart: tier.xpStart,
    xpRangeEnd: tier.xpEnd,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    totalDecodes: profile.totalDecodes,
    totalPostsCreated: profile.totalPostsCreated,
    rewardsUnlocked: LEVEL_TIERS.filter((t) => t.level <= tier.level).flatMap((t) => t.rewards),
    dailySubmissionLimit: baseDailySubmissionLimit(tier.level),
    allTiers: LEVEL_TIERS.map((t) => ({
      level: t.level,
      label: t.label,
      xpRangeStart: t.xpStart,
      xpRangeEnd: t.xpEnd,
      rewards: t.rewards,
    })),
  });
});

api.get('/my-ciphers', async (c) => {
  const { userId, subredditName } = context;
  if (!userId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'userId missing' }, 400);
  }

  const listRaw = await redis.get(keys.userCiphers(userId));
  const postIds: string[] = listRaw ? (JSON.parse(listRaw) as string[]) : [];

  const ciphers = (
    await Promise.all(
      postIds.map(async (id) => {
        const cipher = await loadCipher(id);
        if (!cipher) return null;
        const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
        const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
        const submitterLabel = submitterProfile
          ? computeLevel(submitterProfile.xp).label
          : 'Rookie Decoder';
        return {
          ...toPublicPost(cipher, submitterLabel),
          postUrl: subredditName
            ? `https://www.reddit.com/r/${subredditName}/comments/${cipher.postId}`
            : `https://www.reddit.com/comments/${cipher.postId}`,
        };
      })
    )
  ).filter((p) => p !== null);

  return c.json<MyCiphersResponse>({ type: 'my-ciphers', ciphers });
});

api.get('/leaderboard', async (c) => {
  const { userId } = context;
  const window = (c.req.query('window') ?? 'alltime') as 'weekly' | 'alltime';
  const key = window === 'weekly' ? keys.leaderboardWeekly(currentIsoWeek()) : keys.leaderboardAllTime();

  const top = await redis.zRange(key, 0, 24, { reverse: true, by: 'rank' });

  const entries = await Promise.all(
    top.map(async (entry) => {
      const profileRaw = await redis.get(keys.user(entry.member));
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const tier = profile ? computeLevel(profile.xp) : { label: 'Rookie Decoder' };
      return {
        userId: entry.member,
        username: profile?.username ?? entry.member,
        label: tier.label,
        score: entry.score,
        streak: profile?.currentStreak ?? 0,
      };
    })
  );

  let viewerRank: number | null = null;
  let viewerStreak = 0;
  if (userId) {
    const ascendingRank = await redis.zRank(key, userId);
    if (ascendingRank !== undefined) {
      const total = await redis.zCard(key);
      // Higher XP = better; convert ascending rank into 1-based top rank.
      viewerRank = total - ascendingRank;
    }
    const profileRaw = await redis.get(keys.user(userId));
    if (profileRaw) {
      viewerStreak = (JSON.parse(profileRaw) as { currentStreak: number }).currentStreak;
    }
  }

  return c.json<LeaderboardResponse>({
    type: 'leaderboard',
    window,
    entries,
    viewerRank,
    viewerStreak,
  });
});

api.get('/recap', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>({ status: 'error', message: 'postId missing' }, 400);
  }
  const cipher = await loadCipher(postId);
  if (!cipher) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Cipher not found' }, 404);
  }

  const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
  const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
  const submitterLabel = submitterProfile ? computeLevel(submitterProfile.xp).label : 'Rookie Decoder';

  const distribution: GuessDistributionEntry[] = Object.entries(cipher.guessDistribution)
    .map(([text, count]) => {
      const isCorrect = scoreGuess(text, cipher.answer).matched;
      return {
        guessTextCensored: isCorrect ? cipher.answer : censorGuess(text),
        count,
        isCorrectAnswer: isCorrect,
      };
    })
    .sort((a, b) => b.count - a.count);

  return c.json<RecapResponse>({
    type: 'recap',
    post: toPublicPost(cipher, submitterLabel),
    distribution,
  });
});
