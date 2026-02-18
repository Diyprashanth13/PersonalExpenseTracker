import React from 'react';
import { UserSettings } from '../types';
import { ChevronRight, Download, Trash2, ShieldCheck, Github, Sun, Moon, Tags, LayoutDashboard } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Link } from 'react-router-dom';

interface SettingsProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  onClearData: () => void;
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

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onClearData }) => {

  const handleExport = () => {
    const data = StorageService.getTransactions();
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
      <header>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Settings</h1>
      </header>

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
            onClick={() => {
              if (window.confirm('Erase everything? This cannot be undone.')) {
                onClearData();
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Reset Application</p>
                <p className="text-xs text-rose-400 dark:text-rose-600">Clear all local storage and history</p>
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