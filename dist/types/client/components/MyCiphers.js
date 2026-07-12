import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// My Ciphers — list of the viewer's published posts (Section 13.1 secondary action).
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
import { Button } from './Button';
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
    return (_jsxs(Modal, { title: "\uD83D\uDD0D My Ciphers", onClose: onClose, scroll: true, children: [_jsx("div", { className: "flex flex-col gap-2 overflow-y-auto", children: ciphers === null ? (_jsx(Spinner, {})) : ciphers.length === 0 ? (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500 text-center py-6", children: "You haven't posted a cipher yet." })) : (ciphers.map((cipher, i) => (_jsxs("button", { className: "list-card list-item-in text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)]", style: { ['--i']: i }, onClick: () => navigateTo(cipher.postUrl), children: [_jsx("div", { className: "text-2xl tracking-widest mb-1", children: cipher.emojis.join(' ') }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [cipher.hardMode ? '🔥 Hard · ' : '', cipher.category, " \u00B7 \uD83C\uDF10 ", cipher.language, " \u00B7 ", cipher.decoderCount, " cracked \u00B7", ' ', timeAgo(cipher.publishedAt), cipher.firstCrackUsername && (_jsxs(_Fragment, { children: [' ', "\u00B7 \uD83E\uDD47 ", _jsxs("span", { className: "font-pixel", children: ["u/", cipher.firstCrackUsername] })] }))] })] }, cipher.postId)))) }), _jsx(Button, { fullWidth: true, onClick: onCreateCipher, children: "\u2728 Create a Cipher" })] }));
};
//# sourceMappingURL=MyCiphers.js.map