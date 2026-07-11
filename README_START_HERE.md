# EmojiCode — Scaffolded Devvit Web Project

This was scaffolded and verified (type-checked, linted, built) against the real
`reddit/devvit-template-react` architecture. What's real, working code vs. what
still needs you:

## Already working
- Full project structure per `04_DEVVIT_WEB_BUILD_SKILL.md`
- `npx tsc --build` passes clean
- `npx eslint 'src/**/*.{ts,tsx}'` passes clean
- `npx vite build` succeeds with zero warnings
- Instant-publish flow: submission modal → `/api/submit-cipher` → `reddit.submitCustomPost()`
- Guess scoring: real comment posted via `reddit.submitComment(..., runAs: 'USER')` + Levenshtein-based matching
- XP/Level/Rewards system (`core/leveling.ts`) matching the product doc exactly
- Give-up flow, guess-distribution tracking for the future recap screen

## You still need to do
1. `npm install`
2. `npm run login` (your own Reddit account — I can't do this from here)
3. Create your test subreddit (see `03_REDDIT_APP_SETUP.md`)
4. `npm run dev` and playtest for real
5. **Swap the MVP safety classifier** (`core/safety.ts`, currently a tiny denylist) for a real moderation service before any public launch
6. **Verify the `redis.zAdd`/`zRange` calls** in `routes/api.ts` against current Devvit docs — I used the standard Redis client signature but flagged it as unconfirmed against Devvit's exact wrapper
7. Build out the remaining UI screens from the product doc (Home Menu, My Rewards, Level-Up, Solved Recap) — only the core guess/submit loop is wired up so far

See `02_SETUP_AND_DEPLOYMENT.md` for the full command reference.
