import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Cipher Solved Recap — ranked bar chart of guesses by frequency, wrong
// guesses partially censored server-side (01_PRODUCT_DOCUMENTATION.md, Section 13.6).
import { useEffect, useState } from 'react';
export const SolvedRecap = ({ onClose, onCreateCipher }) => {
    const [recap, setRecap] = useState(null);
    useEffect(() => {
        fetch('/api/recap')
            .then((res) => res.json())
            .then((json) => setRecap(json))
            .catch((err) => console.error('Failed to load recap', err));
    }, []);
    const total = recap?.distribution.reduce((sum, d) => sum + d.count, 0) ?? 0;
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-heading font-bold text-lg", children: "\uD83D\uDCCA Solved Recap" }), _jsx("button", { onClick: onClose, className: "text-gray-400", children: "\u2715" })] }), !recap ? (_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 text-center py-6", children: "Loading\u2026" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-4xl text-center tracking-widest", children: recap.post.emojis.join(' ') }), _jsxs("div", { className: "text-xs text-center text-gray-500 dark:text-gray-400", children: ["By u/", recap.post.submitterUsername] }), _jsxs("div", { className: "text-sm text-center text-gray-600 dark:text-gray-300", children: [total, " guesses by ", recap.post.decoderCount, " players"] }), _jsx("div", { className: "flex flex-col gap-1.5", children: recap.distribution.map((entry, i) => {
                                const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                                return (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsxs("div", { className: "flex-1 relative h-6 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden", children: [_jsx("div", { className: "h-full rounded", style: {
                                                        width: `${pct}%`,
                                                        backgroundColor: entry.isCorrectAnswer ? 'var(--color-primary)' : '#9ca3af',
                                                    } }), _jsx("span", { className: "absolute inset-0 flex items-center px-2 text-xs text-gray-800 dark:text-gray-100 truncate", children: entry.guessTextCensored })] }), _jsxs("span", { className: "w-14 text-right text-xs font-mono-stat text-gray-500 dark:text-gray-400", children: [entry.count, " \u00B7 ", pct, "%"] })] }, i));
                            }) }), _jsx("div", { className: "text-xs text-center text-gray-400 dark:text-gray-500", children: "See comments for more" }), _jsx("button", { className: "h-11 rounded-lg text-white font-medium", style: { backgroundColor: 'var(--color-primary)' }, onClick: onCreateCipher, children: "\u2728 Create your own" })] }))] }) }));
};
//# sourceMappingURL=SolvedRecap.js.map