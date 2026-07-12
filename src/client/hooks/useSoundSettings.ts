import { useEffect, useState } from 'react';
import { getSoundSettings, subscribeSoundSettings, updateSoundSettings, type SoundSettings } from '../sound';

export const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>(getSoundSettings());
  useEffect(() => subscribeSoundSettings(setSettings), []);
  return { settings, updateSoundSettings };
};
