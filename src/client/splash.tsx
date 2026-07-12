// Splash view — the fast, light INLINE feed card (Section 13.2 of the product
// doc). Keep this minimal: heavy logic and the guess UI live in game.tsx,
// opened via requestExpandedMode. See 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';
import type { InitResponse } from '../shared/api';

const timeAgo = (ts: number): string => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const Splash = () => {
  const [data, setData] = useState<InitResponse | null>(null);

  useEffect(() => {
    fetch('/api/init')
      .then((res) => res.json())
      .then((json: InitResponse) => {
        if (json.type === 'init') setData(json);
      })
      .catch((err) => console.error('splash init failed', err));
  }, []);

  const post = data?.post;

  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-3 px-4 bg-white dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400">🔐 EmojiCode</div>
      {post && (
        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Posted by u/{post.submitterUsername}
          <br />
          🏅 {post.submitterLabel} · {timeAgo(post.publishedAt)}
          {post.hardMode ? ' · 🔥 Hard' : ''}
        </div>
      )}

      <div className="text-5xl tracking-widest my-2">
        {post ? post.emojis.join(' ') : '🎬 🦁 👑 🌅 🎶'}
      </div>

      {post && (
        <div className="w-full max-w-xs flex flex-col items-center gap-1">
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, post.decoderCount * 8)}%`,
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {post.decoderCount === 0
              ? "Nobody's cracked this yet. Bold move."
              : `${post.decoderCount} redditors have cracked it`}
          </span>
          {post.category !== 'Other' && (
            <span className="text-xs text-gray-400 dark:text-gray-500">Category: {post.category}</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
        <button
          className="w-full h-11 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          💬 Guess in the comments
        </button>
        <button
          className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          ✨ Create your own cipher
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
