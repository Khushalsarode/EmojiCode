import { useCallback, useEffect, useState } from 'react';
export const useProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/profile');
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setProfile(data);
        }
        catch (err) {
            console.error('Failed to load profile', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetch('/api/profile');
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setProfile(data);
            }
            catch (err) {
                console.error('Failed to load profile', err);
            }
            finally {
                setLoading(false);
            }
        };
        void init();
    }, []);
    return { profile, loading, refresh };
};
//# sourceMappingURL=useProfile.js.map