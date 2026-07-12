// My Ciphers — list of the viewer's published posts (Section 13.1 secondary action).
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import { Button } from './Button';
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
    <Modal title="🔍 My Ciphers" onClose={onClose} scroll>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {ciphers === null ? (
          <Spinner />
        ) : ciphers.length === 0 ? (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
            You haven&apos;t posted a cipher yet.
          </div>
        ) : (
          ciphers.map((cipher, i) => (
            <button
              key={cipher.postId}
              className="list-card list-item-in text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)]"
              style={{ ['--i' as string]: i }}
              onClick={() => navigateTo(cipher.postUrl)}
            >
              <div className="text-2xl tracking-widest mb-1">{cipher.emojis.join(' ')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {cipher.hardMode ? '🔥 Hard · ' : ''}
                {cipher.category} · 🌐 {cipher.language} · {cipher.decoderCount} cracked ·{' '}
                {timeAgo(cipher.publishedAt)}
                {cipher.firstCrackUsername && (
                  <>
                    {' '}
                    · 🥇 <span className="font-pixel">u/{cipher.firstCrackUsername}</span>
                  </>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <Button fullWidth onClick={onCreateCipher}>
        ✨ Create a Cipher
      </Button>
    </Modal>
  );
};
