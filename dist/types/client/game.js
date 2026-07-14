import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Expanded view — the full guess interaction (Section 13.3) plus the
// in-app submission modal (Section 13.5). Heavy logic lives here, not in
// splash.tsx. See 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';
import { lazy, StrictMode, Suspense, useEffect, useState } from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/Button';
import { HowToPlay } from './components/HowToPlay';
import { sfx, unlockAudio } from './sound';
import { clearNavHandoff, readNavHandoff } from './navHandoff';
import { CATEGORY_OPTIONS, LANGUAGE_OPTIONS, ordinal, rankMedal } from '../shared/api';
// Code-split: Phaser is ~1MB+ and is only ever needed for the solve-celebration
// burst, so it's fetched on demand at the moment of a correct guess rather
// than bundled into the expanded view's initial load.
const CipherBurst = lazy(() => import('./components/CipherBurst').then((m) => ({ default: m.CipherBurst })));
// Screens the home-screen menu (splash.tsx) can deep-link straight into via
// navHandoff — deliberately excludes 'menu' (the default anyway), 'levelup'
// (only reachable by actually leveling up), and 'recap' (needs a solved post).
const DEEP_LINK_SCREENS = [
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
        const handler = (e) => {
            unlockAudio();
            const target = e.target?.closest('button');
            if (target && !target.disabled)
                sfx.click();
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);
};
const ONBOARD_KEY = 'emojicode-onboarded';
const SubmitCipherModal = ({ onClose, canHardMode, }) => {
    const [slots, setSlots] = useState([]);
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('Movie');
    const [language, setLanguage] = useState('English');
    const [hardMode, setHardMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [posted, setPosted] = useState(null);
    const addEmoji = (emoji) => {
        if (slots.length >= 5)
            return;
        setSlots([...slots, emoji]);
    };
    const removeSlot = (index) => setSlots(slots.filter((_, i) => i !== index));
    const handlePost = async () => {
        if (slots.length !== 5 || !answer.trim() || submitting)
            return;
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
            const json = await res.json();
            if (json.status === 'rejected') {
                setError(json.reason);
                sfx.error();
            }
            else {
                setPosted(json.postUrl);
                sfx.post();
            }
        }
        catch {
            setError('Something went wrong — try again.');
            sfx.error();
        }
        finally {
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
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden", children: posted ? (_jsxs("div", { className: "p-5 sm:p-6 flex flex-col gap-4", children: [_jsx("div", { className: "text-lg sm:text-xl font-heading font-bold text-center", children: "\uD83C\uDF89 Posted!" }), _jsx("p", { className: "text-sm sm:text-base text-center text-gray-500 dark:text-gray-400", children: "Your cipher is live in the feed" }), _jsx(Button, { fullWidth: true, onClick: () => navigateTo(posted), children: "View your post" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "shrink-0 flex items-center justify-between p-5 sm:p-6 pb-0", children: [_jsx("span", { className: "font-heading font-bold text-lg sm:text-xl", children: "\u2728 Create a Cipher" }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-all w-8 h-8 flex items-center justify-center", "aria-label": "Close", children: "\u2715" })] }), _jsxs("div", { className: "overflow-y-auto flex flex-col gap-4 p-5 sm:p-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-2", children: "Pick exactly 5 emojis:" }), _jsx("div", { className: "flex gap-1 mb-2 min-h-[2.5rem]", children: Array.from({ length: 5 }).map((_, i) => (_jsx("button", { className: "w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl transition-all hover:enabled:scale-105 hover:enabled:border-[var(--color-danger)]", onClick: () => slots[i] && removeSlot(i), disabled: !slots[i], "aria-label": slots[i] ? `Remove ${slots[i]}` : `Empty slot ${i + 1}`, children: slots[i] ?? '' }, i))) }), _jsx(EmojiPicker, { onPick: addEmoji, disabled: slots.length >= 5 })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "What does it decode to?" }), _jsx("input", { className: "w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100", placeholder: "Type the answer\u2026", value: answer, onChange: (e) => setAnswer(e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Category" }), _jsx("select", { className: "w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-2 bg-transparent text-sm text-gray-800 dark:text-gray-100", value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORY_OPTIONS.map((c) => (_jsx("option", { value: c, children: c }, c))) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Language" }), _jsx("select", { className: "w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 px-2 bg-transparent text-sm text-gray-800 dark:text-gray-100", value: language, onChange: (e) => setLanguage(e.target.value), children: LANGUAGE_OPTIONS.map((l) => (_jsx("option", { value: l, children: l }, l))) })] })] }), canHardMode && (_jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [_jsx("input", { type: "checkbox", checked: hardMode, onChange: (e) => setHardMode(e.target.checked) }), "\uD83D\uDD25 Hard Mode tag"] })), error && (_jsx("div", { className: "text-sm", style: { color: 'var(--color-danger)' }, children: error }))] }), _jsx("div", { className: "shrink-0 p-5 sm:p-6 pt-3 border-t border-gray-200 dark:border-gray-700", children: _jsx(Button, { fullWidth: true, onClick: handlePost, loading: submitting, disabled: slots.length !== 5 || !answer.trim(), children: submitting ? 'Checking…' : `Post it${slots.length === 5 ? '' : ` (${slots.length}/5 emojis)`}` }) })] })) }) }));
};
export const App = () => {
    useGlobalClickSound();
    const { data, loading, submitGuess, suggestAnswer } = useCipher();
    const { profile, refresh: refreshProfile } = useProfile();
    const [guessText, setGuessText] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [revealedAnswer, setRevealedAnswer] = useState(null);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestText, setSuggestText] = useState('');
    const [suggestStatus, setSuggestStatus] = useState(null);
    const [suggesting, setSuggesting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // Both read the same handoff key (splash.tsx's home-screen menu sets it
    // right before expanding into this view) — reading is a pure, idempotent
    // localStorage.getItem, so it's safe to call from two separate lazy
    // initializers. The key itself is cleared once, in the effect below.
    const [modalOpen, setModalOpen] = useState(() => readNavHandoff() === 'create');
    const [screen, setScreen] = useState(() => {
        const handoff = readNavHandoff();
        return handoff && DEEP_LINK_SCREENS.includes(handoff) ? handoff : null;
    });
    const [solved, setSolved] = useState(false);
    const [celebration, setCelebration] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [reaction, setReaction] = useState(null);
    const [showOnboard, setShowOnboard] = useState(() => {
        try {
            return !localStorage.getItem(ONBOARD_KEY);
        }
        catch {
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
        }
        catch {
            // ignore — iframe storage can be restricted
        }
    };
    const post = data?.post;
    const openCreateCipher = () => {
        setScreen(null);
        setModalOpen(true);
    };
    const handleGuess = async () => {
        if (!guessText.trim() || submitting)
            return;
        setSubmitting(true);
        const result = await submitGuess(guessText);
        setSubmitting(false);
        setGuessText('');
        if (!result)
            return;
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
            setCelebration({ emojis: post?.emojis ?? [], xpAwarded: result.xpAwarded, firstCrack: result.firstCrack });
            (result.leveledUp ? sfx.levelUp : sfx.correct)();
            void refreshProfile();
            if (result.leveledUp)
                setScreen('levelup');
        }
        else if (result.closeMatch) {
            setFeedback({ matched: false, closeMatch: true, message: '🟡 So close — not quite it' });
            sfx.closeMatch();
        }
        else {
            setFeedback({ matched: false, closeMatch: false, message: 'Not quite — try again' });
            sfx.wrong();
        }
    };
    const handleSuggestAnswer = async () => {
        if (!suggestText.trim() || suggesting)
            return;
        setSuggesting(true);
        const result = await suggestAnswer(suggestText);
        setSuggesting(false);
        if (!result) {
            setSuggestStatus('Something went wrong — try again.');
            return;
        }
        if (result.status === 'added') {
            setSuggestStatus('✅ Added — future guessers get credit for this phrasing too.');
            setSuggestText('');
            sfx.correct();
        }
        else {
            setSuggestStatus(result.reason);
            sfx.error();
        }
    };
    const handleGiveUp = async () => {
        const res = await fetch('/api/give-up', { method: 'POST' });
        if (res.ok) {
            const json = await res.json();
            setRevealedAnswer(json.answer);
        }
        else {
            sfx.error();
        }
    };
    // Quick, purely client-side reaction tap — no backend, just a satisfying
    // bit of extra button activity around the puzzle itself.
    const handleReact = (emoji) => {
        setReaction(emoji);
        setTimeout(() => setReaction(null), 900);
    };
    if (loading) {
        return (_jsxs("div", { className: "flex flex-col min-h-screen items-center justify-center bg-white dark:bg-gray-900 gap-2", children: [_jsx("span", { className: "text-3xl animate-pulse", children: "\uD83D\uDD10" }), _jsx(Spinner, { label: "Loading EmojiCode\u2026" })] }));
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
        return (_jsxs("div", { className: "content-fade-in bg-app-glow flex flex-col min-h-screen bg-white dark:bg-gray-900 fluid-px py-10 sm:py-16 items-center justify-center relative", children: [_jsx("button", { className: "absolute top-3 right-3 text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all", onClick: () => setScreen('sound'), "aria-label": "Sound settings", children: "\uD83D\uDD0A" }), _jsx(HomeMenu, { profile: profile, onCreateCipher: openCreateCipher, onOpenRewards: () => setScreen('rewards'), onOpenLeaderboard: () => setScreen('leaderboard'), onOpenLevelUp: () => setScreen('levelup'), onOpenMyCiphers: () => setScreen('myciphers'), onOpenProfile: () => setScreen('profile'), onOpenTrending: () => setScreen('trending'), onOpenHowTo: () => setScreen('howto') }), modalOpen && (_jsx(SubmitCipherModal, { canHardMode: canHardMode, onClose: () => {
                        setModalOpen(false);
                        void refreshProfile();
                    } })), screen === 'rewards' && _jsx(MyRewards, { profile: profile, onClose: closeScreen }), screen === 'levelup' && profile && _jsx(LevelUp, { profile: profile, onClose: closeScreen }), screen === 'leaderboard' && _jsx(Leaderboard, { onClose: closeScreen }), screen === 'myciphers' && (_jsx(MyCiphers, { onClose: closeScreen, onCreateCipher: openCreateCipher })), screen === 'profile' && profile && _jsx(ProfileCard, { profile: profile, onClose: closeScreen }), screen === 'trending' && _jsx(Trending, { onClose: closeScreen }), screen === 'sound' && _jsx(SoundSettings, { onClose: closeScreen }), screen === 'howto' && _jsx(HowToPlay, { onClose: closeScreen })] }));
    }
    return (_jsxs("div", { className: "content-fade-in flex flex-col min-h-screen bg-white dark:bg-gray-900 fluid-px py-6 gap-5 w-full max-w-2xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { className: "text-xl text-gray-500 dark:text-gray-400 min-w-11 min-h-11 hover:text-[var(--color-primary)] transition-colors", onClick: () => setScreen('menu'), "aria-label": "Menu", children: "\u2630" }), _jsxs("div", { className: "flex items-center gap-3", children: [(isSolved || revealedAnswer) && (_jsx("button", { className: "text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors min-h-11", onClick: () => setScreen('recap'), children: "\uD83D\uDCCA Recap" })), _jsx("button", { className: "text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all", onClick: () => setScreen('sound'), "aria-label": "Sound settings", children: "\uD83D\uDD0A" })] })] }), post && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-center gap-2 flex-wrap", children: [post.isCipherOfDay && (_jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full", style: {
                                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                    color: 'var(--color-primary)',
                                }, children: "\uD83C\uDF1F Cipher of the Day" })), post.hardMode && (_jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full", style: { color: 'var(--color-warning)', backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)' }, children: "\uD83D\uDD25 Hard Mode" })), _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", children: post.category }), _jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", children: ["\uD83C\uDF10 ", post.language] })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "emoji-row text-center", children: post.emojis.join(' ') }), reaction && (_jsx("span", { className: "reaction-pop absolute left-1/2 top-0 text-4xl pointer-events-none", children: reaction }))] }), _jsx("div", { className: "flex items-center justify-center gap-1.5 sm:gap-2", children: ['🔥', '😍', '🤯', '🎉'].map((emoji) => (_jsx("button", { className: "w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-gray-700 text-base sm:text-lg hover:border-[var(--color-primary)] hover:scale-110 transition-all", onClick: () => handleReact(emoji), "aria-label": `React ${emoji}`, children: emoji }, emoji))) }), _jsxs("div", { className: "text-center text-sm sm:text-base text-gray-500 dark:text-gray-400", children: [post.stats.uniquePlayers === 0
                                ? "Nobody's cracked this yet. Bold move."
                                : `${post.stats.uniquePlayers} players tried · ${post.stats.solveRate}% solved it`, post.firstCrackUsername && (_jsxs(_Fragment, { children: [' ', "\u00B7 \uD83E\uDD47 ", _jsxs("span", { className: "font-pixel", children: ["u/", post.firstCrackUsername] })] }))] }), post.stats.uniquePlayers > 0 && (_jsxs("div", { className: "text-center text-xs -mt-3 text-gray-400 dark:text-gray-500", children: [post.stats.difficultyIcon, " ", post.stats.difficultyLabel, " (", post.stats.difficultyScore.toFixed(1), "/10)"] })), revealedAnswer ? (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("div", { className: "text-center text-base font-heading font-semibold text-gray-800 dark:text-gray-100", children: ["The answer was: ", revealedAnswer] }), _jsx("button", { className: "text-xs text-gray-400 dark:text-gray-500 underline hover:text-[var(--color-primary)] transition-colors", onClick: () => setScreen('recap'), children: "\uD83D\uDCCA See how everyone else did" })] })) : !isSolved ? (_jsxs("div", { className: "flex flex-col gap-3 items-center", children: [_jsxs("div", { className: "flex w-full max-w-sm sm:max-w-md gap-2", children: [_jsx("input", { className: "flex-1 h-12 sm:h-14 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100 text-base sm:text-lg focus:border-[var(--color-primary)] outline-none transition-colors", placeholder: "My guess...", value: guessText, onChange: (e) => setGuessText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleGuess(), disabled: submitting, autoFocus: true }), _jsx(Button, { size: "lg", onClick: handleGuess, loading: submitting, children: !submitting && 'Send' })] }), feedback && (_jsx("div", { className: `text-sm sm:text-base font-medium ${feedback.matched ? 'correct-pop' : !feedback.closeMatch ? 'shake-x' : ''}`, style: {
                                    color: feedback.matched
                                        ? 'var(--color-success)'
                                        : feedback.closeMatch
                                            ? 'var(--color-warning)'
                                            : undefined,
                                }, children: feedback.message }, feedback.message)), showHint && (_jsx("div", { className: "font-mono-stat text-lg tracking-widest text-gray-500 dark:text-gray-400", children: post.answerHint })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowHint((v) => !v), children: ["\uD83D\uDCA1 ", showHint ? 'Hide Hint' : 'Hint'] }), _jsx(Button, { variant: "outline", size: "sm", className: "hover:border-[var(--color-danger)]", onClick: handleGiveUp, children: "\uD83C\uDFF3 Give up" })] })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: "text-center text-sm font-medium", style: { color: 'var(--color-success)' }, children: "\u2705 You've cracked this one" }), !suggestOpen ? (_jsx("button", { className: "text-xs text-gray-400 dark:text-gray-500 underline hover:text-[var(--color-primary)] transition-colors", onClick: () => setSuggestOpen(true), children: "\uD83D\uDCA1 Know another way people might phrase this? Add it" })) : (_jsxs("div", { className: "flex flex-col items-center gap-2 w-full max-w-sm", children: [_jsxs("div", { className: "flex w-full gap-2", children: [_jsx("input", { className: "flex-1 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100 text-sm focus:border-[var(--color-primary)] outline-none transition-colors", placeholder: "Another accepted phrasing\u2026", value: suggestText, onChange: (e) => setSuggestText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSuggestAnswer(), disabled: suggesting }), _jsx(Button, { size: "sm", onClick: handleSuggestAnswer, loading: suggesting, children: !suggesting && 'Add' })] }), suggestStatus && (_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 text-center", children: suggestStatus }))] }))] }))] })), _jsx("div", { className: "mt-auto flex flex-col gap-2 w-full max-w-sm sm:max-w-md mx-auto", children: _jsx(Button, { variant: "outline", fullWidth: true, onClick: openCreateCipher, children: "\u2728 Create a Cipher (+20 XP)" }) }), showOnboard && (_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4", children: _jsxs("div", { className: "card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col gap-3", children: [_jsx("p", { className: "text-sm sm:text-base text-gray-700 dark:text-gray-200", children: "\uD83D\uDC4B New here? Guess what these 5 emojis mean \u2014 right in the comments. Or hit \u2728 to post your own. That's it." }), _jsx(Button, { fullWidth: true, onClick: dismissOnboard, children: "Got it" })] }) })), modalOpen && (_jsx(SubmitCipherModal, { canHardMode: canHardMode, onClose: () => {
                    setModalOpen(false);
                    void refreshProfile();
                } })), screen === 'menu' && (_jsx(HomeMenu, { profile: profile, onClose: () => setScreen(null), onCreateCipher: openCreateCipher, onOpenRewards: () => setScreen('rewards'), onOpenLeaderboard: () => setScreen('leaderboard'), onOpenLevelUp: () => setScreen('levelup'), onOpenMyCiphers: () => setScreen('myciphers'), onOpenProfile: () => setScreen('profile'), onOpenTrending: () => setScreen('trending'), onOpenHowTo: () => setScreen('howto') })), screen === 'rewards' && _jsx(MyRewards, { profile: profile, onClose: () => setScreen('menu') }), screen === 'levelup' && profile && _jsx(LevelUp, { profile: profile, onClose: () => setScreen('menu') }), screen === 'leaderboard' && _jsx(Leaderboard, { onClose: () => setScreen('menu') }), screen === 'myciphers' && (_jsx(MyCiphers, { onClose: () => setScreen('menu'), onCreateCipher: openCreateCipher })), screen === 'profile' && profile && _jsx(ProfileCard, { profile: profile, onClose: () => setScreen('menu') }), screen === 'trending' && _jsx(Trending, { onClose: () => setScreen('menu') }), screen === 'sound' && _jsx(SoundSettings, { onClose: () => setScreen('menu') }), screen === 'howto' && _jsx(HowToPlay, { onClose: () => setScreen('menu') }), screen === 'recap' && _jsx(SolvedRecap, { onClose: () => setScreen(null), onCreateCipher: openCreateCipher }), celebration && (_jsxs(_Fragment, { children: [_jsx("div", { className: "celebrate-flash pointer-events-none fixed inset-0 z-[99]", "aria-hidden": "true" }), _jsx(ErrorBoundary, { onError: () => setCelebration(null), children: _jsx(Suspense, { fallback: null, children: _jsx(CipherBurst, { emojis: celebration.emojis, xpAwarded: celebration.xpAwarded, firstCrack: celebration.firstCrack, onDone: () => setCelebration(null) }) }) })] }))] }));
};
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
//# sourceMappingURL=game.js.map