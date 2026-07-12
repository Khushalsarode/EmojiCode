import { type SoundSettings } from '../sound';
export declare const useSoundSettings: () => {
    settings: SoundSettings;
    updateSoundSettings: (patch: Partial<SoundSettings>) => void;
};
