import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
// NOTE: zAdd/zRange calls below use the standard Redis sorted-set signature
// ({ member, score } / range-by-rank with reverse option). Devvit's redis
// client is Redis-compatible, but confirm the exact method signature against
// current Devvit docs before relying on this — see 04_DEVVIT_WEB_BUILD_SKILL.md
// for how to verify current APIs rather than trusting this comment blindly.
import { keys, defaultUserProfile, applyStreak, currentIsoWeek, type StoredCipherPost } from '../core/storage';
import { scoreGuess, censorGuess } from '../core/matching';
import { computeLevel, baseDailySubmissionLimit, LEVEL_TIERS, XP_REWARDS } from '../core/leveling';
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
} from '../../shared/api';

export const api = new Hono();

// In-app instant-publish endpoint — called from the "Create a Cipher" modal
// in game.tsx (Section 13.5). See core/post.ts for the actual
// reddit.submitCustomPost() call that makes this instant, Pixelary-style.
api.post('/submit-cipher', async (c) => {
  const { emojis, answer } = await c.req.json<SubmitCipherRequest>();
  const result = await createCipherPost(emojis, answer);

  if (result.status === 'rejected') {
    return c.json<SubmitCipherResponse>({ status: 'rejected', reason: result.reason }, 400);
  }
  return c.json<SubmitCipherResponse>(
    { status: 'published', postId: result.postId, postUrl: result.postUrl },
    200
  );
});

const loadCipher = async (postId: string): Promise<StoredCipherPost | null> => {
  const raw = await redis.get(keys.cipher(postId));
  return raw ? (JSON.parse(raw) as StoredCipherPost) : null;
};

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
    post: {
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
    },
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
  const cipher = await loadCipher(postId);
  if (!cipher) {
    return c.json<ErrorResponse>({ status: 'error', message: 'Cipher not found' }, 404);
  }

  const username = (await reddit.getCurrentUsername()) ?? 'anonymous';

  // Post the guess as a real comment from the guessing user — the comment
  // section stays the actual gameplay surface (Section 3 of the product doc).
  await reddit.submitComment({ id: postId, text: guessText, runAs: 'USER' });

  const result = scoreGuess(guessText, cipher.answer);

  // Tally every guess (censored later at read time) for the Solved Recap.
  cipher.guessDistribution[guessText.trim()] = (cipher.guessDistribution[guessText.trim()] ?? 0) + 1;

  if (!result.matched) {
    await redis.set(keys.cipher(postId), JSON.stringify(cipher));
    return c.json<GuessResponse>({
      type: 'guess',
      matched: false,
      closeMatch: result.closeMatch,
      xpAwarded: 0,
      firstCrack: false,
      newStreak: 0,
      newXp: 0,
      newLevel: 0,
      newLabel: '',
      leveledUp: false,
    });
  }

  const alreadySolved = cipher.decoderList.some((d) => d.userId === userId);
  if (alreadySolved) {
    return c.json<GuessResponse>({
      type: 'guess',
      matched: true,
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

  const firstCrack = cipher.decoderList.length === 0;
  cipher.decoderList.push({ userId, username, guessedAt: Date.now() });
  if (firstCrack) {
    cipher.firstCrackUserId = userId;
    cipher.firstCrackUsername = username;
  }
  await redis.set(keys.cipher(postId), JSON.stringify(cipher));

  const profileRaw = await redis.get(keys.user(userId));
  let profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
  const prevLevel = computeLevel(profile.xp).level;

  const xpAwarded = XP_REWARDS.CORRECT_GUESS + (firstCrack ? XP_REWARDS.FIRST_CRACK_BONUS : 0);
  profile.xp += xpAwarded;
  profile.totalDecodes += 1;
  profile = applyStreak(profile);
  await redis.set(keys.user(userId), JSON.stringify(profile));

  const newTier = computeLevel(profile.xp);
  const leaderboardScore = profile.xp;
  await redis.zAdd(keys.leaderboardAllTime(), { member: userId, score: leaderboardScore });
  await redis.zAdd(keys.leaderboardWeekly(currentIsoWeek()), { member: userId, score: leaderboardScore });

  return c.json<GuessResponse>({
    type: 'guess',
    matched: true,
    closeMatch: false,
    xpAwarded,
    firstCrack,
    newStreak: profile.currentStreak,
    newXp: profile.xp,
    newLevel: newTier.level,
    newLabel: newTier.label,
    leveledUp: newTier.level > prevLevel,
  });
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
  // No penalty, no XP — Section 13.3: "Give up" is a low-pressure affordance.
  return c.json({ answer: cipher.answer });
});

// Backs the Home Menu, My Rewards, and Level-Up screens (Section 13.1/13.7/13.8)
// — level/label are always derived from stored xp, never trusted from the client.
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
    username: profile.username,
    xp: profile.xp,
    level: tier.level,
    label: tier.label,
    xpRangeStart: tier.xpStart,
    xpRangeEnd: tier.xpEnd,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    totalDecodes: profile.totalDecodes,
    totalPostsCreated: profile.totalPostsCreated,
    // Derived from tier thresholds rather than the stored (currently unpopulated)
    // rewardsUnlocked field — level/rewards must stay in lockstep with xp.
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

api.get('/leaderboard', async (c) => {
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

  return c.json<LeaderboardResponse>({ type: 'leaderboard', window, entries, viewerRank: null });
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
    post: {
      postId: cipher.postId,
      submitterUserId: cipher.submitterUserId,
      submitterUsername: cipher.submitterUsername,
      submitterLabel,
      emojis: cipher.emojis,
      category: cipher.category as RecapResponse['post']['category'],
      publishedAt: cipher.publishedAt,
      decoderCount: cipher.decoderList.length,
      firstCrackUsername: cipher.firstCrackUsername,
      upvotes: cipher.upvotes,
    },
    distribution,
  });
});
