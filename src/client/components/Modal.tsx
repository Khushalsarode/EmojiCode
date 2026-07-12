// Shared overlay + card shell — every screen used to hand-roll its own
// backdrop/card/close-button markup with small drifts (some had the pop-in
// animation, some didn't; padding and radius varied). One component now.
import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  scroll?: boolean; // for content that can outgrow the viewport (lists)
};

export const Modal = ({ title, onClose, children, scroll }: Props) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
    <div
      className={[
        'card-glow modal-pop bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col gap-3',
        scroll ? 'max-h-[90vh] overflow-y-auto' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-lg sm:text-xl">{title}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-all w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);
