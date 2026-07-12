import { Hono } from 'hono';
import { context, reddit, redis } from '@devvit/web/server';
import type { TriggerResponse } from '@devvit/web/shared';
import { keys, currentIsoWeek } from '../core/storage';
import { computeLevel } from '../core/leveling';
import { pickCipherOfDay } from '../core/dailyChallenge';

export const cron = new Hono();

// Daily "Cipher of the Day" pick (see core/dailyChallenge.ts) — scheduled via
// devvit.json's `daily-cipher` task, midnight UTC. Purely additive: picks a
// featured post from the existing trending pool, no new post is created.
cron.post('/daily-cipher', async (c) => {
  await pickCipherOfDay();
  return c.json<TriggerResponse>({});
});

// Weekly leaderboard digest (01_PRODUCT_DOCUMENTATION.md Section 4 Step 7 /
// Section 5 stretch goal) — a purely additive highlight-reel post; nothing in
// the core create/guess loop depends on it. Scheduled via devvit.json's
// `scheduler.tasks` block, which is the one feature that actually justifies
// requesting the Scheduler capability (see 03_REDDIT_APP_SETUP.md Section 5).
cron.post('/leaderboard-digest', async (c) => {
  const { subredditName } = context;
  if (!subredditName) {
    return c.json<TriggerResponse>({});
  }

  const topPlayers = await redis.zRange(keys.leaderboardWeekly(currentIsoWeek()), 0, 4, {
    reverse: true,
    by: 'rank',
  });
  const topPosts = await redis.zRange(keys.trending(), 0, 4, { reverse: true, by: 'rank' });

  if (topPlayers.length === 0 && topPosts.length === 0) {
    return c.json<TriggerResponse>({}); // nothing to report yet — skip quietly
  }

  const playerLines = await Promise.all(
    topPlayers.map(async (entry, i) => {
      const profileRaw = await redis.get(keys.user(entry.member));
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const label = profile ? computeLevel(profile.xp).label : 'Rookie Decoder';
      const username = profile?.username ?? entry.member;
      return `${i + 1}. u/${username} — 🏅 ${label} · ${entry.score} XP`;
    })
  );

  const postLines = await Promise.all(
    topPosts.map(async ({ member: postId, score }, i) => {
      const raw = await redis.get(keys.cipher(postId));
      const cipher = raw ? JSON.parse(raw) : null;
      const emojis = cipher ? cipher.emojis.join(' ') : '?????';
      return `${i + 1}. ${emojis} — 🔺 ${score} upvotes — https://www.reddit.com/r/${subredditName}/comments/${postId}`;
    })
  );

  const body = [
    "## 🏆 This week's top Decoders",
    playerLines.length > 0 ? playerLines.join('\n') : '_No scores yet this week._',
    '',
    '## 🌟 Trending Ciphers',
    postLines.length > 0 ? postLines.join('\n') : '_Nothing trending yet._',
    '',
    "_Auto-generated digest — encode your own in 5 emojis and see if you make next week's list._",
  ].join('\n');

  await reddit.submitPost({
    subredditName,
    title: `📊 EmojiCode Weekly Digest — ${new Date().toISOString().slice(0, 10)}`,
    text: body,
  });

  return c.json<TriggerResponse>({});
});
