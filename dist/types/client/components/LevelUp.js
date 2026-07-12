import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Level-Up / Level Details screen — browsable across every level, not just
// the viewer's current one, and not capped by whatever ships in `allTiers`
// (01_PRODUCT_DOCUMENTATION.md, Section 13.8) — levels are dynamic, so
// browsing forward fetches the next tier on demand via GET /api/level/:level.
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
export const LevelUp = ({ profile, onClose }) => {
    const startIndex = Math.max(0, profile.allTiers.findIndex((t) => t.level === profile.level));
    const [tiers, setTiers] = useState(profile.allTiers);
    const [index, setIndex] = useState(startIndex);
    const [loadingNext, setLoadingNext] = useState(false);
    const tier = tiers[index];
    const nextTier = tiers[index + 1];
    const unlocked = tier.level <= profile.level;
    const progress = tier.level === profile.level
        ? tier.xpRangeEnd !== null
            ? Math.min(100, ((profile.xp - tier.xpRangeStart) / (tier.xpRangeEnd - tier.xpRangeStart + 1)) * 100)
            : 100
        : unlocked
            ? 100
            : 0;
    const goNext = async () => {
        if (index < tiers.length - 1) {
            setIndex((i) => i + 1);
            return;
        }
        setLoadingNext(true);
        try {
            const res = await fetch(`/api/level/${tier.level + 1}`);
            const json = await res.json();
            setTiers((prev) => [...prev, json.tier]);
            setIndex((i) => i + 1);
        }
        catch (err) {
            console.error('Failed to load next level', err);
        }
        finally {
            setLoadingNext(false);
        }
    };
    return (_jsxs(Modal, { title: `Level ${tier.level}`, onClose: onClose, children: [_jsx("div", { className: "text-sm sm:text-base text-gray-500 dark:text-gray-400 -mt-2", children: tier.label }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between text-xs font-mono-stat text-gray-500 dark:text-gray-400", children: [_jsx("span", { children: tier.xpRangeStart }), _jsx("span", { children: tier.xpRangeEnd ?? '∞' })] }), _jsx("div", { className: "w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: { width: `${progress}%`, backgroundColor: 'var(--color-primary)' } }) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1", children: "Rewards" }), _jsxs("div", { className: "flex flex-col gap-1", children: [tier.rewards.map((reward, i) => (_jsxs("div", { className: "list-item-in text-sm sm:text-base text-gray-800 dark:text-gray-100", style: { ['--i']: i }, children: [unlocked ? (_jsx("span", { style: { color: 'var(--color-success)' }, children: "\u2714" })) : (_jsx("span", { className: "text-gray-400 dark:text-gray-600", children: "\u2717" })), ' ', reward] }, i))), nextTier &&
                                nextTier.rewards.map((reward, i) => (_jsxs("div", { className: "text-sm sm:text-base text-gray-400 dark:text-gray-600", children: ["\u2717 ", reward, " (Lv. ", nextTier.level, ")"] }, `next-${i}`)))] })] }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "w-9 px-0", onClick: () => setIndex((i) => i - 1), disabled: index === 0, "aria-label": "Previous level", children: "\u2190" }), _jsx(Button, { variant: "outline", size: "sm", className: "w-9 px-0", onClick: goNext, loading: loadingNext, "aria-label": "Next level", children: !loadingNext && '→' })] })] }));
};
//# sourceMappingURL=LevelUp.js.map