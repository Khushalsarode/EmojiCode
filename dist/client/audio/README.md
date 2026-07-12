# Real audio files — status: filled in ✅

`client/sound.ts` looks for these exact filenames first, and only falls back
to a synthesized tone if a file is missing. All 9 are present as of this
writing. Note: `sound.ts`'s `SFX_FILES` map points at each file's *actual*
encoded format, checked via magic bytes rather than assumed from a filename —
`sfx-click`, `sfx-open`, and `sfx-close` turned out to be WAV data and were
renamed to `.wav` accordingly; the rest are genuine MP3s.

| Filename | Used for | Suggested length / style |
|---|---|---|
| `sfx-click.wav` | Every button press | 0.05–0.1s soft UI tick |
| `sfx-open.wav` | Opening a screen/overlay | 0.1–0.2s soft whoosh/pop |
| `sfx-correct.mp3` | Correct guess | 0.5–1s cheerful chime/arpeggio |
| `sfx-close.wav` | "So close" (near-miss) guess | 0.3–0.5s neutral/curious blip |
| `sfx-wrong.mp3` | Wrong guess | 0.3–0.5s soft buzz/thud (not harsh) |
| `sfx-levelup.mp3` | Level up | 1–2s triumphant fanfare |
| `sfx-post.mp3` | Cipher published | 0.5–1s satisfying "posted" ding |
| `sfx-error.mp3` | Rejected submission / network error | 0.3–0.5s low descending tone |
| `bgm-ambient.mp3` | Background music (opt-in, off by default) | 30s+ **seamless loop**, calm/ambient — this one plays continuously, so avoid anything with a hard attack or drum hits that would click on loop. Currently ~4.3MB — fine since music is opt-in and lazy-loaded only when enabled, but worth compressing further if load time on slow connections becomes a concern. |

If you swap any file for a new one, keep the same base filename — extension
can be `.mp3`, `.wav`, or `.ogg`, just update the matching entry in
`client/sound.ts`'s `SFX_FILES` (or `BGM_FILE`) to point at the right one.

## Where to get real ones (safe to ship in a public Reddit app)

- **kenney.nl** — public domain (CC0), no attribution needed. Has dedicated UI/interface sound packs — the easiest safe source for all the `sfx-*` files above.
- **pixabay.com** (sound-effects and music sections) — free for commercial use, no attribution required.
- **opengameart.org** — filter specifically by CC0 license.
- **mixkit.co** — free SFX and background music, simple license.
- **incompetech.com** (Kevin MacLeod) — good for the ambient loop specifically; requires attribution (CC-BY) — credit him in the subreddit's sidebar/about if you use one of his tracks.

Once you've got files, just rename them to match the table above and drop
them in this folder — `npm run build` picks them up automatically (Vite
copies `public/` as-is to `dist/client/`, and the app already prefers a real
file over the synthesized fallback whenever one exists).
