import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { setNavHandoff } from './navHandoff';
const timeAgo = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1)
        return 'just now';
    if (mins < 60)
        return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};
export const Splash = () => {
    const [data, setData] = useState(null);
    const [guessText, setGuessText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [solved, setSolved] = useState(false);
    const [feedback, setFeedback] = useState(null);
    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/init');
                const json = await res.json();
                if (json.type === 'init') {
                    setData(json);
                    setSolved(json.viewerHasSolved);
                }
            }
            catch (err) {
                console.error('splash init failed', err);
            }
        };
        void init();
    }, []);
    const handleGuess = async () => {
        if (!guessText.trim() || submitting)
            return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guessText }),
            });
            const result = await res.json();
            setGuessText('');
            if (result.matched) {
                const xpLine = result.xpAwarded > 0 ? ` · +${result.xpAwarded} XP` : '';
                setFeedback({ tone: 'good', message: `✅ Cracked it!${xpLine}` });
                setSolved(true);
            }
            else if (result.closeMatch) {
                setFeedback({ tone: 'warn', message: '🟡 So close — not quite it' });
            }
            else {
                setFeedback({ tone: 'bad', message: 'Not quite — try again' });
            }
        }
        catch (err) {
            console.error('splash guess failed', err);
            setFeedback({ tone: 'bad', message: 'Something went wrong — try again' });
        }
        finally {
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
    const expand = (e) => requestExpandedMode(e.nativeEvent, 'game');
    const expandTo = (target) => (e) => {
        setNavHandoff(target);
        requestExpandedMode(e.nativeEvent, 'game');
    };
    if (isHub) {
        return (_jsxs("div", { className: "bg-app-glow flex relative flex-col justify-center items-center min-h-screen gap-2 fluid-px py-6 bg-white dark:bg-gray-900", children: [_jsx("button", { className: "btn-glass absolute top-3 right-3 rounded-full text-lg text-gray-400 dark:text-gray-500 min-w-11 min-h-11 hover:text-[var(--color-primary)] hover:rotate-12 transition-all", onClick: expandTo('sound'), "aria-label": "Sound settings", children: "\uD83D\uDD0A" }), _jsx("span", { className: "text-4xl sm:text-5xl", children: "\uD83D\uDD10" }), _jsx("span", { className: "font-wordmark text-xl sm:text-2xl", children: "EmojiCode" }), _jsx("p", { className: "text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 max-w-xs sm:max-w-sm", children: "Encode it in 5. Crack it in comments." }), data.viewerStreakAtRisk && (_jsxs("div", { className: "text-xs sm:text-sm text-center rounded-lg px-3 py-2 font-medium w-full max-w-xs sm:max-w-sm", style: {
                        backgroundColor: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
                        color: 'var(--color-warning)',
                    }, children: [_jsx("span", { className: "flame-icon", children: "\uD83D\uDD25" }), " ", data.viewerStreak, "-day streak \u2014 solve today to keep it!"] })), _jsxs("div", { className: "flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mt-2", children: [_jsx(Button, { fullWidth: true, onClick: expandTo('create'), children: "\u2728 Create a Cipher" }), _jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [_jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('myciphers'), children: "\uD83D\uDD0D My Ciphers" }), _jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('rewards'), children: "\uD83C\uDFC5 My Rewards" }), _jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('leaderboard'), children: "\uD83C\uDFC6 Leaderboard" }), _jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('profile'), children: "\uD83D\uDC64 My Profile" }), _jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('howto'), children: "\u2753 How to Play" }), _jsx(Button, { variant: "outline", size: "sm", fullWidth: true, onClick: expandTo('trending'), children: "\uD83C\uDF1F Trending" })] }), _jsxs("span", { className: "text-xs text-center text-gray-400 dark:text-gray-500", children: [data.viewerApproxDecodesToNextLevel, " more decode", data.viewerApproxDecodesToNextLevel === 1 ? '' : 's', " to ", data.viewerNextLevelLabel] })] })] }));
    }
    return (_jsxs("div", { className: "bg-app-glow flex relative flex-col justify-center items-center min-h-screen gap-3 fluid-px py-6 bg-white dark:bg-gray-900", children: [_jsxs("div", { className: "text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5", children: [_jsx("span", { children: "\uD83D\uDD10" }), _jsx("span", { className: "font-wordmark", children: "EmojiCode" })] }), post && (_jsxs("div", { className: "text-xs sm:text-sm text-gray-400 dark:text-gray-500 text-center", children: ["Posted by ", _jsxs("span", { className: "font-pixel", children: ["u/", post.submitterUsername] }), _jsx("br", {}), "\uD83C\uDFC5 ", post.submitterLabel, " \u00B7 ", timeAgo(post.publishedAt), post.hardMode ? ' · 🔥 Hard' : ''] })), _jsx("div", { className: "emoji-row my-2", children: post ? (post.emojis.join(' ')) : (_jsx("span", { className: "inline-flex gap-2 align-middle", children: [0, 1, 2, 3, 4].map((i) => (_jsx("span", { className: "inline-block rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse", style: { width: '0.85em', height: '0.85em', animationDelay: `${i * 120}ms` } }, i))) })) }), post && (_jsxs("div", { className: "w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-1", children: [_jsx("div", { className: "w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: {
                                width: `${Math.min(100, post.stats.solveRate)}%`,
                                backgroundColor: 'var(--color-primary)',
                            } }) }), _jsx("span", { className: "text-xs sm:text-sm text-gray-500 dark:text-gray-400", children: post.stats.uniquePlayers === 0
                            ? "Nobody's cracked this yet. Bold move."
                            : `${post.stats.uniquePlayers} redditors tried · ${post.stats.solveRate}% solved it` }), _jsxs("div", { className: "flex items-center gap-1.5 flex-wrap justify-center", children: [post.isCipherOfDay && (_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full font-medium", style: {
                                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                    color: 'var(--color-primary)',
                                }, children: "\uD83C\uDF1F Cipher of the Day" })), _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", children: post.category }), _jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", children: ["\uD83C\uDF10 ", post.language] }), post.stats.uniquePlayers > 0 && (_jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", children: [post.stats.difficultyIcon, " ", post.stats.difficultyLabel] }))] })] })), post && !solved ? (_jsxs("div", { className: "flex flex-col gap-2 items-center w-full max-w-xs sm:max-w-sm mt-1", children: [_jsxs("div", { className: "flex w-full gap-2", children: [_jsx("input", { className: "flex-1 h-11 sm:h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 px-3 bg-transparent text-gray-900 dark:text-gray-100 focus:border-[var(--color-primary)] outline-none transition-colors", placeholder: "My guess...", value: guessText, onChange: (e) => setGuessText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleGuess(), disabled: submitting }), _jsx(Button, { size: "md", className: "!h-11 sm:!h-12", onClick: handleGuess, disabled: submitting, children: "Send" })] }), feedback && (_jsx("div", { className: `text-sm font-medium ${feedback.tone === 'bad' ? 'shake-x' : ''}`, style: {
                            color: feedback.tone === 'good'
                                ? 'var(--color-success)'
                                : feedback.tone === 'warn'
                                    ? 'var(--color-warning)'
                                    : undefined,
                        }, children: feedback.message }, feedback.message))] })) : post && solved ? (_jsx("div", { className: "text-sm sm:text-base font-medium", style: { color: 'var(--color-success)' }, children: "\u2705 You've cracked this one" })) : null, _jsxs("div", { className: "flex flex-col gap-2 w-full max-w-xs sm:max-w-sm mt-2", children: [_jsx("button", { className: "w-full h-9 text-xs sm:text-sm text-gray-400 dark:text-gray-500 underline hover:text-[var(--color-primary)] transition-colors", onClick: expand, children: "Open full view (hints, recap, leaderboard\u2026)" }), _jsx(Button, { variant: "outline", fullWidth: true, onClick: expandTo('create'), children: "\u2728 Create your own cipher (+20 XP)" })] })] }));
};
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(Splash, {}) }));
//# sourceMappingURL=splash.js.map