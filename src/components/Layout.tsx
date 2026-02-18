import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, PieChart, Settings, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { logout } from '../firebase/auth';
import SyncStatusIndicator from './SyncStatusIndicator';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center space-y-1 w-full py-2 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </Link>
);

const DesktopNavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    <span className="text-sm tracking-wide">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode, theme: 'light' | 'dark', user: User }> = ({ children, theme, user }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 space-y-8 h-screen sticky top-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">FinTrack</span>
            </div>
          </div>

          <div className="px-2">
            <SyncStatusIndicator />
          </div>

          <nav className="flex-1 space-y-1">
            <DesktopNavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
            <DesktopNavItem to="/transactions" icon={ReceiptText} label="History" active={isActive('/transactions')} />
            <DesktopNavItem to="/insights" icon={PieChart} label="Insights" active={isActive('/insights')} />
            <DesktopNavItem to="/settings" icon={Settings} label="Settings" active={isActive('/settings')} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-2 mb-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-white shadow-sm">
                  <UserIcon size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate dark:text-white">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-all text-sm font-semibold"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Top Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <Link to="/settings" className="relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-100" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-50">
                  <UserIcon size={16} />
                </div>
              )}
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">F</div>
              <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">FinTrack</span>
            </div>
          </div>
          <SyncStatusIndicator />
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24 md:pb-8 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-4 pb-safe-area z-30 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
          <NavItem to="/" icon={LayoutDashboard} label="Home" active={isActive('/')} />
          <NavItem to="/transactions" icon={ReceiptText} label="List" active={isActive('/transactions')} />
          <div className="relative -top-5">
            <Link to="/add" className="bg-emerald-600 text-white w-14 h-14 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-transform">
              <Plus size={32} />
            </Link>
          </div>
          <NavItem to="/insights" icon={PieChart} label="Insights" active={isActive('/insights')} />
          <NavItem to="/settings" icon={Settings} label="More" active={isActive('/settings')} />
        </nav>

        {/* Desktop Floating Add Button */}
        <Link to="/add" className="hidden md:flex fixed bottom-8 right-8 bg-emerald-600 text-white w-16 h-16 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 items-center justify-center hover:bg-emerald-700 transform hover:scale-110 active:scale-95 transition-all group z-10">
          <Plus size={32} />
          <span className="absolute right-20 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Add Transaction</span>
        </Link>
      </div>
    </div>
  );
};