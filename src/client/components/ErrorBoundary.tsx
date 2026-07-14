// Guards a subtree that can legitimately fail without taking the rest of the
// app down with it — currently just the lazy-loaded Phaser celebration scene
// (CipherBurst.tsx), which is pure polish and should never be able to break
// the actual guess flow if the dynamic import or Phaser init throws.
import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onError?: () => void;
  fallback?: ReactNode;
};

type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.error('Non-critical UI subtree failed, falling back gracefully', error);
    this.props.onError?.();
  }

  override render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
