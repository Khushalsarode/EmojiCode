// Guards a subtree that can legitimately fail without taking the rest of the
// app down with it — currently just the lazy-loaded Phaser celebration scene
// (CipherBurst.tsx), which is pure polish and should never be able to break
// the actual guess flow if the dynamic import or Phaser init throws.
import { Component } from 'react';
export class ErrorBoundary extends Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error) {
        console.error('Non-critical UI subtree failed, falling back gracefully', error);
        this.props.onError?.();
    }
    render() {
        if (this.state.hasError)
            return this.props.fallback ?? null;
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map