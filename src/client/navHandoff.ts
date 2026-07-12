// Cross-entrypoint navigation handoff. Devvit's requestExpandedMode(event,
// entry) can only name an *entry* (e.g. "game"), not a target screen inside
// it — there's no deep-link API. So splash.tsx stashes the screen the user
// actually tapped here, right before expanding, and game.tsx reads it once
// on mount to land there directly instead of always opening on its own menu.
const KEY = 'emojicode-nav-handoff';

export type NavTarget =
  | 'rewards'
  | 'leaderboard'
  | 'myciphers'
  | 'profile'
  | 'trending'
  | 'sound'
  | 'howto'
  | 'create';

export const setNavHandoff = (target: NavTarget): void => {
  try {
    localStorage.setItem(KEY, target);
  } catch {
    // ignore — storage may be restricted in some webview contexts
  }
};

export const readNavHandoff = (): NavTarget | null => {
  try {
    return localStorage.getItem(KEY) as NavTarget | null;
  } catch {
    return null;
  }
};

export const clearNavHandoff = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};
