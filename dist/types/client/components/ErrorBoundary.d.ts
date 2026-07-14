import { Component, type ReactNode } from 'react';
type Props = {
    children: ReactNode;
    onError?: () => void;
    fallback?: ReactNode;
};
type State = {
    hasError: boolean;
};
export declare class ErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(): State;
    componentDidCatch(error: unknown): void;
    render(): ReactNode;
}
export {};
