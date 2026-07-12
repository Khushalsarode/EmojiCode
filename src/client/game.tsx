// Expanded view — the full guess interaction (Section 13.3) plus the
// in-app submission modal (Section 13.5). Heavy logic lives here, not in
// splash.tsx. See 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo } from '@devvit/web/client';
import { useCipher } from './hooks/useCipher';
import { useProfile } from './hooks/useProfile';
import { HomeMenu } from './components/HomeMenu';
import { MyRewards } from './components/MyRewards';
import { LevelUp } from './components/LevelUp';
import { SolvedRecap } from './components/SolvedRecap';
import { Leaderboard } from './components/Leaderboard';
import { MyCiphers } from './components/MyCiphers';
import { ProfileCard } from './components/ProfileCard';
import { Trending } from './components/Trending';
import { EmojiPicker } from './components/EmojiPicker';
import { SoundSettings } from './components/SoundSettings';
import { Spinner } from './components/Spinner';
import { Confetti } from './components/Confetti';
import { Button } from './components/Button';
import { HowToPlay } from './components/HowToPlay';
import { sfx, unlockAudio } from './sound';
import { clearNavHandoff, readNavHandoff } from './navHandoff';
import { CATEGORY_OPTIONS, LANGUAGE_OPTIONS, ordinal, rankMedal, type SubmitCipherResponse } from '../shared/api';

type Screen =
  | 'menu'
  | 'rewards'
  | 'levelup'
  | 'recap'
  | 'leaderboard'
  | 'myciphers'
  | 'profile'
  | 'trending'
  | 'sound'
  | 'howto'
  | null;

// Screens the home-screen menu (splash.tsx) can deep-link straight into via
// navHandoff — deliberately excludes 'menu' (the default anyway), 'levelup'
// (only reachable by actually leveling up), and 'recap' (needs a solved post).
const DEEP_LINK_SCREENS: Screen[] = [
  'rewards',
  'leaderboard',
  'myciphers',
  'profile',
  'trending',
  'sound',
  'howto',
];

// Unlocks the Web Audio context on the very first click anywhere (required by
// browser autoplay policy) and gives every button a soft tactile click sound,
// from one place rather than wiring sfx.click() into every handler.
const useGlobalClickSound = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      unlockAudio();
      const target = (e.target as HTMLElement | null)?.closest('button');
      if (target && !(target as HTMLButtonElement).disabled) sfx.click();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
};

const ONBOARD_KEY = 'emojicode-onboarded';

const SubmitCipherModal = ({
  onClose,
  canHardMode,
}: {
  onClose: () => void;
  canHardMode: boolean;
}) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('Movie');
  const [language, setLanguage] = useState<(typeof LANGUAGE_OPTIONS)[number]>('English');
  const [hardMode, setHardMode] = useState(false);
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
        body: JSON.stringify({
          emojis: slots,
          answer,
          hardMode: canHardMode && hardMode,
          category,
          language,
        }),
      });
      const json: SubmitCipherResponse = await res.json();
      if (json.status === 'rejected') {
        setError(json.reason);
        sfx.error();
      } else {
        setPosted(json.postUrl);
        sfx.post();
      }
    } catch {
      setError('Something went wrong — try again.');
      sfx.error();
    } finally {
      setSubmitting(false);
    }
  };

  // Header + Post button are pinned outside the scrollable middle section
  // (sticky top/bottom, not just part of one long scrolling column) — with
  // the emoji picker's own grid plus category/language selects, this modal's
  // content can genuinely outgrow a short mobile viewport, and a plain
  // overflow-y-auto column leaves the primary "Post it" action easy to miss
  // if it isn't obvious the card scrolls at all. Pinning it means it's never
  // actually off-screen, whatever the content height ends up being.
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {posted ? (
          <div className="p-5 sm:p-6 flex flex-col gap-4">
            <div className="text-lg sm:text-xl font-heading font-bold text-center">🎉 Posted!</div>
            <p className="text-sm sm:text-base text-center text-gray-500 dark:text-gray-400">
              Your cipher is live in the feed
            </p>
            <Button fullWidth onClick={() => navigateTo(posted)}>
              View your post
            </Button>
          </div>
        ) : (
          <>
            <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 pb-0">
              <span className="font-heading font-bold text-lg sm:text-xl">✨ Create a Cipher</span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-all w-8 h-8 flex items-center justify-center" aria-label="Close">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-4 p-5 sm:p-6">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pick exactly 5 emojis:</div>
                <div className="flex gap-1 mb-2 min-h-[2.5rem]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl transition-all hover:enabled:scale-105 hover:enabled:border-[var(--color-danger)]"
                      onClick={() => slots[i] && removeSlot(i)}
                      disabled={!slots[i]}
                      aria-label={slots[i] ? `Remove ${slots[i]}` : `Empty slot ${i + 1}`}
                    >
                      {slots[i] ?? ''}
                    </button>
                  ))}
                </div>
                <EmojiPicker onPick={addEmoji} disabled={slots.length >= 5} />
              </div>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">What does it decode to?</div>
                <input
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="Type the answer…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Category</div>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-2 bg-transparent text-sm text-gray-800 dark:text-gray-100"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as (typeof CATEGORY_OPTIONS)[number])}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Language</div>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-2 bg-transparent text-sm text-gray-800 dark:text-gray-100"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as (typeof LANGUAGE_OPTIONS)[number])}
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {canHardMode && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={hardMode}
                    onChange={(e) => setHardMode(e.target.checked)}
                  />
                  🔥 Hard Mode tag
                </label>
              )}

              {error && (
                <div className="text-sm" style={{ color: 'var(--color-danger)' }}>
                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 p-5 sm:p-6 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                fullWidth
                onClick={handlePost}
                loading={submitting}
                disabled={slots.length !== 5 || !answer.trim()}
              >
                {submitting ? 'Checking…' : `Post it${slots.length === 5 ? '' : ` (${slots.length}/5 emojis)`}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const App = () => {
  useGlobalClickSound();
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
  // Both read the same handoff key (splash.tsx's home-screen menu sets it
  // right before expanding into this view) — reading is a pure, idempotent
  // localStorage.getItem, so it's safe to call from two separate lazy
  // initializers. The key itself is cleared once, in the effect below.
  const [modalOpen, setModalOpen] = useState(() => readNavHandoff() === 'create');
  const [screen, setScreen] = useState<Screen>(() => {
    const handoff = readNavHandoff();
    return handoff && DEEP_LINK_SCREENS.includes(handoff as Screen) ? (handoff as Screen) : null;
  });
  const [solved, setSolved] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [showOnboard, setShowOnboard] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARD_KEY);
    } catch {
      return true;
    }
  });

  // Clearing (a mutation) belongs in an effect, not the lazy initializers
  // above — StrictMode double-invokes initializers in dev, and clearing
  // there would make the second read see nothing.
  useEffect(() => {
    clearNavHandoff();
  }, []);

  const dismissOnboard = () => {
    setShowOnboard(false);
    try {
      localStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      // ignore — iframe storage can be restricted
    }
  };

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
      const rankLine = result.firstCrack
        ? ' · 🥇 First Crack!'
        : result.solveRank > 0
          ? ` · ${rankMedal(result.solveRank)} ${ordinal(result.solveRank)} to solve this one`
          : '';
      const levelUpLine = result.leveledUp ? ` · 🎉 Leveled up to ${result.newLabel}!` : '';
      setFeedback({
        matched: true,
        closeMatch: false,
        message: `✅ Cracked it! 🔥 ${result.newStreak}-day streak${xpLine}${rankLine}${levelUpLine}`,
      });
      setSolved(true);
      setCelebrate(true);
      (result.leveledUp ? sfx.levelUp : sfx.correct)();
      void refreshProfile();
      if (result.leveledUp) setScreen('levelup');
    } else if (result.closeMatch) {
      setFeedback({ matched: false, closeMatch: true, message: '🟡 So close — not quite it' });
      sfx.closeMatch();
    } else {
      setFeedback({ matched: false, closeMatch: false, message: 'Not quite — try again' });
      sfx.wrong();
    }
  };

  const handleGiveUp = async () => {
    const res = await fetch('/api/give-up', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      setRevealedAnswer(json.answer);
    } else {
      sfx.error();
    }
  };

  // Quick, purely client-side reaction tap — no backend, just a satisfying
  // bit of extra button activity around the puzzle itself.
  const handleReact = (emoji: string) => {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 900);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white dark:bg-gray-900 gap-2">
        <span className="text-3xl animate-pulse">🔐</span>
        <Spinner label="Loading EmojiCode…" />
      </div>
    );
  }

  // No cipher record for this postId means it's the persistent hub post
  // (Section 13.1's Home Menu) — render it as the main page, not an overlay.
  const isHub = data !== null && data.post === null;
  const isSolved = solved || Boolean(data?.viewerHasSolved);
  const canHardMode = Boolean(profile && profile.level >= 3);
  // Sub-screens opened from the hub's page have nowhere to "go back to" but
  // the hub itself; opened from inside a cipher post they return to that
  // post's ☰ Home Menu overlay.
  const closeScreen = () => setScreen(isHub ? null : 'menu');

  if (isHub) {
    return (
      <div className="content-fade-in bg-app-glow flex flex-col min-h-screen bg-white dark:bg-gray-900 fluid-px py-10 sm:py-16 items-center justify-center relative">
        <button
          className="absolute top-3 right-3 text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all"
          onClick={() => setScreen('sound')}
          aria-label="Sound settings"
        >
          🔊
        </button>
        <HomeMenu
          profile={profile}
          onCreateCipher={openCreateCipher}
          onOpenRewards={() => setScreen('rewards')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenLevelUp={() => setScreen('levelup')}
          onOpenMyCiphers={() => setScreen('myciphers')}
          onOpenProfile={() => setScreen('profile')}
          onOpenTrending={() => setScreen('trending')}
          onOpenHowTo={() => setScreen('howto')}
        />

        {modalOpen && (
          <SubmitCipherModal
            canHardMode={canHardMode}
            onClose={() => {
              setModalOpen(false);
              void refreshProfile();
            }}
          />
        )}
        {screen === 'rewards' && <MyRewards profile={profile} onClose={closeScreen} />}
        {screen === 'levelup' && profile && <LevelUp profile={profile} onClose={closeScreen} />}
        {screen === 'leaderboard' && <Leaderboard onClose={closeScreen} />}
        {screen === 'myciphers' && (
          <MyCiphers onClose={closeScreen} onCreateCipher={openCreateCipher} />
        )}
        {screen === 'profile' && profile && <ProfileCard profile={profile} onClose={closeScreen} />}
        {screen === 'trending' && <Trending onClose={closeScreen} />}
        {screen === 'sound' && <SoundSettings onClose={closeScreen} />}
        {screen === 'howto' && <HowToPlay onClose={closeScreen} />}
      </div>
    );
  }

  return (
    <div className="content-fade-in flex flex-col min-h-screen bg-white dark:bg-gray-900 fluid-px py-6 gap-5 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          className="text-xl text-gray-500 dark:text-gray-400 min-w-11 min-h-11 hover:text-[var(--color-primary)] transition-colors"
          onClick={() => setScreen('menu')}
          aria-label="Menu"
        >
          ☰
        </button>
        <div className="flex items-center gap-3">
          {(isSolved || revealedAnswer) && (
            <button
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors min-h-11"
              onClick={() => setScreen('recap')}
            >
              📊 Recap
            </button>
          )}
          <button
            className="text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all"
            onClick={() => setScreen('sound')}
            aria-label="Sound settings"
          >
            🔊
          </button>
        </div>
      </div>

      {post && (
        <>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {post.isCipherOfDay && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                🌟 Cipher of the Day
              </span>
            )}
            {post.hardMode && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: 'var(--color-warning)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)' }}
              >
                🔥 Hard Mode
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {post.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              🌐 {post.language}
            </span>
          </div>
          <div className="relative">
            <div className="emoji-row text-center">
              {post.emojis.join(' ')}
            </div>
            {reaction && (
              <span className="reaction-pop absolute left-1/2 top-0 text-4xl pointer-events-none">
                {reaction}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {['🔥', '😍', '🤯', '🎉'].map((emoji) => (
              <button
                key={emoji}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-700 text-base sm:text-lg hover:border-[var(--color-primary)] hover:scale-110 transition-all"
                onClick={() => handleReact(emoji)}
                aria-label={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {post.stats.uniquePlayers === 0
              ? "Nobody's cracked this yet. Bold move."
              : `${post.stats.uniquePlayers} players tried · ${post.stats.solveRate}% solved it`}
            {post.firstCrackUsername && (
              <>
                {' '}
                · 🥇 <span className="font-pixel">u/{post.firstCrackUsername}</span>
              </>
            )}
          </div>
          {post.stats.uniquePlayers > 0 && (
            <div className="text-center text-xs -mt-3 text-gray-400 dark:text-gray-500">
              {post.stats.difficultyIcon} {post.stats.difficultyLabel} ({post.stats.difficultyScore.toFixed(1)}/10)
            </div>
          )}

          {revealedAnswer ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-center text-base font-heading font-semibold text-gray-800 dark:text-gray-100">
                The answer was: {revealedAnswer}
              </div>
              <button
                className="text-xs text-gray-400 dark:text-gray-500 underline hover:text-[var(--color-primary)] transition-colors"
                onClick={() => setScreen('recap')}
              >
                📊 See how everyone else did
              </button>
            </div>
          ) : !isSolved ? (
            <div className="flex flex-col gap-3 items-center">
              {/* Guess input stays the front, primary action — everything
                  else (hint/give up/react) is secondary and sits around it. */}
              <div className="flex w-full max-w-sm sm:max-w-md gap-2">
                <input
                  className="flex-1 h-12 sm:h-14 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100 text-base sm:text-lg focus:border-[var(--color-primary)] outline-none transition-colors"
                  placeholder="My guess..."
                  value={guessText}
                  onChange={(e) => setGuessText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                  disabled={submitting}
                  autoFocus
                />
                <Button size="lg" onClick={handleGuess} loading={submitting}>
                  {!submitting && 'Send'}
                </Button>
              </div>

              {feedback && (
                <div
                  key={feedback.message}
                  className={`text-sm sm:text-base font-medium ${!feedback.matched && !feedback.closeMatch ? 'shake-x' : ''}`}
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

              {showHint && (
                <div className="font-mono-stat text-lg tracking-widest text-gray-500 dark:text-gray-400">
                  {post.answerHint}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowHint((v) => !v)}>
                  💡 {showHint ? 'Hide Hint' : 'Hint'}
                </Button>
                <Button variant="outline" size="sm" className="hover:border-[var(--color-danger)]" onClick={handleGiveUp}>
                  🏳 Give up
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              ✅ You&apos;ve cracked this one
            </div>
          )}
        </>
      )}

      <div className="mt-auto flex flex-col gap-2 w-full max-w-sm sm:max-w-md mx-auto">
        <Button variant="outline" fullWidth onClick={openCreateCipher}>
          ✨ Create a Cipher (+20 XP)
        </Button>
      </div>

      {showOnboard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
          <div className="card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col gap-3">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
              👋 New here? Guess what these 5 emojis mean — right in the comments. Or hit ✨ to post
              your own. That&apos;s it.
            </p>
            <Button fullWidth onClick={dismissOnboard}>
              Got it
            </Button>
          </div>
        </div>
      )}

      {modalOpen && (
        <SubmitCipherModal
          canHardMode={canHardMode}
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
          onOpenMyCiphers={() => setScreen('myciphers')}
          onOpenProfile={() => setScreen('profile')}
          onOpenTrending={() => setScreen('trending')}
          onOpenHowTo={() => setScreen('howto')}
        />
      )}
      {screen === 'rewards' && <MyRewards profile={profile} onClose={() => setScreen('menu')} />}
      {screen === 'levelup' && profile && <LevelUp profile={profile} onClose={() => setScreen('menu')} />}
      {screen === 'leaderboard' && <Leaderboard onClose={() => setScreen('menu')} />}
      {screen === 'myciphers' && (
        <MyCiphers onClose={() => setScreen('menu')} onCreateCipher={openCreateCipher} />
      )}
      {screen === 'profile' && profile && <ProfileCard profile={profile} onClose={() => setScreen('menu')} />}
      {screen === 'trending' && <Trending onClose={() => setScreen('menu')} />}
      {screen === 'sound' && <SoundSettings onClose={() => setScreen('menu')} />}
      {screen === 'howto' && <HowToPlay onClose={() => setScreen('menu')} />}
      {screen === 'recap' && <SolvedRecap onClose={() => setScreen(null)} onCreateCipher={openCreateCipher} />}
      {celebrate && <Confetti onDone={() => setCelebrate(false)} />}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
