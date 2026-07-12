import { Hono } from 'hono';
import { redis } from '@devvit/web/server';
import { AccountTypeV2 } from '@devvit/protos/json/devvit/reddit/v2alpha/userv2.js';
import { keys } from '../core/storage';
import { processGuess } from '../core/guessing';
import { getOrCreateHubPost } from '../core/post';
import { isCommand, handleCommand } from '../core/commands';
export const triggers = new Hono();
triggers.post('/on-app-install', async (c) => {
    const input = await c.req.json();
    console.log(`EmojiCode installed (trigger: ${input.type})`);
    // Create the persistent "Welcome to EmojiCode" hub post (Section 13.1's
    // Home Menu) so the feed isn't empty for first visitors (Section 17 risk
    // mitigation) — idempotent, and failures are non-fatal.
    try {
        const result = await getOrCreateHubPost();
        if (result.status === 'ready') {
            console.log(`Hub post ready: ${result.postId} (created: ${result.created})`);
        }
        else {
            console.log(`Hub post creation skipped: ${result.reason}`);
        }
    }
    catch (err) {
        console.log('Hub post creation failed (non-fatal)', err);
    }
    return c.json({});
});
// Comment-native scoring — every guess on a CipherPost is scored automatically
// (01_PRODUCT_DOCUMENTATION.md, Section 4 Step 5 / Section 9.2).
triggers.post('/on-comment-submit', async (c) => {
    const input = await c.req.json();
    const comment = input.comment;
    const author = input.author;
    const post = input.post;
    if (!comment || !author || !post) {
        return c.json({});
    }
    // Skip app-authored replies (correct-guess confirmations) to avoid recursion.
    if (author.accountType === AccountTypeV2.ACCOUNT_TYPE_APP) {
        return c.json({});
    }
    if (comment.body.startsWith('✅ Cracked it!')) {
        return c.json({});
    }
    const postId = comment.postId || post.id;
    const cipherRaw = await redis.get(keys.cipher(postId));
    // Also try without t3_ prefix — Redis keys may store either form.
    const cipherRawAlt = cipherRaw ??
        (postId.startsWith('t3_')
            ? await redis.get(keys.cipher(postId.slice(3)))
            : await redis.get(keys.cipher(`t3_${postId}`)));
    if (!cipherRaw && !cipherRawAlt) {
        return c.json({});
    }
    const resolvedPostId = cipherRaw
        ? postId
        : postId.startsWith('t3_')
            ? postId.slice(3)
            : `t3_${postId}`;
    if (isCommand(comment.body)) {
        await handleCommand(comment.id, resolvedPostId, comment.body);
        return c.json({});
    }
    await processGuess({
        postId: resolvedPostId,
        userId: author.id,
        username: author.name,
        guessText: comment.body,
        commentId: comment.id,
        replyOnMatch: true,
    });
    return c.json({});
});
//# sourceMappingURL=triggers.js.map