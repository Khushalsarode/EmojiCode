// Shared guess-scoring pipeline used by /api/guess and onCommentSubmit.
// Keeps XP / streak / decoderList / leaderboard updates in one place.

import { redis, reddit } from '@devvit/web/server';
import {
  keys,
  defaultUserProfile,
  applyStreak,
  currentIsoWeek,
  type StoredCipherPost,
} from './storage';
import { scoreGuess } from './matching';
import { computeLevel, XP_REWARDS } from './leveling';
import type { GuessResponse } from '../../shared/api';

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
    await redis.set(keys.processedComment(commentId), '1');
  }

  const cipher = await loadCipher(postId);
  if (!cipher) return null;

  // Same user + same normalized guess text only tallies once (blocks API/trigger double-count).
  const tallyKey = keys.guessTally(postId, userId, trimmed.toLowerCase());
  const alreadyTallied = await redis.get(tallyKey);
  if (!alreadyTallied) {
    cipher.guessDistribution[trimmed] = (cipher.guessDistribution[trimmed] ?? 0) + 1;
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
      newStreak: 0,
      newXp: 0,
      newLevel: 0,
      newLabel: '',
      leveledUp: false,
    };
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
  if (firstCrack && !profile.badges.includes('first-crack')) {
    profile.badges.push('first-crack');
  }
  profile = applyStreak(profile);
  await redis.set(keys.user(userId), JSON.stringify(profile));

  const newTier = computeLevel(profile.xp);
  await redis.zAdd(keys.leaderboardAllTime(), { member: userId, score: profile.xp });
  await redis.zAdd(keys.leaderboardWeekly(currentIsoWeek()), { member: userId, score: profile.xp });

  if (replyOnMatch && commentId) {
    const streakLine = profile.currentStreak > 1 ? ` · 🔥 ${profile.currentStreak}-day streak` : '';
    const firstLine = firstCrack ? ' · 🥇 First Crack!' : '';
    const bareId = commentId.replace(/^t1_/, '');
    // Prefix lets the comment trigger skip app replies (avoid recursion).
    await reddit.submitComment({
      id: `t1_${bareId}`,
      text: `✅ Cracked it! (auto-scored) · +${xpAwarded} XP${streakLine}${firstLine}`,
      runAs: 'APP',
    });
  }

  return {
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
  };
};
