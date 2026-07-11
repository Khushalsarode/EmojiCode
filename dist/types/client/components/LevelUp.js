import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// Level-Up / Level Details screen — browsable across every level, not just
// the viewer's current one (01_PRODUCT_DOCUMENTATION.md, Section 13.8).
import { useState } from 'react';
export const LevelUp = ({ profile, onClose }) => {
    const startIndex = Math.max(0, profile.allTiers.findIndex((t) => t.level === profile.level));
    const [index, setIndex] = useState(startIndex);
    const tier = profile.allTiers[index];
    const nextTier = profile.allTiers[index + 1];
    const unlocked = tier.level <= profile.level;
    const progress = tier.level === profile.level
        ? tier.xpRangeEnd !== null
            ? Math.min(100, ((profile.xp - tier.xpRangeStart) / (tier.xpRangeEnd - tier.xpRangeStart + 1)) * 100)
            : 100
        : unlocked
            ? 100
            : 0;
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-heading font-bold text-lg", children: ["Level ", tier.level] }), _jsx("button", { onClick: onClose, className: "text-gray-400", children: "\u2715" })] }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: tier.label }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between text-xs font-mono-stat text-gray-500 dark:text-gray-400", children: [_jsx("span", { children: tier.xpRangeStart }), _jsx("span", { children: tier.xpRangeEnd ?? '∞' })] }), _jsx("div", { className: "w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${progress}%`, backgroundColor: 'var(--color-primary)' } }) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1", children: "Rewards" }), _jsxs("div", { className: "flex flex-col gap-1", children: [tier.rewards.map((reward, i) => (_jsxs("div", { className: "text-sm text-gray-800 dark:text-gray-100", children: [unlocked ? (_jsx("span", { style: { color: 'var(--color-success)' }, children: "\u2714" })) : (_jsx("span", { className: "text-gray-400 dark:text-gray-600", children: "\u2717" })), ' ', reward] }, i))), nextTier &&
                                    nextTier.rewards.map((reward, i) => (_jsxs("div", { className: "text-sm text-gray-400 dark:text-gray-600", children: ["\u2717 ", reward, " (Lv. ", nextTier.level, ")"] }, `next-${i}`)))] })] }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("button", { className: "h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30", onClick: () => setIndex((i) => i - 1), disabled: index === 0, children: "\u2190" }), _jsx("button", { className: "h-9 w-9 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30", onClick: () => setIndex((i) => i + 1), disabled: index === profile.allTiers.length - 1, children: "\u2192" })] })] }) }));
};
//# sourceMappingURL=LevelUp.js.map