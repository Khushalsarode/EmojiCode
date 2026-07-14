import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Leaderboard screen (01_PRODUCT_DOCUMENTATION.md, Section 13.9) — two
// distinct boards (Section 7): Decoders (total XP, guessing-driven) and
// Cipher Masters (upvote-driven creativity score on submitted posts).
import { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
export const Leaderboard = ({ onClose }) => {
    const [window_, setWindow] = useState('weekly');
    const [board, setBoard] = useState('decoders');
    const [data, setData] = useState(null);
    useEffect(() => {
        const load = async () => {
            setData(null);
            try {
                const res = await fetch(`/api/leaderboard?window=${window_}&board=${board}`);
                const json = await res.json();
                setData(json);
            }
            catch (err) {
                console.error('Failed to load leaderboard', err);
            }
        };
        void load();
    }, [window_, board]);
    return (_jsxs(Modal, { title: "\uD83C\uDFC6 Leaderboard", onClose: onClose, scroll: true, children: [_jsxs("div", { className: "flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1", children: [_jsx("button", { "aria-pressed": board === 'decoders', className: "flex-1 h-9 rounded-md text-sm font-medium transition-all text-gray-600 dark:text-gray-300", style: {
                            backgroundColor: board === 'decoders' ? 'var(--color-primary)' : 'transparent',
                            color: board === 'decoders' ? '#fff' : undefined,
                        }, onClick: () => setBoard('decoders'), children: "\uD83D\uDD0E Decoders" }), _jsx("button", { "aria-pressed": board === 'cipherMasters', className: "flex-1 h-9 rounded-md text-sm font-medium transition-all text-gray-600 dark:text-gray-300", style: {
                            backgroundColor: board === 'cipherMasters' ? 'var(--color-primary)' : 'transparent',
                            color: board === 'cipherMasters' ? '#fff' : undefined,
                        }, onClick: () => setBoard('cipherMasters'), children: "\uD83D\uDC51 Cipher Masters" })] }), _jsxs("select", { className: "self-start text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-gray-800 dark:text-gray-100", value: window_, onChange: (e) => setWindow(e.target.value), children: [_jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "alltime", children: "All-Time" })] }), _jsx("div", { className: "flex flex-col gap-2", children: !data ? (_jsx(Spinner, {})) : data.entries.length === 0 ? (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500 text-center py-4", children: "No scores yet." })) : (data.entries.map((entry, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
                    return (_jsxs("div", { className: "list-card list-item-in flex items-center gap-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2", style: { ['--i']: i }, children: [_jsx("span", { className: "font-mono-stat text-gray-400 dark:text-gray-500 w-6 text-center shrink-0", children: medal ?? `${i + 1}.` }), _jsxs("div", { className: "min-w-0", children: [_jsxs("span", { className: "font-pixel text-gray-800 dark:text-gray-100", children: ["u/", entry.username] }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["\uD83C\uDFC5 ", entry.label, " \u00B7 ", entry.score, " pts", entry.streak > 0 ? ` · 🔥 ${entry.streak}` : ''] })] })] }, entry.userId));
                })) }), data && data.viewerRank !== null && (_jsxs("div", { className: "rounded-lg px-3 py-2 text-sm font-medium", style: {
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    color: 'var(--color-primary)',
                }, children: ["You: #", data.viewerRank, data.viewerStreak > 0 ? ` · 🔥 ${data.viewerStreak}-day streak` : ''] }))] }));
};
//# sourceMappingURL=Leaderboard.js.map