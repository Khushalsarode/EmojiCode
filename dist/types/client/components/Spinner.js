import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Spinner = ({ size = 22, label }) => (_jsxs("div", { className: "flex flex-col items-center justify-center gap-2 py-4", children: [_jsx("div", { className: "rounded-full border-2 border-gray-200 dark:border-gray-700 animate-spin", style: {
                width: size,
                height: size,
                borderTopColor: 'var(--color-primary)',
                borderRightColor: 'var(--color-primary)',
            } }), label && _jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: label })] }));
//# sourceMappingURL=Spinner.js.map