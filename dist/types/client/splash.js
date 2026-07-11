import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Splash view — the fast, light INLINE feed card (Section 13.2 of the product
// doc). Keep this minimal: heavy logic and the guess UI live in game.tsx,
// opened via requestExpandedMode. See 04_DEVVIT_WEB_BUILD_SKILL.md, Section 3.
import './index.css';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';
export const Splash = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch('/api/init')
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error('splash init failed', err));
    }, []);
    const post = data?.post;
    return (_jsxs("div", { className: "flex relative flex-col justify-center items-center min-h-screen gap-3 px-4 bg-white dark:bg-gray-900", children: [_jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "\uD83D\uDD10 EmojiCode" }), post && (_jsxs("div", { className: "text-xs text-gray-400 dark:text-gray-500 text-center", children: ["Posted by u/", post.submitterUsername, _jsx("br", {}), "\uD83C\uDFC5 ", post.submitterLabel, " \u00B7 just now"] })), _jsx("div", { className: "text-5xl tracking-widest my-2", children: post ? post.emojis.join(' ') : '🎬 🦁 👑 🌅 🎶' }), post && (_jsxs("div", { className: "w-full max-w-xs flex flex-col items-center gap-1", children: [_jsx("div", { className: "w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: {
                                width: `${Math.min(100, post.decoderCount * 8)}%`,
                                backgroundColor: 'var(--color-primary)',
                            } }) }), _jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [post.decoderCount, " redditors have cracked it"] })] })), _jsxs("div", { className: "flex flex-col gap-2 w-full max-w-xs mt-2", children: [_jsx("button", { className: "w-full h-11 rounded-lg text-white font-medium transition-colors", style: { backgroundColor: 'var(--color-primary)' }, onClick: (e) => requestExpandedMode(e.nativeEvent, 'game'), children: "\uD83D\uDCAC Guess in the comments" }), _jsx("button", { className: "w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-gray-100", onClick: (e) => requestExpandedMode(e.nativeEvent, 'game'), children: "\u2728 Create your own cipher" })] })] }));
};
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(Splash, {}) }));
//# sourceMappingURL=splash.js.map