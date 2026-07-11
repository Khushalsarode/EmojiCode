import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Leaderboard screen (01_PRODUCT_DOCUMENTATION.md, Section 13.9).
import { useEffect, useState } from 'react';
export const Leaderboard = ({ onClose }) => {
    const [window_, setWindow] = useState('weekly');
    const [data, setData] = useState(null);
    useEffect(() => {
        const load = async () => {
            setData(null);
            try {
                const res = await fetch(`/api/leaderboard?window=${window_}`);
                const json = await res.json();
                setData(json);
            }
            catch (err) {
                console.error('Failed to load leaderboard', err);
            }
        };
        void load();
    }, [window_]);
    return (_jsx("div", { className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-heading font-bold text-lg", children: "\uD83C\uDFC6 Leaderboard" }), _jsx("button", { onClick: onClose, className: "text-gray-400", children: "\u2715" })] }), _jsxs("select", { className: "self-start text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1", value: window_, onChange: (e) => setWindow(e.target.value), children: [_jsx("option", { value: "weekly", children: "Weekly" }), _jsx("option", { value: "alltime", children: "All-Time" })] }), _jsx("div", { className: "flex flex-col gap-2 max-h-80 overflow-y-auto", children: !data ? (_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400 text-center py-4", children: "Loading\u2026" })) : data.entries.length === 0 ? (_jsx("div", { className: "text-sm text-gray-400 dark:text-gray-500 text-center py-4", children: "No scores yet." })) : (data.entries.map((entry, i) => (_jsx("div", { className: "flex items-center justify-between text-sm", children: _jsxs("div", { children: [_jsxs("span", { className: "font-mono-stat text-gray-400 dark:text-gray-500 mr-2", children: [i + 1, "."] }), _jsxs("span", { className: "text-gray-800 dark:text-gray-100", children: ["u/", entry.username] }), _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 ml-6", children: ["\uD83C\uDFC5 ", entry.label, " \u00B7 ", entry.score, " pts"] })] }) }, entry.userId)))) })] }) }));
};
//# sourceMappingURL=Leaderboard.js.map