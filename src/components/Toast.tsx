import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    message: string;
    onClose: () => void;
}

const config = {
    success: {
        icon: CheckCircle,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        darkBg: 'dark:bg-emerald-900/20',
        darkBorder: 'dark:border-emerald-800',
    },
    error: {
        icon: XCircle,
        color: 'text-rose-500',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        darkBg: 'dark:bg-rose-900/20',
        darkBorder: 'dark:border-rose-800',
    },
    warning: {
        icon: AlertCircle,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        darkBg: 'dark:bg-amber-900/20',
        darkBorder: 'dark:border-amber-800',
    },
    info: {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        darkBg: 'dark:bg-blue-900/20',
        darkBorder: 'dark:border-blue-800',
    },
};

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
    const { icon: Icon, color, bg, border, darkBg, darkBorder } = config[type];

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`
      pointer-events-auto
      flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md
      ${bg} ${darkBg} ${border} ${darkBorder} border
      rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none
      animate-in slide-in-from-right-8 fade-in duration-300
    `}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} dark:bg-white/10 ${color}`}>
                <Icon size={18} />
            </div>
            <p className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {message}
            </p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400"
            >
                <X size={16} />
            </button>
        </div>
    );
};
