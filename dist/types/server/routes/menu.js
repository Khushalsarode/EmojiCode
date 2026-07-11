import { Hono } from 'hono';
export const menu = new Hono();
// Subreddit menu shortcut. Kept simple and dependency-free (no native form
// schema — see routes/forms.ts for why): points users to the in-app
// "✨ Create a Cipher" button inside any existing EmojiCode post
// (Section 13.1 / 13.5 of the product doc). If the subreddit has zero posts
// yet, seed the first one manually via reddit.submitCustomPost during setup.
menu.post('/open-submit-form', async (c) => {
    return c.json({ showToast: 'Open any EmojiCode post and tap ✨ Create a Cipher to submit your own.' }, 200);
});
//# sourceMappingURL=menu.js.map