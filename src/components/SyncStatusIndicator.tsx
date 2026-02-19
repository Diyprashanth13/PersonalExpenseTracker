import React from 'react';
import { useSync } from '../hooks/useSync';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const SyncStatusIndicator: React.FC = () => {
    const { status } = useSync();

    const config = {
        synced: { color: 'text-emerald-500', icon: Wifi, label: 'Synced', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        syncing: { color: 'text-amber-500', icon: RefreshCw, label: 'Syncing...', bg: 'bg-amber-50 dark:bg-amber-900/10' },
        offline: { color: 'text-slate-500', icon: WifiOff, label: 'Offline', bg: 'bg-slate-100 dark:bg-slate-800/10' },
    };

    const current = config[status];
    const Icon = current.icon;

    return (
        <div id="sync-indicator" className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${current.bg} ${current.color} transition-all duration-300`}>
            <Icon size={14} className={status === 'syncing' ? 'animate-spin' : ''} />
            <span>{current.label}</span>
        </div>
    );
};

export default SyncStatusIndicator;
