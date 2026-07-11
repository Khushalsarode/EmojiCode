// Expanded view — the full guess interaction (Section 13.3) plus the
// in-app submission modal (Section 13.5). Heavy logic lives here, not in
// splash.tsx. See 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo } from '@devvit/web/client';
import { useCipher } from './hooks/useCipher';
import { useProfile } from './hooks/useProfile';
import { HomeMenu } from './components/HomeMenu';
import { MyRewards } from './components/MyRewards';
import { LevelUp } from './components/LevelUp';
import { SolvedRecap } from './components/SolvedRecap';
import { Leaderboard } from './components/Leaderboard';
import type { SubmitCipherResponse } from '../shared/api';

type Screen = 'menu' | 'rewards' | 'levelup' | 'recap' | 'leaderboard' | null;

const EMOJI_CHOICES = ['🎬', '🦁', '👑', '🌅', '🎶', '🐶', '🚀', '🏰', '🔥', '🌊', '🎮', '📺'];

const SubmitCipherModal = ({ onClose }: { onClose: () => void }) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState<string | null>(null);

  const addEmoji = (emoji: string) => {
    if (slots.length >= 5) return;
    setSlots([...slots, emoji]);
  };
  const removeSlot = (index: number) => setSlots(slots.filter((_, i) => i !== index));

  const handlePost = async () => {
    if (slots.length !== 5 || !answer.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit-cipher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojis: slots, answer }),
      });
      const json: SubmitCipherResponse = await res.json();
      if (json.status === 'rejected') {
        setError(json.reason);
      } else {
        setPosted(json.postUrl);
      }
    } catch {
      setError('Something went wrong — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4">
        {posted ? (
          <>
            <div className="text-lg font-heading font-bold text-center">🎉 Posted!</div>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Your cipher is live in the feed
            </p>
            <button
              className="h-11 rounded-lg text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={() => navigateTo(posted)}
            >
              View your post
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-lg">✨ Create a Cipher</span>
              <button onClick={onClose} className="text-gray-400">✕</button>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pick exactly 5 emojis:</div>
              <div className="flex gap-1 mb-2 min-h-[2.5rem]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl"
                    onClick={() => slots[i] && removeSlot(i)}
                  >
                    {slots[i] ?? ''}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-700 text-lg"
                    onClick={() => addEmoji(e)}
                    disabled={slots.length >= 5}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">What does it decode to?</div>
              <input
                className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent"
                placeholder="The Lion King"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>

            {error && <div className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</div>}

            <button
              className="h-11 rounded-lg text-white font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onClick={handlePost}
              disabled={slots.length !== 5 || !answer.trim() || submitting}
            >
              {submitting ? 'Checking…' : 'Post it'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const App = () => {
  const { data, loading, submitGuess } = useCipher();
  const { profile, refresh: refreshProfile } = useProfile();
  const [guessText, setGuessText] = useState('');
  const [feedback, setFeedback] = useState<null | {
    matched: boolean;
    closeMatch: boolean;
    message: string;
  }>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>(null);
  const [solved, setSolved] = useState(false);

  const post = data?.post;

  const openCreateCipher = () => {
    setScreen(null);
    setModalOpen(true);
  };

  const handleGuess = async () => {
    if (!guessText.trim() || submitting) return;
    setSubmitting(true);
    const result = await submitGuess(guessText);
    setSubmitting(false);
    setGuessText('');

    if (!result) return;

    if (result.matched) {
      const xpLine = result.xpAwarded > 0 ? ` · +${result.xpAwarded} XP` : '';
      const firstCrackLine = result.firstCrack ? ' 🥇 First Crack!' : '';
      const levelUpLine = result.leveledUp ? ` · 🎉 Leveled up to ${result.newLabel}!` : '';
      setFeedback({
        matched: true,
        closeMatch: false,
        message: `✅ Cracked it! 🔥 ${result.newStreak}-day streak${xpLine}${firstCrackLine}${levelUpLine}`,
      });
      setSolved(true);
      void refreshProfile();
    } else if (result.closeMatch) {
      setFeedback({ matched: false, closeMatch: true, message: '🟡 So close — not quite it' });
    } else {
      setFeedback({ matched: false, closeMatch: false, message: 'Not quite — try again' });
    }
  };

  const handleGiveUp = async () => {
    const res = await fetch('/api/give-up', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      setRevealedAnswer(json.answer);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <span className="text-gray-500 dark:text-gray-400">Loading…</span>
      </div>
    );
  }

  const isSolved = solved || Boolean(data?.viewerHasSolved);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 px-4 py-6 gap-5">
      <div className="flex items-center justify-between">
        <button
          className="text-xl text-gray-500 dark:text-gray-400"
          onClick={() => setScreen('menu')}
          aria-label="Menu"
        >
          ☰
        </button>
        {isSolved && (
          <button
            className="text-xs text-gray-500 dark:text-gray-400 underline"
            onClick={() => setScreen('recap')}
          >
            📊 Recap
          </button>
        )}
      </div>

      {post && (
        <>
          <div className="text-6xl text-center tracking-widest">{post.emojis.join(' ')}</div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {post.decoderCount} players cracked it
            {post.firstCrackUsername && <> · 🥇 u/{post.firstCrackUsername}</>}
          </div>

          {revealedAnswer ? (
            <div className="text-center text-base font-heading font-semibold text-gray-800 dark:text-gray-100">
              The answer was: {revealedAnswer}
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center">
              <div className="flex w-full max-w-sm gap-2">
                <input
                  className="flex-1 h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="My guess..."
                  value={guessText}
                  onChange={(e) => setGuessText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  disabled={submitting}
                />
                <button
                  className="h-11 px-4 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onClick={handleGuess}
                  disabled={submitting}
                >
                  Send
                </button>
              </div>

              {feedback && (
                <div
                  className="text-sm font-medium"
                  style={{
                    color: feedback.matched
                      ? 'var(--color-success)'
                      : feedback.closeMatch
                        ? 'var(--color-warning)'
                        : undefined,
                  }}
                >
                  {feedback.message}
                </div>
              )}

              <button className="text-xs text-gray-400 dark:text-gray-500 underline mt-1" onClick={handleGiveUp}>
                🏳 Give up
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-auto flex flex-col gap-2 w-full max-w-sm mx-auto">
        <button
          className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100"
          onClick={openCreateCipher}
        >
          ✨ Create a Cipher
        </button>
        <button
          className="w-full h-9 text-xs text-gray-400 dark:text-gray-500 underline"
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
        >
          r/Devvit
        </button>
      </div>

      {modalOpen && (
        <SubmitCipherModal
          onClose={() => {
            setModalOpen(false);
            void refreshProfile();
          }}
        />
      )}

      {screen === 'menu' && (
        <HomeMenu
          profile={profile}
          onClose={() => setScreen(null)}
          onCreateCipher={openCreateCipher}
          onOpenRewards={() => setScreen('rewards')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenLevelUp={() => setScreen('levelup')}
        />
      )}
      {screen === 'rewards' && <MyRewards profile={profile} onClose={() => setScreen('menu')} />}
      {screen === 'levelup' && profile && <LevelUp profile={profile} onClose={() => setScreen('menu')} />}
      {screen === 'leaderboard' && <Leaderboard onClose={() => setScreen('menu')} />}
      {screen === 'recap' && <SolvedRecap onClose={() => setScreen(null)} onCreateCipher={openCreateCipher} />}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
