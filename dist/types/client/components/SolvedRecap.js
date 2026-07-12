import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Cipher Solved Recap — ranked bar chart of guesses by frequency, wrong
// guesses partially censored server-side (01_PRODUCT_DOCUMENTATION.md, Section 13.6).
import { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import { Button } from './Button';
export const SolvedRecap = ({ onClose, onCreateCipher }) => {
    const [recap, setRecap] = useState(null);
    useEffect(() => {
        fetch('/api/recap')
            .then((res) => res.json())
            .then((json) => setRecap(json))
            .catch((err) => console.error('Failed to load recap', err));
    }, []);
    const total = recap?.distribution.reduce((sum, d) => sum + d.count, 0) ?? 0;
    const stats = recap?.post.stats;
    return (_jsx(Modal, { title: "\uD83D\uDCCA Solved Recap", onClose: onClose, scroll: true, children: !recap ? (_jsx(Spinner, { label: "Loading recap\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-4xl sm:text-5xl text-center tracking-widest", children: recap.post.emojis.join(' ') }), _jsxs("div", { className: "text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400", children: ["By ", _jsxs("span", { className: "font-pixel", children: ["u/", recap.post.submitterUsername] }), " \u00B7 ", recap.post.category, " \u00B7 \uD83C\uDF10", ' ', recap.post.language] }), stats && (_jsxs("div", { className: "text-xs text-center font-medium", children: [stats.difficultyIcon, " ", stats.difficultyLabel, " (", stats.difficultyScore.toFixed(1), "/10)"] })), _jsxs("div", { className: "text-sm text-center text-gray-600 dark:text-gray-300", children: [total, " guesses by ", recap.post.decoderCount, " players"] }), stats && (_jsxs("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3", children: [_jsxs("div", { children: [stats.uniquePlayers, " unique players guessed"] }), _jsxs("div", { children: [stats.totalGuesses, " total guesses (avg ", stats.avgGuessesPerPlayer, " per player)"] }), _jsxs("div", { children: [stats.uniqueWordsGuessed, " unique words guessed"] }), _jsxs("div", { children: [stats.skips, " skips (", stats.skipRate, "% skip rate)"] }), _jsxs("div", { className: "col-span-2", children: [stats.solves, " solves (", stats.solveRate, "% solved rate)"] })] })), _jsx("div", { className: "flex flex-col gap-1.5", children: recap.distribution.map((entry, i) => {
                        const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                        return (_jsxs("div", { className: "list-item-in flex items-center gap-2 text-sm", style: { ['--i']: i }, children: [_jsxs("div", { className: "flex-1 relative h-6 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden", children: [_jsx("div", { className: "h-full rounded transition-[width] duration-500 ease-out", style: {
                                                width: `${pct}%`,
                                                backgroundColor: entry.isCorrectAnswer ? 'var(--color-primary)' : 'var(--color-gray-400)',
                                            } }), _jsx("span", { className: "absolute inset-0 flex items-center px-2 text-xs text-gray-800 dark:text-gray-100 truncate", children: entry.guessTextCensored })] }), _jsxs("span", { className: "w-14 text-right text-xs font-mono-stat text-gray-500 dark:text-gray-400", children: [entry.count, " \u00B7 ", pct, "%"] })] }, i));
                    }) }), _jsx("div", { className: "text-xs text-center text-gray-400 dark:text-gray-500", children: "See comments for more" }), _jsx(Button, { fullWidth: true, onClick: onCreateCipher, children: "\u2728 Create your own (+20 XP)" })] })) }));
};
//# sourceMappingURL=SolvedRecap.js.map