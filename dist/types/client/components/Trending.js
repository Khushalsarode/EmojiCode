import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Trending rail — Level 6's "Featured eligibility" reward
// (01_PRODUCT_DOCUMENTATION.md, Section 7.1): top posts by upvotes,
// eligible only from Level 6+ submitters.
import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { Spinner } from './Spinner';
import { Modal } from './Modal';
export const Trending = ({ onClose }) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetch('/api/trending')
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => {
            console.error('Failed to load trending', err);
            setData({ type: 'trending', posts: [] });
        });
    }, []);
    const posts = data?.posts ?? null;
    return (_jsxs(Modal, { title: "\uD83C\uDF1F Trending", onClose: onClose, scroll: true, children: [_jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500 -mt-2", children: "Featured posts from Level 6+ Master Decoders" }), _jsx("div", { className: "flex flex-col gap-2 overflow-y-auto", children: posts === null ? (_jsx(Spinner, {})) : posts.length === 0 ? (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500 text-center py-6", children: "Nothing trending yet \u2014 reach Level 6 to get featured here." })) : (posts.map((post, i) => (_jsxs("button", { className: "list-card list-item-in text-left rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-[var(--color-primary)]", style: { ['--i']: i }, onClick: () => navigateTo(post.postUrl), children: [_jsx("div", { className: "text-2xl tracking-widest mb-1", children: post.emojis.join(' ') }), post.isCipherOfDay && (_jsx("div", { className: "text-xs font-medium mb-1", style: { color: 'var(--color-primary)' }, children: "\uD83C\uDF1F Cipher of the Day" })), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [post.category, " \u00B7 \uD83C\uDF10 ", post.language, " \u00B7 \uD83D\uDD3A ", post.upvotes, " \u00B7 ", post.decoderCount, " cracked"] }), _jsxs("div", { className: "text-xs text-gray-400 dark:text-gray-500", children: ["\uD83C\uDFC5 ", post.submitterLabel] })] }, post.postId)))) })] }));
};
//# sourceMappingURL=Trending.js.map