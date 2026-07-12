import { useEffect, useState } from 'react';
import { getSoundSettings, subscribeSoundSettings, updateSoundSettings } from '../sound';
export const useSoundSettings = () => {
    const [settings, setSettings] = useState(getSoundSettings());
    useEffect(() => subscribeSoundSettings(setSettings), []);
    return { settings, updateSoundSettings };
};
//# sourceMappingURL=useSoundSettings.js.map