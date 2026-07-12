import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// My Rewards screen — dedicated earned-rewards checklist, separate from the
// leaderboard (01_PRODUCT_DOCUMENTATION.md, Section 13.7).
import { Modal } from './Modal';
export const MyRewards = ({ profile, onClose }) => (_jsx(Modal, { title: "\uD83C\uDFC5 My Rewards", onClose: onClose, children: _jsx("div", { className: "flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3", children: profile && profile.rewardsUnlocked.length > 0 ? (profile.rewardsUnlocked.map((reward, i) => (_jsxs("div", { className: "list-item-in text-sm sm:text-base text-gray-800 dark:text-gray-100", style: { ['--i']: i }, children: [_jsx("span", { style: { color: 'var(--color-success)' }, children: "\u2714" }), " ", reward] }, i)))) : (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500", children: "No rewards earned yet." })) }) }));
//# sourceMappingURL=MyRewards.js.map