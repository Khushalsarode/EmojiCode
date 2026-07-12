import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// How to Play — a persistent, always-reachable reference panel, separate
// from the one-time onboarding tooltip in game.tsx (which only ever shows
// once per browser). Judges/new players landing cold on a demo post won't
// necessarily see that tooltip fire, so this needs to explain the whole
// loop on its own without assuming any prior context.
import { Modal } from './Modal';
const Section = ({ icon, title, children }) => (_jsxs("div", { children: [_jsxs("div", { className: "text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1", children: [icon, " ", title] }), _jsx("ul", { className: "flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300 list-disc pl-4", children: children.map((line, i) => (_jsx("li", { children: line }, i))) })] }));
export const HowToPlay = ({ onClose }) => (_jsxs(Modal, { title: "\u2753 How to Play", onClose: onClose, scroll: true, children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 -mt-2", children: "Every post is a movie, show, or phrase encoded into exactly 5 emojis. Decode it, or stump everyone with your own." }), _jsx(Section, { icon: "\uD83D\uDD24", title: "Guessing", children: [
                'Type your guess in the box and hit Send — right in the post, no need to open comments.',
                'Close but not exact? You’ll get a "so close" nudge instead of a flat miss.',
                '💡 Hint reveals the word count and letter shapes only — never a letter of the real answer.',
                '🏳 Give Up reveals the answer if you’re stuck — no penalty, just no XP for that one.',
            ] }), _jsx(Section, { icon: "\uD83C\uDFC6", title: "Progression", children: [
                'Correct guesses earn XP and build a daily streak — the streak is what resets if you skip a day.',
                'XP levels you up through named ranks, each unlocking new rewards and badges.',
                'First to crack a post gets 🥇 First Crack; the next few solvers get a ranked medal too.',
                'Two leaderboards: 🔎 Decoders (XP from guessing) and 👑 Cipher Masters (upvotes on posts you made).',
            ] }), _jsx(Section, { icon: "\u2728", title: "Creating a Cipher", children: [
                'Pick exactly 5 emojis from the picker, then type what they decode to.',
                'Tag a category and language so guessers know what they’re looking for.',
                'Level 3+ unlocks 🔥 Hard Mode; Level 6+ posts can appear in 🌟 Trending.',
                'Posting a cipher earns XP the moment it goes live, on top of anything it earns later.',
            ] })] }));
//# sourceMappingURL=HowToPlay.js.map