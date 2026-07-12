// Full categorized emoji picker for the Create Cipher form (Section 13.5) —
// tabs by Unicode group plus a search box, instead of a small fixed list.
import { useMemo, useState } from 'react';
import { EMOJI_CATEGORIES } from '../emojiData';

type Props = {
  onPick: (emoji: string) => void;
  disabled: boolean;
};

export const EmojiPicker = ({ onPick, disabled }: Props) => {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');

  const visibleEmojis = useMemo(() => {
    if (!query.trim()) return EMOJI_CATEGORIES[tab]!.emojis;
    // Search has no text metadata per-emoji (kept dependency-free), so it
    // just searches across every category's glyphs pasted directly.
    const q = query.trim();
    return EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) => e.includes(q));
  }, [tab, query]);

  return (
    <div className="flex flex-col gap-2">
      <input
        className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 px-2 text-sm bg-transparent text-gray-900 dark:text-gray-100"
        placeholder="Paste an emoji to find it fast…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!query.trim() && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {EMOJI_CATEGORIES.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={i === tab}
              className="shrink-0 w-9 h-9 rounded-md text-lg flex items-center justify-center transition-transform hover:scale-110"
              style={{
                backgroundColor: i === tab ? 'var(--color-primary)' : 'transparent',
                opacity: i === tab ? 1 : 0.6,
              }}
              onClick={() => setTab(i)}
              title={c.label}
            >
              {c.icon}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto content-start">
        {visibleEmojis.map((e, i) => (
          <button
            key={`${e}-${i}`}
            type="button"
            className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-700 text-lg disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
            onClick={() => onPick(e)}
            disabled={disabled}
          >
            {e}
          </button>
        ))}
        {visibleEmojis.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 py-2">No matches.</div>
        )}
      </div>
    </div>
  );
};
