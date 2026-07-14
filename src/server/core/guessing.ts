// Shared guess-scoring pipeline used by /api/guess and onCommentSubmit.
// Keeps XP / streak / decoderList / leaderboard updates in one place.

import { redis, reddit, context } from '@devvit/web/server';
import {
  keys,
  defaultUserProfile,
  applyStreak,
  answersFor,
  currentIsoWeek,
  type StoredCipherPost,
} from './storage';
import { scoreGuessAgainstAnswers } from './matching';
import { computeLevel, flairColorForLevel, XP_REWARDS } from './leveling';
import { awardMilestoneBadges } from './badges';
import { DAILY_BONUS_XP, getCipherOfDayPostId } from './dailyChallenge';
import { ordinal, rankMedal, type GuessResponse } from '../../shared/api';

export type ProcessGuessInput = {
  postId: string;
  userId: string;
  username: string;
  guessText: string;
  /** When set, used to dedupe in-app guesses vs the comment trigger. */
  commentId?: string;
  /** Reply under the guess comment on a correct match (comment-trigger path). */
  replyOnMatch?: boolean;
};

const loadCipher = async (postId: string): Promise<StoredCipherPost | null> => {
  const raw = await redis.get(keys.cipher(postId));
  return raw ? (JSON.parse(raw) as StoredCipherPost) : null;
};

const emptyMiss = (): GuessResponse => ({
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
export const processGuess = async (input: ProcessGuessInput): Promise<GuessResponse | null> => {
  const { postId, userId, username, guessText, commentId, replyOnMatch } = input;
  const trimmed = guessText.trim();
  if (!trimmed) return emptyMiss();

  if (commentId) {
    const already = await redis.get(keys.processedComment(commentId));
    if (already) return null;
    // Ephemeral dedup marker (Section 8's "CommentGuess... processed not
    // stored long-term") — only needs to outlive the brief race between the
    // in-app POST and the onCommentSubmit trigger firing for the same comment.
    await redis.set(keys.processedComment(commentId), '1', {
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  const cipher = await loadCipher(postId);
  if (!cipher) return null;
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
    if (!cipher.uniqueGuessers.includes(userId)) cipher.uniqueGuessers.push(userId);
    await redis.set(tallyKey, '1');
  }

  const result = scoreGuessAgainstAnswers(trimmed, answersFor(cipher));

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

  // Keep the sticky "stats" comment (core/post.ts) in sync with the live
  // decode count — non-fatal, the in-app UI is always the source of truth.
  if (cipher.statsCommentId) {
    try {
      const solveCount = cipher.decoderList.length;
      const firstCrackLine = cipher.firstCrackUsername ? ` · 🥇 First Crack: u/${cipher.firstCrackUsername}` : '';
      const statsComment = await reddit.getCommentById(
        cipher.statsCommentId.startsWith('t1_') ? (cipher.statsCommentId as `t1_${string}`) : `t1_${cipher.statsCommentId}`
      );
      await statsComment.edit({
        text: `🔐 **${solveCount}** redditor${solveCount === 1 ? '' : 's'} ${solveCount === 1 ? 'has' : 'have'} cracked this so far.${firstCrackLine}`,
      });
    } catch (err) {
      console.error('Stats comment update failed (non-fatal)', err);
    }
  }

  const profileRaw = await redis.get(keys.user(userId));
  let profile = profileRaw ? JSON.parse(profileRaw) : defaultUserProfile(userId, username);
  const prevLevel = computeLevel(profile.xp).level;

  const isCipherOfDay = (await getCipherOfDayPostId()) === postId;
  const xpAwarded =
    XP_REWARDS.CORRECT_GUESS +
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

  // Optional Reddit flair sync (Section 7.1's "Optional stretch") — mirrors
  // the in-app level/label onto native subreddit flair. Non-fatal: flair is
  // a cosmetic add-on, never a gate on gameplay.
  if (newTier.level > prevLevel && context.subredditName) {
    try {
      await reddit.setUserFlair({
        subredditName: context.subredditName,
        username,
        text: `${newTier.label} · Lv.${newTier.level}`,
        backgroundColor: flairColorForLevel(newTier.level),
        textColor: 'light',
      });
    } catch (err) {
      console.error('Flair sync failed (non-fatal)', err);
    }
  }

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
