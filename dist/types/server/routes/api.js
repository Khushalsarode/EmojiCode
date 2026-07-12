import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import { keys, defaultUserProfile, currentIsoWeek, todayUtc } from '../core/storage';
import { scoreGuess, censorGuess, hintPattern } from '../core/matching';
import { processGuess } from '../core/guessing';
import { isCommand } from '../core/commands';
import { computeLevel, baseDailySubmissionLimit, getTierByLevel, XP_REWARDS, LEVEL_TIERS } from '../core/leveling';
import { createCipherPost } from '../core/post';
import { toBadgeChips } from '../core/badges';
import { syncCipherUpvotes } from '../core/upvotes';
import { computeCipherStats } from '../core/difficulty';
import { getCipherOfDayPostId } from '../core/dailyChallenge';
export const api = new Hono();
const loadCipher = async (postId) => {
    const raw = await redis.get(keys.cipher(postId));
    return raw ? JSON.parse(raw) : null;
};
const toPublicPost = (cipher, submitterLabel, cipherOfDayId) => ({
    postId: cipher.postId,
    submitterUserId: cipher.submitterUserId,
    submitterUsername: cipher.submitterUsername,
    submitterLabel,
    emojis: cipher.emojis,
    category: cipher.category,
    // Defensive fallback for cipher records created before language was tracked.
    language: (cipher.language ?? 'English'),
    publishedAt: cipher.publishedAt,
    decoderCount: cipher.decoderList.length,
    firstCrackUsername: cipher.firstCrackUsername,
    upvotes: cipher.upvotes,
    hardMode: Boolean(cipher.hardMode),
    answerHint: hintPattern(cipher.answer),
    stats: computeCipherStats(cipher),
    isCipherOfDay: cipherOfDayId !== null && cipher.postId === cipherOfDayId,
});
// Shared "almost there" + streak-at-risk derivation (Home Menu/Profile Card
// retention teasers) — used by both /init (lightweight, for splash.tsx's
// home screen) and /profile (the full Profile Card), so the two can never
// disagree about how close the viewer is to leveling up.
const computeProgressInfo = (profile) => {
    const tier = computeLevel(profile.xp);
    const nextTier = getTierByLevel(tier.level + 1);
    const xpToNextLevel = tier.xpEnd !== null ? Math.max(0, tier.xpEnd + 1 - profile.xp) : 0;
    const approxDecodesToNextLevel = Math.max(1, Math.ceil(xpToNextLevel / XP_REWARDS.CORRECT_GUESS));
    const streakAtRisk = profile.currentStreak > 0 && profile.lastActiveDate !== todayUtc();
    return { tier, xpToNextLevel, nextLevelLabel: nextTier.label, approxDecodesToNextLevel, streakAtRisk };
};
api.post('/submit-cipher', async (c) => {
    const body = await c.req.json();
    const result = await createCipherPost(body.emojis, body.answer, Boolean(body.hardMode), body.category, body.language);
    if (result.status === 'rejected') {
        return c.json({ status: 'rejected', reason: result.reason }, 400);
    }
    return c.json({ status: 'published', postId: result.postId, postUrl: result.postUrl }, 200);
});
api.get('/level/:level', (c) => {
    const level = Number(c.req.param('level'));
    if (!Number.isFinite(level) || level < 1) {
        return c.json({ status: 'error', message: 'Invalid level' }, 400);
    }
    const tier = getTierByLevel(Math.floor(level));
    return c.json({
        type: 'level',
        tier: {
            level: tier.level,
            label: tier.label,
            xpRangeStart: tier.xpStart,
            xpRangeEnd: tier.xpEnd,
            rewards: tier.rewards,
        },
    });
});
api.get('/init', async (c) => {
    const { postId, userId } = context;
    if (!postId) {
        return c.json({ status: 'error', message: 'postId missing from context' }, 400);
    }
    const viewerUsername = (await reddit.getCurrentUsername()) ?? 'anonymous';
    // Lightweight retention fields (streak-at-risk, almost-there) — cheap to
    // compute here since splash.tsx deliberately never fetches full profile
    // data (see 04_DEVVIT_WEB_BUILD_SKILL.md Section 3), so this is the only
    // way its home screen can show them.
    const viewerProfileRaw = userId ? await redis.get(keys.user(userId)) : null;
    const viewerProfile = viewerProfileRaw
        ? JSON.parse(viewerProfileRaw)
        : userId
            ? defaultUserProfile(userId, viewerUsername)
            : null;
    const progress = viewerProfile
        ? computeProgressInfo(viewerProfile)
        : { xpToNextLevel: 0, nextLevelLabel: 'Rookie Decoder', approxDecodesToNextLevel: 1, streakAtRisk: false };
    const cipher = await loadCipher(postId);
    // No cipher record for this postId means it's the persistent hub post
    // (Section 13.1's Home Menu), not a rejection — the client renders the
    // Home Menu as the main page instead of the guess UI when post is null.
    if (!cipher) {
        return c.json({
            type: 'init',
            post: null,
            viewerUsername,
            viewerHasSolved: false,
            viewerStreak: viewerProfile?.currentStreak ?? 0,
            viewerStreakAtRisk: progress.streakAtRisk,
            viewerXpToNextLevel: progress.xpToNextLevel,
            viewerNextLevelLabel: progress.nextLevelLabel,
            viewerApproxDecodesToNextLevel: progress.approxDecodesToNextLevel,
        });
    }
    await syncCipherUpvotes(cipher);
    const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
    const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
    const submitterLabel = submitterProfile ? computeLevel(submitterProfile.xp).label : 'Rookie Decoder';
    const cipherOfDayId = await getCipherOfDayPostId();
    return c.json({
        type: 'init',
        post: toPublicPost(cipher, submitterLabel, cipherOfDayId),
        viewerUsername,
        viewerHasSolved: cipher.decoderList.some((d) => d.username === viewerUsername),
        viewerStreak: viewerProfile?.currentStreak ?? 0,
        viewerStreakAtRisk: progress.streakAtRisk,
        viewerXpToNextLevel: progress.xpToNextLevel,
        viewerNextLevelLabel: progress.nextLevelLabel,
        viewerApproxDecodesToNextLevel: progress.approxDecodesToNextLevel,
    });
});
api.post('/guess', async (c) => {
    const { postId, userId } = context;
    if (!postId || !userId) {
        return c.json({ status: 'error', message: 'Missing context' }, 400);
    }
    const { guessText } = await c.req.json();
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    // Post as a real comment first, then score. Mark the comment so onCommentSubmit
    // does not double-count this guess.
    const comment = await reddit.submitComment({
        id: postId.startsWith('t3_') ? postId : `t3_${postId}`,
        text: guessText,
        runAs: 'USER',
    });
    // `!` commands (core/commands.ts) are handled by the onCommentSubmit trigger
    // once this comment lands — don't also score them as a (guaranteed-wrong) guess.
    if (isCommand(guessText)) {
        return c.json({
            type: 'guess',
            matched: false,
            closeMatch: false,
            xpAwarded: 0,
            firstCrack: false,
            solveRank: 0,
            newStreak: 0,
            newXp: 0,
            newLevel: 0,
            newLabel: '',
            leveledUp: false,
        });
    }
    const result = await processGuess({
        postId,
        userId,
        username,
        guessText,
        commentId: comment.id,
    });
    if (!result) {
        return c.json({
            type: 'guess',
            matched: false,
            closeMatch: false,
            xpAwarded: 0,
            firstCrack: false,
            solveRank: 0,
            newStreak: 0,
            newXp: 0,
            newLevel: 0,
            newLabel: '',
            leveledUp: false,
        });
    }
    return c.json(result);
});
api.post('/give-up', async (c) => {
    const { postId } = context;
    if (!postId) {
        return c.json({ status: 'error', message: 'postId missing' }, 400);
    }
    const cipher = await loadCipher(postId);
    if (!cipher) {
        return c.json({ status: 'error', message: 'Cipher not found' }, 404);
    }
    cipher.skips = (cipher.skips ?? 0) + 1;
    await redis.set(keys.cipher(postId), JSON.stringify(cipher));
    return c.json({ answer: cipher.answer });
});
api.get('/profile', async (c) => {
    const { userId } = context;
    if (!userId) {
        return c.json({ status: 'error', message: 'userId missing from context' }, 400);
    }
    const username = (await reddit.getCurrentUsername()) ?? 'anonymous';
    const profileRaw = await redis.get(keys.user(userId));
    const profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
    const progress = computeProgressInfo(profile);
    const tier = progress.tier;
    // Best-post upvotes for the Personal Profile Card (Section 13.10) — sampled
    // live from Reddit rather than the stored (never-synced) cipher.upvotes
    // field, capped to the 5 most recent posts to keep this endpoint fast.
    // Non-fatal: a Reddit API hiccup here shouldn't break the whole profile view.
    const bestPostUpvotes = await (async () => {
        try {
            const cipherListRaw = await redis.get(keys.userCiphers(userId));
            const postIds = cipherListRaw ? JSON.parse(cipherListRaw) : [];
            const scores = await Promise.all(postIds.slice(0, 5).map(async (id) => {
                try {
                    const p = await reddit.getPostById(id.startsWith('t3_') ? id : `t3_${id}`);
                    return p.score;
                }
                catch {
                    return 0;
                }
            }));
            return scores.length > 0 ? Math.max(...scores) : 0;
        }
        catch {
            return 0;
        }
    })();
    return c.json({
        type: 'profile',
        username: profile.username || username,
        xp: profile.xp,
        level: tier.level,
        label: tier.label,
        xpRangeStart: tier.xpStart,
        xpRangeEnd: tier.xpEnd,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        streakAtRisk: progress.streakAtRisk,
        totalDecodes: profile.totalDecodes,
        totalPostsCreated: profile.totalPostsCreated,
        bestPostUpvotes,
        rewardsUnlocked: LEVEL_TIERS.filter((t) => t.level <= tier.level).flatMap((t) => t.rewards),
        dailySubmissionLimit: baseDailySubmissionLimit(tier.level),
        allTiers: LEVEL_TIERS.map((t) => ({
            level: t.level,
            label: t.label,
            xpRangeStart: t.xpStart,
            xpRangeEnd: t.xpEnd,
            rewards: t.rewards,
        })),
        badges: toBadgeChips(profile.badges ?? []),
        xpToNextLevel: progress.xpToNextLevel,
        nextLevelLabel: progress.nextLevelLabel,
        approxDecodesToNextLevel: progress.approxDecodesToNextLevel,
    });
});
api.get('/my-ciphers', async (c) => {
    const { userId, subredditName } = context;
    if (!userId) {
        return c.json({ status: 'error', message: 'userId missing' }, 400);
    }
    const listRaw = await redis.get(keys.userCiphers(userId));
    const postIds = listRaw ? JSON.parse(listRaw) : [];
    const cipherOfDayId = await getCipherOfDayPostId();
    const ciphers = (await Promise.all(postIds.map(async (id) => {
        const cipher = await loadCipher(id);
        if (!cipher)
            return null;
        const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
        const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
        const submitterLabel = submitterProfile
            ? computeLevel(submitterProfile.xp).label
            : 'Rookie Decoder';
        return {
            ...toPublicPost(cipher, submitterLabel, cipherOfDayId),
            postUrl: subredditName
                ? `https://www.reddit.com/r/${subredditName}/comments/${cipher.postId}`
                : `https://www.reddit.com/comments/${cipher.postId}`,
        };
    }))).filter((p) => p !== null);
    return c.json({ type: 'my-ciphers', ciphers });
});
// Trending rail — Level 6's "Featured eligibility" reward (Section 7.1).
// Only posts from Level 6+ submitters are eligible, ranked by live upvotes.
const TRENDING_MIN_LEVEL = 6;
api.get('/trending', async (c) => {
    const { subredditName } = context;
    const topIds = await redis.zRange(keys.trending(), 0, 49, { reverse: true, by: 'rank' });
    const cipherOfDayId = await getCipherOfDayPostId();
    const posts = (await Promise.all(topIds.map(async ({ member: id }) => {
        const cipher = await loadCipher(id);
        if (!cipher)
            return null;
        const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
        const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
        const tier = computeLevel(submitterProfile?.xp ?? 0);
        if (tier.level < TRENDING_MIN_LEVEL)
            return null;
        return {
            ...toPublicPost(cipher, tier.label, cipherOfDayId),
            postUrl: subredditName
                ? `https://www.reddit.com/r/${subredditName}/comments/${cipher.postId}`
                : `https://www.reddit.com/comments/${cipher.postId}`,
        };
    })))
        .filter((p) => p !== null)
        .slice(0, 10);
    return c.json({ type: 'trending', posts });
});
api.get('/leaderboard', async (c) => {
    const { userId } = context;
    const window = (c.req.query('window') ?? 'alltime');
    const board = (c.req.query('board') ?? 'decoders');
    const key = board === 'cipherMasters'
        ? window === 'weekly'
            ? keys.cipherMasterWeekly(currentIsoWeek())
            : keys.cipherMasterAllTime()
        : window === 'weekly'
            ? keys.leaderboardWeekly(currentIsoWeek())
            : keys.leaderboardAllTime();
    const top = await redis.zRange(key, 0, 24, { reverse: true, by: 'rank' });
    const entries = await Promise.all(top.map(async (entry) => {
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
    }));
    let viewerRank = null;
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
            viewerStreak = JSON.parse(profileRaw).currentStreak;
        }
    }
    return c.json({
        type: 'leaderboard',
        board,
        window,
        entries,
        viewerRank,
        viewerStreak,
    });
});
api.get('/recap', async (c) => {
    const { postId } = context;
    if (!postId) {
        return c.json({ status: 'error', message: 'postId missing' }, 400);
    }
    const cipher = await loadCipher(postId);
    if (!cipher) {
        return c.json({ status: 'error', message: 'Cipher not found' }, 404);
    }
    await syncCipherUpvotes(cipher);
    const submitterProfileRaw = await redis.get(keys.user(cipher.submitterUserId));
    const submitterProfile = submitterProfileRaw ? JSON.parse(submitterProfileRaw) : null;
    const submitterLabel = submitterProfile ? computeLevel(submitterProfile.xp).label : 'Rookie Decoder';
    const cipherOfDayId = await getCipherOfDayPostId();
    const distribution = Object.entries(cipher.guessDistribution)
        .map(([text, count]) => {
        const isCorrect = scoreGuess(text, cipher.answer).matched;
        return {
            guessTextCensored: isCorrect ? cipher.answer : censorGuess(text),
            count,
            isCorrectAnswer: isCorrect,
        };
    })
        .sort((a, b) => b.count - a.count);
    return c.json({
        type: 'recap',
        post: toPublicPost(cipher, submitterLabel, cipherOfDayId),
        distribution,
    });
});
//# sourceMappingURL=api.js.map