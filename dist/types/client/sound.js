// Sound engine — prefers real audio files dropped into `public/audio/`, and
// automatically falls back to a synthesized Web Audio tone/pad for anything
// missing. That means the app works today with zero audio files present, and
// the moment a real file with the right name shows up, it's used instead —
// no code changes needed. See `public/audio/README.md` for exactly which
// filenames to add and where to source them.
// Settings persist to localStorage, same pattern as the onboarding tooltip.
const SETTINGS_KEY = 'emojicode-sound-settings';
const DEFAULT_SETTINGS = {
    sfxEnabled: true,
    // Both on by default — browsers still block actual playback until the
    // first user gesture regardless (see unlockAudio below), so this is safe:
    // nothing plays unannounced before the player has already tapped something.
    musicEnabled: true,
    sfxVolume: 0.5,
    musicVolume: 0.25,
};
let settings = loadSettings();
const listeners = new Set();
function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw)
            return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
    catch {
        return { ...DEFAULT_SETTINGS };
    }
}
function persist() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    catch {
        // ignore — iframe storage can be restricted
    }
}
function notify() {
    listeners.forEach((fn) => fn(settings));
}
export const getSoundSettings = () => settings;
export const subscribeSoundSettings = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};
export const updateSoundSettings = (patch) => {
    settings = { ...settings, ...patch };
    persist();
    if ('musicEnabled' in patch) {
        if (settings.musicEnabled)
            startAmbient();
        else
            stopAmbient();
    }
    if ('musicVolume' in patch)
        setAmbientVolume(settings.musicVolume);
    notify();
};
let ctx = null;
const ensureContext = () => {
    if (typeof window === 'undefined')
        return null;
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor)
        return null;
    if (!ctx)
        ctx = new Ctor();
    if (ctx.state === 'suspended')
        void ctx.resume();
    return ctx;
};
// Call on every user click (see game.tsx's root listener) — cheap/idempotent,
// and required by browser autoplay policy before any tone or file can play.
// Also the one place ambient music can legitimately auto-start when it
// defaults to on: the very first click is a genuine user gesture, so kicking
// off startAmbient() here (once) respects autoplay policy instead of trying
// — and failing — to start it on mount with no gesture at all.
let ambientAutoStarted = false;
export const unlockAudio = () => {
    ensureContext();
    if (!ambientAutoStarted && settings.musicEnabled) {
        ambientAutoStarted = true;
        startAmbient();
    }
};
const tone = (freq, duration, opts = {}) => {
    const audio = ensureContext();
    if (!audio || !settings.sfxEnabled)
        return;
    const { type = 'sine', delay = 0, volume = 1 } = opts;
    const t0 = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume * settings.sfxVolume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
};
// Synthesized fallbacks — used only when the matching real file (below)
// isn't present. This is the entire sound engine as it originally shipped.
const synthSfx = {
    click: () => tone(880, 0.05, { type: 'square', volume: 0.12 }),
    open: () => tone(660, 0.07, { volume: 0.15 }),
    correct: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.18, { delay: i * 0.07, volume: 0.35 })),
    closeMatch: () => tone(440, 0.15, { type: 'triangle', volume: 0.25 }),
    wrong: () => tone(160, 0.22, { type: 'sawtooth', volume: 0.18 }),
    levelUp: () => [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.22, { delay: i * 0.09, volume: 0.4 })),
    post: () => [659.25, 987.77].forEach((f, i) => tone(f, 0.2, { delay: i * 0.1, volume: 0.3 })),
    error: () => tone(180, 0.28, { type: 'square', volume: 0.18 }),
};
// Expected real-file names — see public/audio/README.md. Extensions match
// each file's actual encoded format (checked via magic bytes), not just
// assumed from the README's suggested .mp3 naming.
const SFX_FILES = {
    click: '/audio/sfx-click.wav',
    open: '/audio/sfx-open.wav',
    correct: '/audio/sfx-correct.mp3',
    closeMatch: '/audio/sfx-close.wav',
    wrong: '/audio/sfx-wrong.mp3',
    levelUp: '/audio/sfx-levelup.mp3',
    post: '/audio/sfx-post.mp3',
    error: '/audio/sfx-error.mp3',
};
// Once a file 404s/errors we stop retrying it for the rest of the session —
// avoids a repeated failed network request on every single click.
const missingFiles = new Set();
const sfxElements = new Map();
const playSfxFile = (key) => {
    let el = sfxElements.get(key);
    if (!el) {
        el = new Audio(SFX_FILES[key]);
        // Only a genuine 'error' event (can't load/decode) means the file is
        // really missing. A rejected play() below can just as easily be a
        // benign interrupted-request error from rapid repeat clicks restarting
        // the same element — that's not a reason to blacklist the file forever.
        el.addEventListener('error', () => missingFiles.add(key));
        sfxElements.set(key, el);
    }
    el.volume = settings.sfxVolume;
    el.currentTime = 0;
    el.play().catch(() => {
        // Ignore — most likely just this one attempt getting interrupted by
        // the next rapid click restarting the same element. Nothing to fall
        // back to for a single missed tick, and no reason to disable the file.
    });
};
export const sfx = Object.fromEntries(Object.keys(synthSfx).map((key) => [
    key,
    () => {
        if (!settings.sfxEnabled)
            return;
        if (missingFiles.has(key)) {
            synthSfx[key]();
            return;
        }
        playSfxFile(key);
    },
]));
// Background music — prefers /audio/bgm-ambient.mp3 (looped), falls back to
// the synthesized two-oscillator drone below if no file is present.
const BGM_FILE = '/audio/bgm-ambient.mp3';
let bgmElement = null;
let bgmFileMissing = false;
let synthAmbient = null;
const startSynthAmbient = () => {
    const audio = ensureContext();
    if (!audio || synthAmbient)
        return;
    const master = audio.createGain();
    master.gain.value = settings.musicVolume * 0.2;
    master.connect(audio.destination);
    const osc1 = audio.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 130.81; // C3
    const osc2 = audio.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 196.0; // G3
    osc2.detune.value = 4;
    const lfo = audio.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audio.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    osc1.connect(master);
    osc2.connect(master);
    osc1.start();
    osc2.start();
    lfo.start();
    synthAmbient = {
        master,
        stop: () => {
            [osc1, osc2, lfo].forEach((n) => {
                try {
                    n.stop();
                }
                catch {
                    // already stopped
                }
            });
            master.disconnect();
        },
    };
};
export const startAmbient = () => {
    if (!settings.musicEnabled)
        return;
    ensureContext();
    if (bgmFileMissing) {
        startSynthAmbient();
        return;
    }
    // Recreate the element if a previous attempt left it in a broken state —
    // reusing an errored element won't retry loading, just reject again.
    if (!bgmElement || bgmElement.error) {
        bgmElement = new Audio(BGM_FILE);
        bgmElement.loop = true;
        // The element's own 'error' event means the file genuinely can't be
        // loaded/decoded — that's the only case worth giving up on permanently.
        bgmElement.addEventListener('error', () => {
            bgmFileMissing = true;
            startSynthAmbient();
        });
        // Once the real file is actually audible, drop any synth fallback that
        // may have started from an earlier transient failure — avoid layering both.
        bgmElement.addEventListener('playing', () => {
            synthAmbient?.stop();
            synthAmbient = null;
        });
    }
    bgmElement.volume = settings.musicVolume;
    bgmElement.play().catch((err) => {
        // A rejected play() isn't necessarily a missing file — it can just as
        // easily be an interrupted/aborted request (e.g. a fast toggle or a
        // React re-render racing this call). Fall back to synth for *this*
        // attempt only; don't set bgmFileMissing, so the next startAmbient()
        // call retries the real file instead of giving up on it forever.
        console.error('Ambient file playback failed, using synth fallback for now', err);
        startSynthAmbient();
    });
};
export const stopAmbient = () => {
    bgmElement?.pause();
    synthAmbient?.stop();
    synthAmbient = null;
};
const setAmbientVolume = (volume) => {
    if (bgmElement)
        bgmElement.volume = volume;
    if (synthAmbient)
        synthAmbient.master.gain.value = volume * 0.2;
};
//# sourceMappingURL=sound.js.map