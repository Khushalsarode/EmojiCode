import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SIZE_CLASSES = {
    sm: 'h-9 px-3 text-xs sm:h-10 sm:text-sm',
    md: 'h-11 px-4 text-sm sm:h-12 sm:text-base',
    lg: 'h-12 px-5 text-base sm:h-14 sm:text-lg',
};
const VARIANT_CLASSES = {
    primary: 'btn-glow text-white',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:border-[var(--color-primary)] hover:-translate-y-0.5',
    ghost: 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300',
    danger: 'text-white hover:brightness-110 shadow-sm hover:-translate-y-0.5',
};
export const Button = ({ variant = 'primary', size = 'md', fullWidth, loading, disabled, className = '', style, children, ...rest }) => {
    const bg = variant === 'primary'
        ? 'var(--color-primary)'
        : variant === 'danger'
            ? 'var(--color-danger)'
            : undefined;
    return (_jsxs("button", { className: [
            'btn-glass rounded-lg font-medium inline-flex items-center justify-center gap-2 disabled:opacity-40',
            VARIANT_CLASSES[variant],
            SIZE_CLASSES[size],
            fullWidth ? 'w-full' : '',
            className,
        ]
            .filter(Boolean)
            .join(' '), style: { backgroundColor: bg, ...style }, disabled: disabled || loading, ...rest, children: [loading && (_jsx("span", { className: "w-4 h-4 rounded-full border-2 animate-spin shrink-0", style: { borderColor: 'currentColor', borderTopColor: 'transparent', opacity: 0.85 } })), children] }));
};
//# sourceMappingURL=Button.js.map