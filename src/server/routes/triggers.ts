import { Hono } from 'hono';
import type { OnAppInstallRequest, TriggerResponse } from '@devvit/web/shared';

export const triggers = new Hono();

// onAppInstall is intentionally a no-op beyond logging — EmojiCode's core
// loop is instant-publish on submission (Section 6), not a seeded/scheduled
// post. Optionally seed a welcome post here manually during first setup if
// you want the feed non-empty for early testers (Section 17, Risks).
triggers.post('/on-app-install', async (c) => {
  const input = await c.req.json<OnAppInstallRequest>();
  console.log(`EmojiCode installed (trigger: ${input.type})`);

  return c.json<TriggerResponse>(
    { status: 'success', message: 'EmojiCode installed. Use the "Create a Cipher" subreddit menu item to post the first one.' },
    200
  );
});
