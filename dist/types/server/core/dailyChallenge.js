// "Cipher of the Day" — a daily featured pick from the live post pool, plus
// a small bonus-XP tag for solving it. Retention hook (hackathon brief names
// "daily challenges" explicitly): gives every player a specific reason to
// open the app today, not just "eventually." Picked by a scheduled cron
// (routes/cron.ts's /cipher-of-day, devvit.json's `daily-cipher` task)
// rather than computed on the fly, so every viewer sees the same pick and it
// doesn't change mid-day if the trending rankings shift.
import { redis } from '@devvit/web/server';
import { keys, todayUtc } from './storage';
export const DAILY_BONUS_XP = 10;
const readStored = async () => {
    const raw = await redis.get(keys.cipherOfDay());
    return raw ? JSON.parse(raw) : null;
};
// Returns today's featured postId, or null if none has been picked yet
// today (e.g. the cron hasn't run, or there's no eligible post pool).
export const getCipherOfDayPostId = async () => {
    const stored = await readStored();
    return stored && stored.date === todayUtc() ? stored.postId : null;
};
// Picks today's featured cipher from the trending sorted set (every live
// cipher post with a synced upvote count — not just the Level 6+ subset the
// Trending *rail* filters down to for display, see routes/api.ts). Avoids
// repeating yesterday's pick when the pool is large enough to not need to.
// Idempotent per day: calling this again after today's pick already exists
// just returns it, so a retried/duplicate cron run can't cause a re-pick.
export const pickCipherOfDay = async () => {
    const today = todayUtc();
    const stored = await readStored();
    if (stored && stored.date === today)
        return stored.postId;
    const candidates = await redis.zRange(keys.trending(), 0, 99, { reverse: true, by: 'rank' });
    if (candidates.length === 0)
        return null;
    const previousId = stored?.postId ?? null;
    const pool = candidates.filter((c) => c.member !== previousId);
    const from = pool.length > 0 ? pool : candidates;
    const pick = from[Math.floor(Math.random() * from.length)];
    await redis.set(keys.cipherOfDay(), JSON.stringify({ postId: pick.member, date: today }));
    return pick.member;
};
//# sourceMappingURL=dailyChallenge.js.map