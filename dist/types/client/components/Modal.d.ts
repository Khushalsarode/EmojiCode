import type { ReactNode } from 'react';
type Props = {
    title: ReactNode;
    onClose: () => void;
    children: ReactNode;
    scroll?: boolean;
};
export declare const Modal: ({ title, onClose, children, scroll }: Props) => import("react").JSX.Element;
export {};
