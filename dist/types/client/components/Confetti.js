import { jsx as _jsx } from "react/jsx-runtime";
// Lightweight CSS-only confetti burst for correct guesses / level-ups —
// no canvas, no library, just a handful of absolutely-positioned divs
// falling via a CSS keyframe (see .confetti-piece in index.css).
import { useEffect, useState } from 'react';
const COLORS = ['#14B8A6', '#22C55E', '#F59E0B', '#EF4444', '#FFD700', '#EC4899'];
const PIECE_COUNT = 28;
// Randomized once via a lazy useState initializer (guaranteed to run exactly
// once, unlike a useMemo body — which React's purity rules treat as render
// code and disallow Math.random() in).
export const Confetti = ({ onDone }) => {
    const [pieces] = useState(() => Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.1 + Math.random() * 0.7,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
    })));
    useEffect(() => {
        const t = setTimeout(onDone, 1900);
        return () => clearTimeout(t);
    }, [onDone]);
    return (_jsx("div", { className: "pointer-events-none fixed inset-0 z-[100] overflow-hidden", children: pieces.map((p) => (_jsx("span", { className: "confetti-piece absolute top-0 w-2 h-3 rounded-sm", style: {
                left: `${p.left}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ['--rot']: `${p.rotate}deg`,
            } }, p.id))) }));
};
//# sourceMappingURL=Confetti.js.map