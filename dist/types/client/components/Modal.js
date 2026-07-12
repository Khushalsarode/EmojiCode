import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Modal = ({ title, onClose, children, scroll }) => (_jsx("div", { className: "fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: [
            'card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col gap-3',
            scroll ? 'max-h-[90vh] overflow-y-auto' : '',
        ]
            .filter(Boolean)
            .join(' '), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-heading font-bold text-lg sm:text-xl", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-all w-8 h-8 flex items-center justify-center", "aria-label": "Close", children: "\u2715" })] }), children] }) }));
//# sourceMappingURL=Modal.js.map