// Splash view — the fast, light INLINE feed card (Section 13.2 of the product
// doc). Guessing happens right here now (no forced tap-through to game.tsx
// just to type a guess) — but this stays deliberately lightweight: no sound
// engine, no confetti, no emoji picker. Those stay in game.tsx, opened via
// requestExpandedMode, per 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';
import { Button } from './components/Button';
import { setNavHandoff, type NavTarget } from './navHandoff';
import type { GuessResponse, InitResponse } from '../shared/api';

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
  const [guessText, setGuessText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<null | { tone: 'good' | 'warn' | 'bad'; message: string }>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        const json: InitResponse = await res.json();
        if (json.type === 'init') {
          setData(json);
          setSolved(json.viewerHasSolved);
        }
      } catch (err) {
        console.error('splash init failed', err);
      }
    };
    void init();
  }, []);

  const handleGuess = async () => {
    if (!guessText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guessText }),
      });
      const result: GuessResponse = await res.json();
      setGuessText('');
      if (result.matched) {
        const xpLine = result.xpAwarded > 0 ? ` · +${result.xpAwarded} XP` : '';
        setFeedback({ tone: 'good', message: `✅ Cracked it!${xpLine}` });
        setSolved(true);
      } else if (result.closeMatch) {
        setFeedback({ tone: 'warn', message: '🟡 So close — not quite it' });
      } else {
        setFeedback({ tone: 'bad', message: 'Not quite — try again' });
      }
    } catch (err) {
      console.error('splash guess failed', err);
      setFeedback({ tone: 'bad', message: 'Something went wrong — try again' });
    } finally {
      setSubmitting(false);
    }
  };

  // data === null: still loading. data.post === null: this is the hub post
  // (Section 13.1), not an individual cipher — render the welcome card instead.
  const post = data?.post;
  const isHub = data !== null && data.post === null;

  // requestExpandedMode only takes an entry name (`game`), not a target
  // screen — there's no native deep-link API. So each button below stashes
  // which screen it means to open in localStorage right before expanding
  // (navHandoff.ts), and game.tsx reads that once on mount to land there
  // directly instead of always opening on its own Home Menu.
  const expand = (e: { nativeEvent: MouseEvent }) => requestExpandedMode(e.nativeEvent, 'game');
  const expandTo = (target: NavTarget) => (e: { nativeEvent: MouseEvent }) => {
    setNavHandoff(target);
    requestExpandedMode(e.nativeEvent, 'game');
  };

  if (isHub) {
    return (
      <div className="bg-app-glow flex relative flex-col justify-center items-center min-h-screen gap-2 fluid-px py-6 bg-white dark:bg-gray-900">
        <button
          className="btn-glass absolute top-3 right-3 rounded-full text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all"
          onClick={expandTo('sound')}
          aria-label="Sound settings"
        >
          🔊
        </button>
        <span className="text-4xl sm:text-5xl">🔐</span>
        <span className="font-wordmark text-xl sm:text-2xl">EmojiCode</span>
        <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 max-w-xs sm:max-w-sm">
          Encode it in 5. Crack it in comments.
        </p>

        {data.viewerStreakAtRisk && (
          <div
            className="text-xs sm:text-sm text-center rounded-lg px-3 py-2 font-medium w-full max-w-xs sm:max-w-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
              color: 'var(--color-warning)',
            }}
          >
            <span className="flame-icon">🔥</span> {data.viewerStreak}-day streak — solve today to keep it!
          </div>
        )}

        <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mt-2">
          <Button fullWidth onClick={expandTo('create')}>
            ✨ Create a Cipher
          </Button>
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('myciphers')}>
              🔍 My Ciphers
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('rewards')}>
              🏅 My Rewards
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('leaderboard')}>
              🏆 Leaderboard
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('profile')}>
              👤 My Profile
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('howto')}>
              ❓ How to Play
            </Button>
            <Button variant="outline" size="sm" fullWidth onClick={expandTo('trending')}>
              🌟 Trending
            </Button>
          </div>
          <span className="text-xs text-center text-gray-400 dark:text-gray-500">
            {data.viewerApproxDecodesToNextLevel} more decode
            {data.viewerApproxDecodesToNextLevel === 1 ? '' : 's'} to {data.viewerNextLevelLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-glow flex relative flex-col justify-center items-center min-h-screen gap-3 fluid-px py-6 bg-white dark:bg-gray-900">
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <span>🔐</span>
        <span className="font-wordmark">EmojiCode</span>
      </div>
      {post && (
        <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center">
          Posted by <span className="font-pixel">u/{post.submitterUsername}</span>
          <br />
          🏅 {post.submitterLabel} · {timeAgo(post.publishedAt)}
          {post.hardMode ? ' · 🔥 Hard' : ''}
        </div>
      )}

      <div className="emoji-row my-2">
        {post ? (
          post.emojis.join(' ')
        ) : (
          <span className="inline-flex gap-2 align-middle">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
                style={{ width: '0.85em', height: '0.85em', animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>

      {post && (
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-1">
          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, post.stats.solveRate)}%`,
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </div>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {post.stats.uniquePlayers === 0
              ? "Nobody's cracked this yet. Bold move."
              : `${post.stats.uniquePlayers} redditors tried · ${post.stats.solveRate}% solved it`}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {post.isCipherOfDay && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                🌟 Cipher of the Day
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {post.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              🌐 {post.language}
            </span>
            {post.stats.uniquePlayers > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {post.stats.difficultyIcon} {post.stats.difficultyLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {post && !solved ? (
        <div className="flex flex-col gap-2 items-center w-full max-w-xs sm:max-w-sm mt-1">
          <div className="flex w-full gap-2">
            <input
              className="flex-1 h-11 sm:h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100 focus:border-[var(--color-primary)] outline-none transition-colors"
              placeholder="My guess..."
              value={guessText}
              onChange={(e) => setGuessText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
              disabled={submitting}
            />
            <Button size="md" className="!h-11 sm:!h-12" onClick={handleGuess} disabled={submitting}>
              Send
            </Button>
          </div>
          {feedback && (
            <div
              key={feedback.message}
              className={`text-sm font-medium ${feedback.tone === 'bad' ? 'shake-x' : ''}`}
              style={{
                color:
                  feedback.tone === 'good'
                    ? 'var(--color-success)'
                    : feedback.tone === 'warn'
                      ? 'var(--color-warning)'
                      : undefined,
              }}
            >
              {feedback.message}
            </div>
          )}
        </div>
      ) : post && solved ? (
        <div className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-success)' }}>
          ✅ You&apos;ve cracked this one
        </div>
      ) : null}

      <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mt-2">
        <button
          className="w-full h-9 text-xs sm:text-sm text-gray-400 dark:text-gray-500 underline hover:text-[var(--color-primary)] transition-colors"
          onClick={expand}
        >
          Open full view (hints, recap, leaderboard…)
        </button>
        <Button variant="outline" fullWidth onClick={expandTo('create')}>
          ✨ Create your own cipher (+20 XP)
        </Button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
