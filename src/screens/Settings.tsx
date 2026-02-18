import React from 'react';
import { UserSettings } from '../types';
import { ChevronRight, Download, Trash2, ShieldCheck, Github, Sun, Moon, Tags, LayoutDashboard } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { logout } from '../firebase/auth';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  resetApplication: () => Promise<void>;
  user: User;
}

const SettingItem = ({ icon: Icon, label, value, onClick, color = "text-slate-500", to }: { icon: any, label: string, value?: string, onClick?: () => void, color?: string, to?: string }) => {
  const content = (
    <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p>
          {value && <p className="text-xs text-slate-400 dark:text-slate-500">{value}</p>}
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
    </div>
  );

  if (to) {
    return <Link to={to} className="block">{content}</Link>;
  }

  return (
    <button onClick={onClick} className="w-full block">
      {content}
    </button>
  );
};

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, resetApplication, user }) => {
  const { showToast } = useToast();

  const handleExport = async () => {
    const data = await StorageService.getTransactions(user.uid);
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Type,Amount,Category,Notes\n"
      + data.map(e => `${e.date},${e.type},${e.amount},${e.categoryId},"${e.notes || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fintrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Settings</h1>
      </header>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Account</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 transition-colors">
          <div className="flex items-center space-x-4 mb-6">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-16 h-16 rounded-3xl border-4 border-slate-50 shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-white shadow-sm">
                <UserIcon size={32} />
              </div>
            )}
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{user.displayName || 'User'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
              <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Cloud Synced
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Preferences</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden transition-colors">
          <SettingItem
            icon={LayoutDashboard}
            label="Customize Dashboard"
            value="Reorder or hide home sections"
            to="/customize-dashboard"
            color="text-emerald-600 dark:text-emerald-400"
          />
          <SettingItem
            icon={Tags}
            label="Manage Categories"
            value="Customize icons, names and colors"
            to="/categories"
            color="text-emerald-600 dark:text-emerald-400"
          />
          <SettingItem
            icon={settings.theme === 'light' ? Sun : Moon}
            label="Theme"
            value={settings.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
          />
          <SettingItem
            icon={Download}
            label="Export Data"
            value="Download your ledger as CSV"
            onClick={handleExport}
            color="text-blue-600 dark:text-blue-400"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Danger Zone</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-rose-100 dark:border-rose-900/20 shadow-xl shadow-rose-200/20 dark:shadow-none overflow-hidden transition-colors">
          <button
            onClick={async () => {
              if (window.confirm('⚠️ HEAVY ACTION REQUIRED: This will PERMANENTLY erase all your data from both this device AND the cloud (Firestore). Your categories will be reset to defaults. This cannot be undone.')) {
                try {
                  await resetApplication();
                  showToast('success', 'Application reset to factory state');
                } catch (err) {
                  showToast('error', 'Failed to reset application');
                }
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Deep Reset Application</p>
                <p className="text-xs text-rose-400 dark:text-rose-600">Erase all cloud & local history (irreversible)</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Engineering</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden transition-colors">
          <SettingItem icon={ShieldCheck} label="Privacy Shield" value="End-to-end local storage active" />
          <SettingItem icon={Github} label="Source Code" value="v1.0.2 stable" />
        </div>
      </section>
    </div>
  );
};