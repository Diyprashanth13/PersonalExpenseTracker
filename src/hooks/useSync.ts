import { useEffect, useState } from 'react';

export type SyncStatus = 'synced' | 'offline';

export const useSync = () => {
    const [status, setStatus] = useState<SyncStatus>(navigator.onLine ? 'synced' : 'offline');

    useEffect(() => {
        const handleOnline = () => setStatus('synced');
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { status };
};
