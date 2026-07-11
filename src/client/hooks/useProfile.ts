import { useCallback, useEffect, useState } from 'react';
import type { ProfileResponse } from '../../shared/api';

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ProfileResponse = await res.json();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProfileResponse = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  return { profile, loading, refresh };
};
