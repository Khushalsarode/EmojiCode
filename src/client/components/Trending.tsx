// Trending rail — Level 6's "Featured eligibility" reward
// (01_PRODUCT_DOCUMENTATION.md, Section 7.1): top posts by upvotes,
// eligible only from Level 6+ submitters.
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import type { TrendingResponse } from '../../shared/api';

type Props = {
  onClose: () => void;
};

export const Trending = ({ onClose }: Props) => {
  const [data, setData] = useState<TrendingResponse | null>(null);

  useEffect(() => {
    fetch('/api/trending')
      .then((res) => res.json())
      .then((json: TrendingResponse) => setData(json))
      .catch((err) => {
        console.error('Failed to load trending', err);
        setData({ type: 'trending', posts: [] });
      });
  }, []);

  const posts = data?.posts ?? null;

  return (
    <Modal title="🌟 Trending" onClose={onClose} scroll>
      <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">
        Featured posts from Level 6+ Master Decoders
      </p>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {posts === null ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            Nothing trending yet — reach Level 6 to get featured here.
          </div>
        ) : (
          posts.map((post, i) => (
            <button
              key={post.postId}
              className="list-card list-item-in text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)]"
              style={{ ['--i' as string]: i }}
              onClick={() => navigateTo(post.postUrl)}
            >
              <div className="text-2xl tracking-widest mb-1">{post.emojis.join(' ')}</div>
              {post.isCipherOfDay && (
                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                  🌟 Cipher of the Day
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {post.category} · 🌐 {post.language} · 🔺 {post.upvotes} · {post.decoderCount} cracked
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">🏅 {post.submitterLabel}</div>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
};
