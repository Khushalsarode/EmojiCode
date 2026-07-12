import { Hono } from 'hono';
import { redis } from '@devvit/web/server';
import type {
  OnAppInstallRequest,
  OnCommentSubmitRequest,
  TriggerResponse,
} from '@devvit/web/shared';
import { AccountTypeV2 } from '@devvit/protos/json/devvit/reddit/v2alpha/userv2.js';
import { keys } from '../core/storage';
import { processGuess } from '../core/guessing';
import { createCipherPost } from '../core/post';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  const input = await c.req.json<OnAppInstallRequest>();
  console.log(`EmojiCode installed (trigger: ${input.type})`);

  // Seed one starter post so the feed isn't empty for the first visitors
  // (Section 17 risk mitigation). Failures are non-fatal.
  try {
    const result = await createCipherPost(['🎬', '🦁', '👑', '🌅', '🎶'], 'The Lion King');
    if (result.status === 'published') {
      console.log(`Seeded starter cipher: ${result.postId}`);
    } else {
      console.log(`Seed skipped: ${result.reason}`);
    }
  } catch (err) {
    console.log('Seed failed (non-fatal)', err);
  }

  return c.json<TriggerResponse>({});
});

// Comment-native scoring — every guess on a CipherPost is scored automatically
// (01_PRODUCT_DOCUMENTATION.md, Section 4 Step 5 / Section 9.2).
triggers.post('/on-comment-submit', async (c) => {
  const input = await c.req.json<OnCommentSubmitRequest>();
  const comment = input.comment;
  const author = input.author;
  const post = input.post;

  if (!comment || !author || !post) {
    return c.json<TriggerResponse>({});
  }

  // Skip app-authored replies (correct-guess confirmations) to avoid recursion.
  if (author.accountType === AccountTypeV2.ACCOUNT_TYPE_APP) {
    return c.json<TriggerResponse>({});
  }
  if (comment.body.startsWith('✅ Cracked it!')) {
    return c.json<TriggerResponse>({});
  }

  const postId = comment.postId || post.id;
  const cipherRaw = await redis.get(keys.cipher(postId));
  // Also try without t3_ prefix — Redis keys may store either form.
  const cipherRawAlt =
    cipherRaw ??
    (postId.startsWith('t3_')
      ? await redis.get(keys.cipher(postId.slice(3)))
      : await redis.get(keys.cipher(`t3_${postId}`)));
  if (!cipherRaw && !cipherRawAlt) {
    return c.json<TriggerResponse>({});
  }

  const resolvedPostId = cipherRaw
    ? postId
    : postId.startsWith('t3_')
      ? postId.slice(3)
      : `t3_${postId}`;

  await processGuess({
    postId: resolvedPostId,
    userId: author.id,
    username: author.name,
    guessText: comment.body,
    commentId: comment.id,
    replyOnMatch: true,
  });

  return c.json<TriggerResponse>({});
});
