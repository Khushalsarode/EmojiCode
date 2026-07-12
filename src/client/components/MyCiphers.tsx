// My Ciphers — list of the viewer's published posts (Section 13.1 secondary action).
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import type { MyCiphersResponse } from '../../shared/api';

type Props = {
  onClose: () => void;
  onCreateCipher: () => void;
};

const timeAgo = (ts: number): string => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const MyCiphers = ({ onClose, onCreateCipher }: Props) => {
  const [data, setData] = useState<MyCiphersResponse | null>(null);

  useEffect(() => {
    fetch('/api/my-ciphers')
      .then((res) => res.json())
      .then((json: MyCiphersResponse) => setData(json))
      .catch((err) => {
        console.error('Failed to load my ciphers', err);
        setData({ type: 'my-ciphers', ciphers: [] });
      });
  }, []);

  const ciphers = data?.ciphers ?? null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3 max-h-[90vh]">
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg">🔍 My Ciphers</span>
          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {ciphers === null ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Loading…</div>
          ) : ciphers.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              You haven&apos;t posted a cipher yet.
            </div>
          ) : (
            ciphers.map((cipher) => (
              <button
                key={cipher.postId}
                className="text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)] transition-colors"
                onClick={() => navigateTo(cipher.postUrl)}
              >
                <div className="text-2xl tracking-widest mb-1">{cipher.emojis.join(' ')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {cipher.hardMode ? '🔥 Hard · ' : ''}
                  {cipher.decoderCount} cracked · {timeAgo(cipher.publishedAt)}
                  {cipher.firstCrackUsername ? ` · 🥇 u/${cipher.firstCrackUsername}` : ''}
                </div>
              </button>
            ))
          )}
        </div>

        <button
          className="h-11 rounded-lg text-white font-medium mt-1"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={onCreateCipher}
        >
          ✨ Create a Cipher
        </button>
      </div>
    </div>
  );
};
