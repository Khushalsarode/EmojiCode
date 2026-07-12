import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Sound Settings — controls for SFX + background music (client/sound.ts).
// Uses real audio files from public/audio/ when present, falling back to a
// synthesized tone/pad for anything missing.
import { useSoundSettings } from '../hooks/useSoundSettings';
import { Modal } from './Modal';
// A 44x24 visual track would fail the 44x44 minimum touch target used
// everywhere else in this app — the button itself is sized properly, with
// the classic pill track centered inside it. `label` gives the switch its
// own accessible name; the adjacent visible text next to each call site is
// for sighted users only and isn't otherwise wired to the control.
const Toggle = ({ on, onToggle, label }) => (_jsx("button", { type: "button", role: "switch", "aria-checked": on, "aria-label": label, onClick: onToggle, className: "shrink-0 w-12 h-11 flex items-center justify-center rounded-full", children: _jsx("span", { className: [
            'btn-glass block w-11 h-6 rounded-full transition-colors hover:brightness-110',
            on ? '' : 'bg-gray-300 dark:bg-gray-600',
        ]
            .filter(Boolean)
            .join(' '), style: on ? { backgroundColor: 'var(--color-primary)' } : undefined, children: _jsx("span", { className: "block mt-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm", style: { transform: on ? 'translateX(22px)' : 'translateX(2px)' } }) }) }));
export const SoundSettings = ({ onClose }) => {
    const { settings, updateSoundSettings } = useSoundSettings();
    return (_jsxs(Modal, { title: "\uD83D\uDD0A Sound", onClose: onClose, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Sound effects" }), _jsx(Toggle, { label: "Sound effects", on: settings.sfxEnabled, onToggle: () => updateSoundSettings({ sfxEnabled: !settings.sfxEnabled }) })] }), settings.sfxEnabled && (_jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: settings.sfxVolume, onChange: (e) => updateSoundSettings({ sfxVolume: Number(e.target.value) }), className: "w-full accent-[color:var(--color-primary)]" })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: "Background music" }), _jsx(Toggle, { label: "Background music", on: settings.musicEnabled, onToggle: () => updateSoundSettings({ musicEnabled: !settings.musicEnabled }) })] }), settings.musicEnabled && (_jsx("input", { type: "range", min: 0, max: 1, step: 0.05, value: settings.musicVolume, onChange: (e) => updateSoundSettings({ musicVolume: Number(e.target.value) }), className: "w-full accent-[color:var(--color-primary)]" })), _jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500", children: "Uses real audio when available, with a generated fallback for anything missing." })] }));
};
//# sourceMappingURL=SoundSettings.js.map