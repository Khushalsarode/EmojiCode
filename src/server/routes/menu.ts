import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { getOrCreateHubPost } from '../core/post';

export const menu = new Hono();

// Subreddit menu shortcut — jumps to the persistent "Welcome to EmojiCode"
// hub post (Section 13.1's Home Menu), creating it once if it doesn't exist
// yet. This is the app's one true entry point: every cipher post is created
// from the hub's own "✨ Create a Cipher" button, not from this menu.
menu.post('/open-submit-form', async (c) => {
  const result = await getOrCreateHubPost();

  if (result.status === 'rejected') {
    return c.json<UiResponse>({ showToast: `Couldn't open the EmojiCode hub: ${result.reason}` }, 200);
  }

  return c.json<UiResponse>(
    {
      navigateTo: result.postUrl,
      showToast: result.created
        ? { text: 'EmojiCode hub created! Tap ✨ Create a Cipher to post your first one.', appearance: 'success' }
        : undefined,
    },
    200
  );
});
