import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
import { MyCiphers } from './components/MyCiphers';
const EMOJI_CHOICES = [
    '🎬', '🦁', '👑', '🌅', '🎶', '🐶', '🚀', '🏰', '🔥', '🌊', '🎮', '📺',
    '👻', '🧙', '🍕', '💍', '🦸', '🐉', '⚽', '🎸', '📚', '🧠', '💤', '🏆',
    '🕵️', '🌙', '❄️', '🌋', '🧩', '🎯',
];
const ONBOARD_KEY = 'emojicode-onboarded';
const SubmitCipherModal = ({ onClose, canHardMode, }) => {
    const [slots, setSlots] = useState([]);
    const [answer, setAnswer] = useState('');
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
                body: JSON.stringify({ emojis: slots, answer, hardMode: canHardMode && hardMode }),
            });
            const json = await res.json();
            if (json.status === 'rejected') {
                setError(json.reason);
            }
            else {
                setPosted(json.postUrl);
            }
        }
        catch {
            setError('Something went wrong — try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4 max-h-[90vh] overflow-y-auto", children: posted ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-lg font-heading font-bold text-center", children: "\uD83C\uDF89 Posted!" }), _jsx("p", { className: "text-sm text-center text-gray-500 dark:text-gray-400", children: "Your cipher is live in the feed" }), _jsx("button", { className: "h-11 rounded-lg text-white font-medium", style: { backgroundColor: 'var(--color-primary)' }, onClick: () => navigateTo(posted), children: "View your post" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-heading font-bold text-lg", children: "\u2728 Create a Cipher" }), _jsx("button", { onClick: onClose, className: "text-gray-400", children: "\u2715" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-2", children: "Pick exactly 5 emojis:" }), _jsx("div", { className: "flex gap-1 mb-2 min-h-[2.5rem]", children: Array.from({ length: 5 }).map((_, i) => (_jsx("button", { className: "w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xl", onClick: () => slots[i] && removeSlot(i), children: slots[i] ?? '' }, i))) }), _jsx("div", { className: "flex flex-wrap gap-1 max-h-28 overflow-y-auto", children: EMOJI_CHOICES.map((e) => (_jsx("button", { className: "w-9 h-9 rounded-md border border-gray-200 dark:border-gray-700 text-lg disabled:opacity-40", onClick: () => addEmoji(e), disabled: slots.length >= 5, children: e }, e))) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "What does it decode to?" }), _jsx("input", { className: "w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent", placeholder: "The Lion King", value: answer, onChange: (e) => setAnswer(e.target.value) })] }), canHardMode && (_jsxs("label", { className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300", children: [_jsx("input", { type: "checkbox", checked: hardMode, onChange: (e) => setHardMode(e.target.checked) }), "\uD83D\uDD25 Hard Mode tag"] })), error && (_jsx("div", { className: "text-sm", style: { color: 'var(--color-danger)' }, children: error })), _jsx("button", { className: "h-11 rounded-lg text-white font-medium disabled:opacity-40", style: { backgroundColor: 'var(--color-primary)' }, onClick: handlePost, disabled: slots.length !== 5 || !answer.trim() || submitting, children: submitting ? 'Checking…' : 'Post it' })] })) }) }));
};
export const App = () => {
    const { data, loading, submitGuess } = useCipher();
    const { profile, refresh: refreshProfile } = useProfile();
    const [guessText, setGuessText] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [revealedAnswer, setRevealedAnswer] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [screen, setScreen] = useState(null);
    const [solved, setSolved] = useState(false);
    const [showOnboard, setShowOnboard] = useState(() => {
        try {
            return !localStorage.getItem(ONBOARD_KEY);
        }
        catch {
            return true;
        }
    });
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
            const firstCrackLine = result.firstCrack ? ' 🥇 First Crack!' : '';
            const levelUpLine = result.leveledUp ? ` · 🎉 Leveled up to ${result.newLabel}!` : '';
            setFeedback({
                matched: true,
                closeMatch: false,
                message: `✅ Cracked it! 🔥 ${result.newStreak}-day streak${xpLine}${firstCrackLine}${levelUpLine}`,
            });
            setSolved(true);
            void refreshProfile();
            if (result.leveledUp)
                setScreen('levelup');
        }
        else if (result.closeMatch) {
            setFeedback({ matched: false, closeMatch: true, message: '🟡 So close — not quite it' });
        }
        else {
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
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-white dark:bg-gray-900", children: _jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Loading\u2026" }) }));
    }
    const isSolved = solved || Boolean(data?.viewerHasSolved);
    const canHardMode = Boolean(profile && profile.level >= 3);
    return (_jsxs("div", { className: "flex flex-col min-h-screen bg-white dark:bg-gray-900 px-4 py-6 gap-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { className: "text-xl text-gray-500 dark:text-gray-400 min-w-11 min-h-11", onClick: () => setScreen('menu'), "aria-label": "Menu", children: "\u2630" }), isSolved && (_jsx("button", { className: "text-xs text-gray-500 dark:text-gray-400 underline min-h-11", onClick: () => setScreen('recap'), children: "\uD83D\uDCCA Recap" }))] }), post && (_jsxs(_Fragment, { children: [post.hardMode && (_jsx("div", { className: "text-center text-xs font-medium", style: { color: 'var(--color-warning)' }, children: "\uD83D\uDD25 Hard Mode" })), _jsx("div", { className: "text-6xl text-center tracking-widest", children: post.emojis.join(' ') }), _jsxs("div", { className: "text-center text-sm text-gray-500 dark:text-gray-400", children: [post.decoderCount === 0
                                ? "Nobody's cracked this yet. Bold move."
                                : `${post.decoderCount} players cracked it`, post.firstCrackUsername && _jsxs(_Fragment, { children: [" \u00B7 \uD83E\uDD47 u/", post.firstCrackUsername] })] }), revealedAnswer ? (_jsxs("div", { className: "text-center text-base font-heading font-semibold text-gray-800 dark:text-gray-100", children: ["The answer was: ", revealedAnswer] })) : !isSolved ? (_jsxs("div", { className: "flex flex-col gap-2 items-center", children: [_jsxs("div", { className: "flex w-full max-w-sm gap-2", children: [_jsx("input", { className: "flex-1 h-11 rounded-lg border border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100", placeholder: "My guess...", value: guessText, onChange: (e) => setGuessText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleGuess(), disabled: submitting }), _jsx("button", { className: "h-11 px-4 rounded-lg text-white font-medium", style: { backgroundColor: 'var(--color-primary)' }, onClick: handleGuess, disabled: submitting, children: "Send" })] }), feedback && (_jsx("div", { className: "text-sm font-medium", style: {
                                    color: feedback.matched
                                        ? 'var(--color-success)'
                                        : feedback.closeMatch
                                            ? 'var(--color-warning)'
                                            : undefined,
                                }, children: feedback.message })), _jsx("button", { className: "text-xs text-gray-400 dark:text-gray-500 underline mt-1 min-h-11", onClick: handleGiveUp, children: "\uD83C\uDFF3 Give up" })] })) : (_jsx("div", { className: "text-center text-sm font-medium", style: { color: 'var(--color-success)' }, children: "\u2705 You've cracked this one" }))] })), _jsx("div", { className: "mt-auto flex flex-col gap-2 w-full max-w-sm mx-auto", children: _jsx("button", { className: "w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100", onClick: openCreateCipher, children: "\u2728 Create a Cipher" }) }), showOnboard && (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3", children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-200", children: "\uD83D\uDC4B New here? Guess what these 5 emojis mean \u2014 right in the comments. Or hit \u2728 to post your own. That's it." }), _jsx("button", { className: "h-11 rounded-lg text-white font-medium", style: { backgroundColor: 'var(--color-primary)' }, onClick: dismissOnboard, children: "Got it" })] }) })), modalOpen && (_jsx(SubmitCipherModal, { canHardMode: canHardMode, onClose: () => {
                    setModalOpen(false);
                    void refreshProfile();
                } })), screen === 'menu' && (_jsx(HomeMenu, { profile: profile, onClose: () => setScreen(null), onCreateCipher: openCreateCipher, onOpenRewards: () => setScreen('rewards'), onOpenLeaderboard: () => setScreen('leaderboard'), onOpenLevelUp: () => setScreen('levelup'), onOpenMyCiphers: () => setScreen('myciphers') })), screen === 'rewards' && _jsx(MyRewards, { profile: profile, onClose: () => setScreen('menu') }), screen === 'levelup' && profile && _jsx(LevelUp, { profile: profile, onClose: () => setScreen('menu') }), screen === 'leaderboard' && _jsx(Leaderboard, { onClose: () => setScreen('menu') }), screen === 'myciphers' && (_jsx(MyCiphers, { onClose: () => setScreen('menu'), onCreateCipher: openCreateCipher })), screen === 'recap' && _jsx(SolvedRecap, { onClose: () => setScreen(null), onCreateCipher: openCreateCipher })] }));
};
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
//# sourceMappingURL=game.js.map