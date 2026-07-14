# 🔐 EmojiCode

**Encode it in 5. Crack it in comments.**

A comment-driven cipher-guessing game for Reddit, built with [Devvit Web](https://developers.reddit.com/). Encode a movie, show, phrase, or piece of community lore into **exactly 5 emojis**, hit submit, and it's live in the feed instantly — other redditors guess what it means right in the comments (or inline, without ever leaving the post).

Built for **Reddit's "Games with a Hook" Hackathon** (with Phaser), June 17 – July 15, 2026.

> **Status:** Build complete — feature-complete against the MVP spec and passing `type-check`/`lint`. Remaining work is entirely publish-side: deploy to a public test subreddit, seed demo posts, and submit on Devpost.

---

## Table of Contents

1. [What is this?](#what-is-this)
2. [How to Play](#how-to-play)
3. [Features](#features)
4. [Why it's "hooky" — retention design](#why-its-hooky--retention-design)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Available Scripts](#available-scripts)
9. [Hackathon Submission](#hackathon-submission)
10. [Design & Architecture Notes](#design--architecture-notes)
11. [Safety, Matching & Moderator-Scope Features](#safety-matching--moderator-scope-features)
12. [License](#license)

---

## What is this?

EmojiCode is built around an instant-publish model: **you create, you hit submit, and it's live immediately** — your own post, in the feed, right away. There's no daily curation, no queue, and no human moderator in the loop. An automated safety check gates publishing, and automated fuzzy-matching scores every guess in real time.

- 🔤 **Comment-native** — the core gameplay lives in Reddit's own comment thread (guesses can be typed directly as comments, or inline on the post itself).
- ⚡ **Instant-publish** — submit 5 emojis + the answer, and it's posted immediately as your own post.
- 🤖 **Fully autonomous** — no manual moderation, no manual scoring. A local safety denylist (optionally backed by a real hosted moderation classifier) and a Levenshtein-based fuzzy matcher plus crowd-sourced answer dictionary run the whole pipeline.
- 📱 **Mobile-first** — fluid, responsive layout tuned for Reddit's actual inline post width, not just desktop.

## How to Play

1. **Guess** — type what you think the 5 emojis mean, right in the post or in the comments. Close but not exact gets a "so close" nudge instead of a flat miss.
2. **Stuck?** Tap 💡 **Hint** for a blank-pattern nudge (word count + letter shapes only — never a real letter), or 🏳 **Give Up** to reveal the answer with no penalty.
3. **Create** — pick exactly 5 emojis from the full categorized picker, type the answer, tag a category + language, and post it. It's live instantly.
4. **Progress** — correct guesses earn XP, build a daily streak, and level you up through named ranks (Rookie Decoder → Legendary Cipher and beyond — levels are uncapped). First to crack a post earns 🥇 First Crack; the next few solvers get a ranked medal too.
5. **Compete** — two separate leaderboards: 🔎 **Decoders** (XP from guessing) and 👑 **Cipher Masters** (upvotes earned on posts you created).

A full in-app **❓ How to Play** panel is always one tap away from the Home Menu, so none of this needs to be memorized up front.

## Features

**Core loop**
- Instant-publish cipher submission (5-emoji picker with ~600 emojis across 9 categories, plus quick search)
- Real-time fuzzy-match guess scoring (typed inline or as a native Reddit comment)
- Hint (blank-pattern reveal) and Give Up flows
- Category + language tagging (9 categories, 21 languages)
- Hard Mode tagging (Level 3+ unlock)
- Real hosted-moderation safety check (opt-in via API key) layered on top of the always-on local denylist
- Crowd-sourced answer dictionary — solvers can add alternate accepted phrasings for a cipher

**Progression & retention**
- XP / uncapped leveling system with named ranks and per-level rewards
- Daily streaks, with a **streak-at-risk nudge** on the home screen if you haven't played today
- Achievement badges (streak milestones, decode milestones, First Crack, Cipher Master standing)
- **"Almost there" progress teaser** — see exactly how many more decodes to your next level, right on the Home Menu
- **🌟 Cipher of the Day** — a daily featured pick with bonus XP, refreshed automatically every midnight UTC
- Two leaderboards (Decoders + Cipher Masters), each with weekly and all-time views
- 🌟 Trending rail (Level 6+ "Featured eligibility" reward)
- Automated weekly leaderboard digest post
- Native Reddit flair synced to level on every level-up
- Stickied, auto-updating "N redditors have cracked this" comment on every cipher post

**Player-facing screens**
- Home Menu, Create a Cipher, My Ciphers, My Rewards, Level-Up, Solved Recap (with a live difficulty rating and guess-distribution chart), Leaderboard, Personal Profile Card, How to Play, Sound Settings
- A persistent hub post acts as the app's home screen — showing the full menu directly on the feed card, not just a single "open" button

**Polish**
- Full responsive/mobile-fluid layout (`clamp()`-based sizing, not fixed breakpoint jumps)
- Custom sound engine — real audio files with an automatic synthesized fallback, independent SFX/music volume controls
- Phaser physics burst on every solve (see below), plus CSS-only loading spinners, staggered list/badge animations, glassy button/wordmark shine
- Dark mode throughout, with a warm "Cipher Teal" design system (not a generic purple-gradient default)
- Distinct pixel-font treatment for the wordmark and every displayed Reddit username

## Why it's "hooky" — retention design

The hackathon's core judging question is whether the game gives players "a reason to return day after day." EmojiCode's answer:

- **Something new to check daily** — Cipher of the Day, refreshed every midnight.
- **Something to protect** — an active streak, with a visible nudge before you lose it.
- **Something to chase** — XP toward a named rank, surfaced as a concrete "N more decodes to X" rather than an abstract bar.
- **Something the community made** — every post is user-authored; there is no pre-made content to run out of.

## Tech Stack

| Layer | Tech |
|---|---|
| Platform | [Devvit Web](https://developers.reddit.com/) (Reddit's developer platform) |
| Client | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS 4 (CSS-native `@theme` tokens) |
| Server | [Hono](https://hono.dev/) running on Devvit's server runtime |
| Storage | Redis (via `@devvit/redis`) — key-value + sorted sets, no external database |
| Scheduling | Devvit Scheduler (daily Cipher-of-the-Day pick, weekly leaderboard digest) |
| Moderation (optional) | [OpenAI Moderation endpoint](https://platform.openai.com/docs/guides/moderation) — free per-call, only active once `openaiApiKey` is set; falls back to a local word-denylist otherwise |
| Celebration | [Phaser](https://phaser.io/) Arcade Physics — a real physics burst scene for the solve moment, code-split via `React.lazy` so it never loads until a cipher is actually cracked |

No general-purpose canvas UI, no websockets — just text, Redis, a lightweight fuzzy-matching + crowd-sourced-dictionary layer, one optional outbound call (domain-allowlisted to `api.openai.com` in `devvit.json`) for real moderation, and one lazy-loaded Phaser scene reserved for the solve celebration.

## Project Structure

```
src/
  client/            React client — two Devvit Web entry points:
    splash.tsx         the lightweight inline feed-card view (kept deliberately small)
    game.tsx            the full expanded view (heavy logic, sound, all screens)
    components/         shared UI components (Button, Modal, Leaderboard, HomeMenu, ...)
    components/CipherBurst.tsx  Phaser solve-celebration scene — lazy-loaded, never
                                 bundled into game.tsx's initial chunk
    navHandoff.ts        cross-entrypoint deep-link handoff (splash → game)
    sound.ts             sound engine (real files + synthesized fallback)
  server/
    routes/            Hono route handlers (api, menu, triggers, cron)
    core/              business logic (leveling, matching, guessing, badges, safety,
                        moderation, answerDictionary, ...)
  shared/
    api.ts             shared request/response types — the single source of truth
                        between client and server
public/audio/        real audio assets (see public/audio/README.md for sourcing)
devvit.json          Devvit app manifest (entry points, permissions, scheduler, triggers)
```

## Getting Started

> Requires Node 22+.

```bash
npm install
npm run login              # authenticate the Devvit CLI with your Reddit account
```

Create a test subreddit and make sure its name matches `devvit.json`'s `dev.subreddit` field exactly (currently `emojicode_dev`) — see the setup guide for details.

```bash
npm run dev                 # starts a live playtest server against your test subreddit
```

> **Windows note:** run build/typecheck/lint commands from **PowerShell**, not Git Bash — the Devvit Vite plugin's Node spawn has a known quoting issue under Git Bash on Windows.

Everything above works with zero external accounts. One optional setting (`openaiApiKey`) upgrades the safety classifier — see [Safety, Matching & Moderator-Scope Features](#safety-matching--moderator-scope-features) below.

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Live playtest server (`devvit playtest`) |
| `npm run build` | Builds the client and server bundles |
| `npm run type-check` | Runs `tsc --build` across all three tsconfigs |
| `npm run lint` | ESLint over the full `src/` tree |
| `npm run deploy` | Type-checks, lints, then uploads a new app version |
| `npm run launch` | Runs `deploy`, then publishes the app for review |
| `npm run login` | Authenticates the Devvit CLI |
| `npm run prettier` | Formats the codebase |

## Hackathon Submission

- **Event:** Reddit x Phaser "Games with a Hook" Hackathon
- **Category:** Best Experience That Will Keep People Coming Back
- **Sub-challenges targeted:** Best Use of Retention Mechanics, Best Use of User Contributions
- **App listing:** _[add your developer.reddit.com app listing link here once published]_
- **Demo subreddit:** _[add your public test subreddit link here]_
- **Demo post:** _[add the public post URL from your subreddit here]_

## Design & Architecture Notes

This project has extensive internal documentation covering product decisions, setup steps, and the full build history — useful if you're extending it further, including the full product spec, scoring rules and data model, a detailed setup/deploy walkthrough, app registration and permission-scoping guidance, a ready-to-paste submission write-up, and ready-to-paste subreddit page content — see the companion docs in this repository.

## Safety, Matching & Moderator-Scope Features

- **Safety classifier** (`src/server/core/safety.ts` + `moderation.ts`): a local word-denylist runs first, always, for free. If an `openaiApiKey` is set (see below), every submission and every crowd-sourced answer suggestion is also checked against OpenAI's Moderation endpoint (free to call, no per-request billing) — and a failed/erroring call rejects the submission rather than silently publishing it (fail-closed). With no key set, the app falls back to the local denylist alone, exactly as before.
- **Answer matching** (`src/server/core/matching.ts`): normalized-string + Levenshtein distance for typo/casing tolerance, plus a **crowd-sourced answer dictionary** (`core/answerDictionary.ts`) for real synonym coverage — a player who has already solved a cipher can contribute an alternate accepted phrasing (e.g. "Simba movie" alongside "The Lion King"), so future guessers get credit for it directly. This avoids needing a paid embeddings API for semantic matching.
- **Reddit flair sync + stickied stats comment** (`core/guessing.ts`, `core/post.ts`): level-ups now sync the player's level/label onto native subreddit flair, and every cipher post gets a stickied, auto-updating "N redditors have cracked this" comment. Both require the `moderator` Reddit permission scope (see `devvit.json`) — a deliberate scope-widening beyond the original MVP's minimal-permissions design.
- **Phaser** (`src/client/components/CipherBurst.tsx`): the solve-celebration moment is a real Phaser Arcade Physics scene — the 5 solved emojis burst outward, fall under gravity, and bounce, while the XP counter tweens up and First Crack gets an extra flourish. Free/MIT-licensed, self-hosted (no API key, no billing), and code-split via `React.lazy` so its ~1MB bundle only downloads at the moment of a correct guess — `game.js` itself stays at ~52KB. This is what makes the project eligible for the hackathon's "Best Use of Phaser" sub-award.

### External setting required

None of the above requires payment, but the hosted moderation layer needs a **free OpenAI account and API key** (the Moderation endpoint itself has no per-call charge):

```bash
devvit settings set openaiApiKey
```

Paste the key when prompted. Leave it unset to run entirely offline on the local denylist — nothing else in the app depends on it.

## License

BSD-3-Clause — see [`LICENSE`](./LICENSE).
