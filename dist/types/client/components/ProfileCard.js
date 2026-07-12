import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// Personal Profile Card — stretch goal (01_PRODUCT_DOCUMENTATION.md, Section 13.10).
import { Modal } from './Modal';
export const ProfileCard = ({ profile, onClose }) => {
    const nextTier = profile.allTiers.find((t) => t.level === profile.level + 1);
    const progress = profile.xpRangeEnd !== null
        ? Math.min(100, ((profile.xp - profile.xpRangeStart) / (profile.xpRangeEnd - profile.xpRangeStart + 1)) * 100)
        : 100;
    return (_jsxs(Modal, { title: _jsxs("span", { className: "font-pixel", children: ["u/", profile.username] }), onClose: onClose, children: [_jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: ["\uD83C\uDFC5 ", profile.label, " \u00B7 Level ", profile.level] }), profile.currentStreak > 0 && (_jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: [_jsx("span", { className: "flame-icon", children: "\uD83D\uDD25" }), " ", profile.currentStreak, "-day streak"] })), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("div", { className: "w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden progress-shimmer", children: _jsx("div", { className: "h-full rounded-full transition-all duration-700 ease-out", style: { width: `${progress}%`, backgroundColor: 'var(--color-primary)' } }) }), _jsxs("span", { className: "text-xs font-mono-stat text-gray-500 dark:text-gray-400", children: [profile.xp, " / ", profile.xpRangeEnd !== null ? profile.xpRangeEnd + 1 : '∞', " XP", nextTier ? ` toward ${nextTier.label}` : ''] })] }), _jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-2 flex flex-col gap-1 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Total decodes:" }), _jsx("span", { className: "font-mono-stat text-gray-800 dark:text-gray-100", children: profile.totalDecodes })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Ciphers posted:" }), _jsx("span", { className: "font-mono-stat text-gray-800 dark:text-gray-100", children: profile.totalPostsCreated })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Best post (upvotes):" }), _jsx("span", { className: "font-mono-stat text-gray-800 dark:text-gray-100", children: profile.bestPostUpvotes })] })] }), profile.badges.length > 0 && (_jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-2", children: [_jsx("div", { className: "text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1", children: "Badges" }), _jsx("div", { className: "flex flex-wrap gap-2", children: profile.badges.map((badge, i) => (_jsx("span", { title: badge.label, className: "badge-pop w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg border hover:scale-110 transition-transform", style: {
                                ['--i']: i,
                                backgroundColor: badge.tier === 1
                                    ? 'color-mix(in srgb, #CD7F32 25%, transparent)'
                                    : badge.tier === 2
                                        ? 'color-mix(in srgb, #C0C0C0 30%, transparent)'
                                        : badge.tier === 3
                                            ? 'color-mix(in srgb, #FFD700 30%, transparent)'
                                            : 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                                borderColor: badge.tier === 1
                                    ? '#CD7F32'
                                    : badge.tier === 2
                                        ? '#C0C0C0'
                                        : badge.tier === 3
                                            ? '#FFD700'
                                            : 'var(--color-primary)',
                            }, children: badge.icon }, badge.id))) })] }))] }));
};
//# sourceMappingURL=ProfileCard.js.map