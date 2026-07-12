import type { ButtonHTMLAttributes } from 'react';
type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
    fullWidth?: boolean;
    loading?: boolean;
};
export declare const Button: ({ variant, size, fullWidth, loading, disabled, className, style, children, ...rest }: Props) => import("react").JSX.Element;
export {};
