import { Hono } from 'hono';
import { createCipherPost } from '../core/post';
export const menu = new Hono();
// Subreddit menu shortcut. The real "Create a Cipher" flow lives in the
// in-app modal inside an existing EmojiCode post (Section 13.1 / 13.5), but
// that's a chicken-and-egg problem on a brand-new subreddit with zero posts —
// there's nothing to open yet. So this menu item seeds one starter cipher via
// the same createCipherPost() path and jumps the mod straight to it; from
// there, every subsequent cipher goes through the normal in-app modal.
menu.post('/open-submit-form', async (c) => {
    const result = await createCipherPost(['🎬', '🦁', '👑', '🌅', '🎶'], 'The Lion King');
    if (result.status === 'rejected') {
        return c.json({ showToast: `Couldn't seed a starter post: ${result.reason}` }, 200);
    }
    return c.json({
        navigateTo: result.postUrl,
        showToast: { text: 'Starter cipher posted! Tap ✨ Create a Cipher inside it to post your own.', appearance: 'success' },
    }, 200);
});
//# sourceMappingURL=menu.js.map