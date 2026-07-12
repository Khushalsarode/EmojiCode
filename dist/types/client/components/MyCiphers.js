import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// My Ciphers — list of the viewer's published posts (Section 13.1 secondary action).
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
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
export const MyCiphers = ({ onClose, onCreateCipher }) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch('/api/my-ciphers')
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => {
            console.error('Failed to load my ciphers', err);
            setData({ type: 'my-ciphers', ciphers: [] });
        });
    }, []);
    const ciphers = data?.ciphers ?? null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3 max-h-[90vh]", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-heading font-bold text-lg", children: "\uD83D\uDD0D My Ciphers" }), _jsx("button", { onClick: onClose, className: "text-gray-400", children: "\u2715" })] }), _jsx("div", { className: "flex flex-col gap-2 overflow-y-auto", children: ciphers === null ? (_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 text-center py-6", children: "Loading\u2026" })) : ciphers.length === 0 ? (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500 text-center py-6", children: "You haven't posted a cipher yet." })) : (ciphers.map((cipher) => (_jsxs("button", { className: "text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)] transition-colors", onClick: () => navigateTo(cipher.postUrl), children: [_jsx("div", { className: "text-2xl tracking-widest mb-1", children: cipher.emojis.join(' ') }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [cipher.hardMode ? '🔥 Hard · ' : '', cipher.decoderCount, " cracked \u00B7 ", timeAgo(cipher.publishedAt), cipher.firstCrackUsername ? ` · 🥇 u/${cipher.firstCrackUsername}` : ''] })] }, cipher.postId)))) }), _jsx("button", { className: "h-11 rounded-lg text-white font-medium mt-1", style: { backgroundColor: 'var(--color-primary)' }, onClick: onCreateCipher, children: "\u2728 Create a Cipher" })] }) }));
};
//# sourceMappingURL=MyCiphers.js.map