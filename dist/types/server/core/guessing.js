// Shared guess-scoring pipeline used by /api/guess and onCommentSubmit.
// Keeps XP / streak / decoderList / leaderboard updates in one place.
import { redis, reddit } from '@devvit/web/server';
import { keys, defaultUserProfile, applyStreak, currentIsoWeek, } from './storage';
import { scoreGuess } from './matching';
import { computeLevel, XP_REWARDS } from './leveling';
import { awardMilestoneBadges } from './badges';
import { DAILY_BONUS_XP, getCipherOfDayPostId } from './dailyChallenge';
import { ordinal, rankMedal } from '../../shared/api';
const loadCipher = async (postId) => {
    const raw = await redis.get(keys.cipher(postId));
    return raw ? JSON.parse(raw) : null;
};
const emptyMiss = () => ({
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
/**
 * Scores a guess against the cipher for `postId`.
 * Returns null when this event was already processed (dedupe).
 */
export const processGuess = async (input) => {
    const { postId, userId, username, guessText, commentId, replyOnMatch } = input;
    const trimmed = guessText.trim();
    if (!trimmed)
        return emptyMiss();
    if (commentId) {
        const already = await redis.get(keys.processedComment(commentId));
        if (already)
            return null;
        // Ephemeral dedup marker (Section 8's "CommentGuess... processed not
        // stored long-term") — only needs to outlive the brief race between the
        // in-app POST and the onCommentSubmit trigger firing for the same comment.
        await redis.set(keys.processedComment(commentId), '1', {
            expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    }
    const cipher = await loadCipher(postId);
    if (!cipher)
        return null;
    // Defensive backfill for cipher records created before live-stats tracking.
    cipher.totalGuesses ??= 0;
    cipher.uniqueGuessers ??= [];
    cipher.skips ??= 0;
    // Same user + same normalized guess text only tallies once (blocks API/trigger double-count).
    const tallyKey = keys.guessTally(postId, userId, trimmed.toLowerCase());
    const alreadyTallied = await redis.get(tallyKey);
    if (!alreadyTallied) {
        cipher.guessDistribution[trimmed] = (cipher.guessDistribution[trimmed] ?? 0) + 1;
        cipher.totalGuesses += 1;
        if (!cipher.uniqueGuessers.includes(userId))
            cipher.uniqueGuessers.push(userId);
        await redis.set(tallyKey, '1');
    }
    const result = scoreGuess(trimmed, cipher.answer);
    if (!result.matched) {
        await redis.set(keys.cipher(postId), JSON.stringify(cipher));
        return {
            ...emptyMiss(),
            closeMatch: result.closeMatch,
        };
    }
    const alreadySolved = cipher.decoderList.some((d) => d.userId === userId);
    if (alreadySolved) {
        await redis.set(keys.cipher(postId), JSON.stringify(cipher));
        return {
            type: 'guess',
            matched: true,
            closeMatch: false,
            xpAwarded: 0,
            firstCrack: false,
            solveRank: 0,
            newStreak: 0,
            newXp: 0,
            newLevel: 0,
            newLabel: '',
            leveledUp: false,
        };
    }
    const firstCrack = cipher.decoderList.length === 0;
    const solveRank = cipher.decoderList.length + 1;
    cipher.decoderList.push({ userId, username, guessedAt: Date.now() });
    if (firstCrack) {
        cipher.firstCrackUserId = userId;
        cipher.firstCrackUsername = username;
    }
    await redis.set(keys.cipher(postId), JSON.stringify(cipher));
    const profileRaw = await redis.get(keys.user(userId));
    let profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
    const prevLevel = computeLevel(profile.xp).level;
    const isCipherOfDay = (await getCipherOfDayPostId()) === postId;
    const xpAwarded = XP_REWARDS.CORRECT_GUESS +
        (firstCrack ? XP_REWARDS.FIRST_CRACK_BONUS : 0) +
        (isCipherOfDay ? DAILY_BONUS_XP : 0);
    profile.xp += xpAwarded;
    profile.totalDecodes += 1;
    if (firstCrack && !profile.badges.includes('first-crack')) {
        profile.badges.push('first-crack');
    }
    profile = applyStreak(profile);
    profile.badges = awardMilestoneBadges(profile);
    await redis.set(keys.user(userId), JSON.stringify(profile));
    const newTier = computeLevel(profile.xp);
    await redis.zAdd(keys.leaderboardAllTime(), { member: userId, score: profile.xp });
    await redis.zAdd(keys.leaderboardWeekly(currentIsoWeek()), { member: userId, score: profile.xp });
    if (replyOnMatch && commentId) {
        const streakLine = profile.currentStreak > 1 ? ` · 🔥 ${profile.currentStreak}-day streak` : '';
        const rankLine = firstCrack ? ' · 🥇 First Crack!' : ` · ${rankMedal(solveRank)} ${ordinal(solveRank)} to solve this one`;
        const bareId = commentId.replace(/^t1_/, '');
        // Prefix lets the comment trigger skip app replies (avoid recursion).
        await reddit.submitComment({
            id: `t1_${bareId}`,
            text: `✅ Cracked it! (auto-scored) · +${xpAwarded} XP${streakLine}${rankLine}`,
            runAs: 'APP',
        });
    }
    return {
        type: 'guess',
        matched: true,
        closeMatch: false,
        xpAwarded,
        firstCrack,
        solveRank,
        newStreak: profile.currentStreak,
        newXp: profile.xp,
        newLevel: newTier.level,
        newLabel: newTier.label,
        leveledUp: newTier.level > prevLevel,
    };
};
//# sourceMappingURL=guessing.js.map