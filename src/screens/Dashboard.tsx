import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, Category, UserSettings } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, ChevronRight, CreditCard, Activity, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, isSameMonth } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardProps {
    transactions: Transaction[];
    categories: Category[];
    settings: UserSettings;
}

const StatCard = ({ label, amount, icon: Icon, color, bg }: { label: string, amount: string, icon: any, color: string, bg: string }) => (
    <div className={`p-5 rounded-[2rem] ${bg} dark:bg-slate-900 border border-white/20 dark:border-slate-800 glass-panel shadow-sm flex flex-col justify-between h-36 transition-all hover:shadow-md hover:-translate-y-1`}>
        <div className={`w-10 h-10 rounded-xl ${color} bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{amount}</p>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, settings }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);

    const monthTransactions = useMemo(() =>
        transactions.filter(t => isWithinInterval(new Date(t.date), { start, end })),
        [transactions, start, end]);

    const stats = useMemo(() => {
        let income = 0;
        let expenses = 0;
        monthTransactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expenses += t.amount;
        });
        const balance = income - expenses;
        const totalBalance = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
        const savingsRate = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;
        return { income, expenses, balance, totalBalance, savingsRate };
    }, [monthTransactions, transactions]);

    const chartData = [
        { name: 'Income', amount: stats.income, fill: '#10b981' },
        { name: 'Expenses', amount: stats.expenses, fill: '#ef4444' },
    ];

    const recentTransactions = useMemo(() =>
        [...transactions].sort((a, b) => {
            if (b.date !== a.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
            return (b.time || 0) - (a.time || 0);
        }).slice(0, 4),
        [transactions]);

    const formatCurrency = (val: number) => {
        const locale = settings.currency === 'INR' ? 'en-IN' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: settings.currency }).format(val);
    };

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));
    const handleResetMonth = () => setViewDate(new Date());

    const renderStats = () => (
        <section key="stats" className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <StatCard label="Earnings" amount={formatCurrency(stats.income)} icon={ArrowUpCircle} color="text-emerald-600 dark:text-emerald-400" bg="bg-white" />
            <StatCard label="Expenses" amount={formatCurrency(stats.expenses)} icon={ArrowDownCircle} color="text-rose-600 dark:text-rose-400" bg="bg-white" />
            <div className="hidden md:block">
                <StatCard label="Efficiency" amount={`${Math.round(stats.savingsRate)}%`} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" bg="bg-white" />
            </div>
        </section>
    );

    const renderChart = () => (
        <section key="chart" className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 mb-8 uppercase tracking-widest flex items-center">
                <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3"></div>
                Month Distribution
            </h2>
            <div className="h-64">
                {stats.income === 0 && stats.expenses === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-2">
                        <Activity size={32} className="opacity-20" />
                        <p className="text-sm font-medium">No activity for this period</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: settings.theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: settings.theme === 'dark' ? '#1e293b' : '#f8fafc' }} contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a' }} />
                            <Bar dataKey="amount" radius={[12, 12, 12, 12]} barSize={50}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );

    const renderLedger = () => (
        <section key="ledger" className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3"></div>
                    Recent Ledger
                </h2>
                <Link to="/transactions" className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors">
                    <ChevronRight size={20} />
                </Link>
            </div>

            <div className="space-y-5">
                {recentTransactions.length > 0 ? recentTransactions.map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    return (
                        <div key={t.id} className="flex items-center justify-between group cursor-default">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                    {cat?.icon || '❓'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat?.name || 'Uncategorized'}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{format(new Date(t.date), 'MMM dd')}</p>
                                </div>
                            </div>
                            <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </p>
                        </div>
                    );
                }) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Your financial story starts here.</p>
                    </div>
                )}
            </div>
        </section>
    );

    const sections = {
        stats: renderStats,
        chart: renderChart,
        ledger: renderLedger,
    };

    const isViewingCurrentMonth = isSameMonth(viewDate, new Date());

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">FinTrack Pro</h1>
                        <p className="text-slate-400 dark:text-slate-500 font-medium text-sm flex items-center mt-1">
                            <Activity size={14} className="mr-2 text-emerald-500" />
                            {isViewingCurrentMonth ? 'Active monitoring' : 'Historical analysis'} for {format(viewDate, 'MMMM yyyy')}
                        </p>
                    </div>

                    {/* Month Controller */}
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit transition-colors">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all active:scale-90"
                            title="Previous Month"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50 cursor-default">
                            <CalendarIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-black text-emerald-900 dark:text-emerald-100 min-w-[120px] text-center">
                                {format(viewDate, 'MMM yyyy')}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all active:scale-90"
                            title="Next Month"
                        >
                            <ChevronRight size={20} />
                        </button>
                        {!isViewingCurrentMonth && (
                            <button
                                onClick={handleResetMonth}
                                className="ml-2 px-3 py-2 text-[10px] font-black text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                TODAY
                            </button>
                        )}
                    </div>
                </div>

                <div className="mesh-gradient-emerald p-6 rounded-[2.5rem] w-full md:w-80 shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <CreditCard size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-emerald-100/80 text-[10px] font-black uppercase tracking-widest mb-1">
                            {isViewingCurrentMonth ? 'Portfolio Balance' : `Balance (${format(viewDate, 'MMM')})`}
                        </p>
                        <p className="text-3xl font-black text-white tracking-tight">
                            {formatCurrency(isViewingCurrentMonth ? stats.totalBalance : stats.balance)}
                        </p>
                    </div>
                </div>
            </header>

            {settings.dashboardSections.map(config => {
                if (!config.isEnabled) return null;
                const Component = (sections as any)[config.id];
                return Component ? Component() : null;
            })}
        </div>
    );
};
