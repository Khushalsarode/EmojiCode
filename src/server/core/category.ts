// Lightweight auto-category tagging (stretch goal from Section 9.3 / MVP-adjacent).
// Keyword heuristics only — no external API. Swap later for a real classifier.

import type { CipherCategory } from '../../shared/api';

const RULES: { category: CipherCategory; patterns: RegExp[] }[] = [
  {
    category: 'Movie',
    patterns: [
      /\b(movie|film|cinema|hollywood|pixar|disney|marvel|star wars|lord of the rings|matrix|inception)\b/i,
      /\b(lion king|frozen|avatar|titanic|joker|batman|spiderman|spider-man)\b/i,
    ],
  },
  {
    category: 'Show',
    patterns: [
      /\b(show|series|sitcom|anime|netflix|hbo|tv)\b/i,
      /\b(friends|office|breaking bad|stranger things|game of thrones|seinfeld|simpsons)\b/i,
    ],
  },
  {
    category: 'Game',
    patterns: [
      /\b(game|videogame|video game|nintendo|playstation|xbox|steam|pokemon|zelda|minecraft|fortnite)\b/i,
    ],
  },
  {
    category: 'Book',
    patterns: [/\b(book|novel|harry potter|hobbit|gatsby|orwell|tolkien)\b/i],
  },
  {
    category: 'Sub-Lore',
    patterns: [/\b(reddit|subreddit|mod|karma|upvote|snoo|lore)\b/i],
  },
];

export const inferCategory = (answer: string): CipherCategory => {
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(answer))) return rule.category;
  }
  return 'Other';
};
