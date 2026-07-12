# 🔐 EmojiCode

**Encode it in 5. Crack it in comments.**

A comment-driven cipher-guessing game for Reddit, built with [Devvit Web](https://developers.reddit.com/). Encode a movie, show, phrase, or piece of community lore into **exactly 5 emojis**, hit submit, and it's live in the feed instantly — other redditors guess what it means right in the comments (or inline, without ever leaving the post).

Built for **Reddit's "Games with a Hook" Hackathon** (with Phaser), June 17 – July 15, 2026.

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
11. [Known Limitations](#known-limitations)
12. [License](#license)

---

## What is this?

EmojiCode follows the same publishing model that made [Pixelary](https://reddit.com/r/Pixelary) work: **you create, you hit submit, and it's live immediately** — your own post, in the feed, right away. There's no daily curation, no queue, and no human moderator in the loop. An automated safety check gates publishing, and automated fuzzy-matching scores every guess in real time.

- 🔤 **Comment-native** — the core gameplay lives in Reddit's own comment thread (guesses can be typed directly as comments, or inline on the post itself).
- ⚡ **Instant-publish** — submit 5 emojis + the answer, and it's posted immediately as your own post.
- 🤖 **Fully autonomous** — no manual moderation, no manual scoring. A safety classifier and a Levenshtein-based fuzzy matcher run the whole pipeline.
- 📱 **Mobile-first** — fluid, responsive layout tuned for Reddit's actual inline post width, not just desktop.

## How to Play

1. **Guess** — type what you think the 5 emojis mean, right in the post or in the comments. Close but not exact gets a "so close" nudge instead of a flat miss.
2. **Stuck?** Tap 💡 **Hint** for a Wordle-style blank pattern (word count + letter shapes only — never a real letter), or 🏳 **Give Up** to reveal the answer with no penalty.
3. **Create** — pick exactly 5 emojis from the full categorized picker, type the answer, tag a category + language, and post it. It's live instantly.
4. **Progress** — correct guesses earn XP, build a daily streak, and level you up through named ranks (Rookie Decoder → Legendary Cipher and beyond — levels are uncapped). First to crack a post earns 🥇 First Crack; the next few solvers get a ranked medal too.
5. **Compete** — two separate leaderboards: 🔎 **Decoders** (XP from guessing) and 👑 **Cipher Masters** (upvotes earned on posts you created).

A full in-app **❓ How to Play** panel is always one tap away from the Home Menu, so none of this needs to be memorized up front.

## Features

**Core loop**
- Instant-publish cipher submission (5-emoji picker with ~600 emojis across 9 categories, plus quick search)
- Real-time fuzzy-match guess scoring (typed inline or as a native Reddit comment)
- Hint (Wordle-style blank reveal) and Give Up flows
- Category + language tagging (9 categories, 21 languages)
- Hard Mode tagging (Level 3+ unlock)

**Progression & retention**
- XP / uncapped leveling system with named ranks and per-level rewards
- Daily streaks, with a **streak-at-risk nudge** on the home screen if you haven't played today
- Achievement badges (streak milestones, decode milestones, First Crack, Cipher Master standing)
- **"Almost there" progress teaser** — see exactly how many more decodes to your next level, right on the Home Menu
- **🌟 Cipher of the Day** — a daily featured pick with bonus XP, refreshed automatically every midnight UTC
- Two leaderboards (Decoders + Cipher Masters), each with weekly and all-time views
- 🌟 Trending rail (Level 6+ "Featured eligibility" reward)
- Automated weekly leaderboard digest post

**Player-facing screens**
- Home Menu, Create a Cipher, My Ciphers, My Rewards, Level-Up, Solved Recap (with a live difficulty rating and guess-distribution chart), Leaderboard, Personal Profile Card, How to Play, Sound Settings
- A persistent hub post acts as the app's home screen — showing the full menu directly on the feed card, not just a single "open" button

**Polish**
- Full responsive/mobile-fluid layout (`clamp()`-based sizing, not fixed breakpoint jumps)
- Custom sound engine — real audio files with an automatic synthesized fallback, independent SFX/music volume controls
- CSS-only confetti, loading spinners, staggered list/badge animations, glassy button/wordmark shine
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

No canvas, no websockets, no external services — just text, Redis, and one lightweight fuzzy-matching layer.

## Project Structure

```
src/
  client/            React client — two Devvit Web entry points:
    splash.tsx         the lightweight inline feed-card view (kept deliberately small)
    game.tsx            the full expanded view (heavy logic, sound, confetti, all screens)
    components/         shared UI components (Button, Modal, Leaderboard, HomeMenu, ...)
    navHandoff.ts        cross-entrypoint deep-link handoff (splash → game)
    sound.ts             sound engine (real files + synthesized fallback)
  server/
    routes/            Hono route handlers (api, menu, triggers, cron)
    core/              business logic (leveling, matching, guessing, badges, safety, ...)
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
- **App listing:** _[add your developer.reddit.com app listing link here]_
- **Demo post:** _[add the public post URL from your subreddit here]_

## Design & Architecture Notes

This project has extensive internal documentation covering product decisions, setup steps, and the full build history — useful if you're extending it further:

- `01_PRODUCT_DOCUMENTATION.md` — full product spec, scoring rules, data model, judging-criteria alignment
- `02_SETUP_AND_DEPLOYMENT.md` — detailed setup/deploy walkthrough
- `03_REDDIT_APP_SETUP.md` — Reddit app registration and permission-scoping guidance
- `README_START_HERE.md` — a running changelog of everything built, including deliberate tradeoffs (e.g. why this app doesn't request moderator-scope permissions)

## Known Limitations

- The submission safety classifier (`src/server/core/safety.ts`) is an MVP word-denylist — swap it for a real moderation service before any wide public launch beyond the hackathon demo.
- No Phaser is used in this project, so it isn't eligible for the "Best Use of Phaser" sub-award by design.
- Two Pixelary-style features were deliberately left out: a stickied "Game Master" stats comment + level flair (would require a broad moderator permission scope this app intentionally avoids requesting), and a crowd-sourced answer dictionary (a different core mechanic than this game's single fuzzy-matched answer — see `README_START_HERE.md` for the full tradeoff writeup).

## License

BSD-3-Clause — see [`LICENSE`](./LICENSE).
