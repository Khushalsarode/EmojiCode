export type SoundSettings = {
    sfxEnabled: boolean;
    musicEnabled: boolean;
    sfxVolume: number;
    musicVolume: number;
};
export declare const getSoundSettings: () => SoundSettings;
export declare const subscribeSoundSettings: (fn: (s: SoundSettings) => void) => (() => void);
export declare const updateSoundSettings: (patch: Partial<SoundSettings>) => void;
export declare const unlockAudio: () => void;
declare const synthSfx: {
    click: () => void;
    open: () => void;
    correct: () => void;
    closeMatch: () => void;
    wrong: () => void;
    levelUp: () => void;
    post: () => void;
    error: () => void;
};
type SfxKey = keyof typeof synthSfx;
export declare const sfx: Record<SfxKey, () => void>;
export declare const startAmbient: () => void;
export declare const stopAmbient: () => void;
export {};
