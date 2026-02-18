
import React, { useMemo } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, isSameDay, eachMonthOfInterval } from 'date-fns';
import { TrendingUp, TrendingDown, Target, PieChart as PieIcon, LineChart as LineIcon, Activity } from 'lucide-react';

interface InsightsProps {
    transactions: Transaction[];
    categories: Category[];
    settings: UserSettings;
}

export const Insights: React.FC<InsightsProps> = ({ transactions, categories, settings }) => {
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

    const currentMonthTxs = transactions.filter(t => isWithinInterval(new Date(t.date), { start: currentMonthStart, end: currentMonthEnd }));
    const lastMonthTxs = transactions.filter(t => isWithinInterval(new Date(t.date), { start: lastMonthStart, end: lastMonthEnd }));

    const curExpenses = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const lastExpenses = lastMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const diff = lastExpenses > 0 ? ((curExpenses - lastExpenses) / lastExpenses) * 100 : 0;

    const monthlyTrends = useMemo(() => {
        const months = eachMonthOfInterval({
            start: startOfMonth(subMonths(new Date(), 5)),
            end: endOfMonth(new Date())
        });

        return months.map(month => {
            const start = startOfMonth(month);
            const end = endOfMonth(month);
            const monthTxs = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }));

            const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            return {
                name: format(month, 'MMM'),
                income,
                expenses,
                net: income - expenses
            };
        });
    }, [transactions]);

    const dailyData = useMemo(() => {
        const days = eachDayOfInterval({
            start: currentMonthStart,
            end: currentMonthEnd
        });

        return days.map(day => {
            const dayTxs = currentMonthTxs.filter(t => isSameDay(new Date(t.date), day));
            const amount = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return {
                date: format(day, 'dd'),
                amount
            };
        });
    }, [currentMonthTxs, currentMonthStart, currentMonthEnd]);

    const categoryBreakdown = useMemo(() => {
        const expenseMap: Record<string, number> = {};
        currentMonthTxs
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expenseMap[t.categoryId] = (expenseMap[t.categoryId] || 0) + t.amount;
            });

        return Object.entries(expenseMap)
            .map(([catId, amount]) => {
                const cat = categories.find(c => c.id === catId);
                return {
                    name: cat?.name || 'Uncategorized',
                    value: amount,
                    color: cat?.color || '#cbd5e1',
                    icon: cat?.icon || '❓',
                    percentage: curExpenses > 0 ? (amount / curExpenses) * 100 : 0
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [currentMonthTxs, categories, curExpenses]);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    const formatCurrency = (val: number) => {
        const locale = settings.currency === 'INR' ? 'en-IN' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: settings.currency }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors">Strategic Insights</h1>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Deep analysis of your wealth velocity</p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-2xl ${diff <= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                            {diff <= 0 ? <TrendingDown size={22} /> : <TrendingUp size={22} />}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-100 transition-colors">Velocity Change</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{Math.abs(Math.round(diff))}% {diff <= 0 ? 'Optimized' : 'Inflation'}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Vs. Previous Term ({formatCurrency(lastExpenses)})</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4 transition-colors">
                    <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 transition-colors">
                            <Target size={22} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-100 transition-colors">Focus Sector</h3>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{topCategory ? topCategory.name : 'Neutral'}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 transition-colors">
                            {topCategory ? `Allocation: ${formatCurrency(topCategory.value)}` : 'Awaiting data injection'}
                        </p>
                    </div>
                </div>
            </section>

            {/* 6-Month Cash Flow Trend */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center transition-colors">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3"></div>
                        Cash Flow Trend
                    </h3>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <LineIcon size={18} />
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#fff',
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px',
                                    color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a'
                                }}
                            />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={3} />
                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Earnings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expenses</span>
                    </div>
                </div>
            </section>

            {/* Category Breakdown Section */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center transition-colors">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3"></div>
                        Category Allocation
                    </h3>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <PieIcon size={18} />
                    </div>
                </div>

                {categoryBreakdown.length > 0 ? (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                            <div className="w-full md:w-1/2 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1500}
                                            stroke="none"
                                        >
                                            {categoryBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#fff',
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                padding: '12px',
                                                color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 grid grid-cols-1 gap-4">
                                {categoryBreakdown.slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ backgroundColor: `${item.color}20` }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{formatCurrency(item.value)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{Math.round(item.percentage)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Horizontal Distribution Rail */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Full Percentage Breakdown</label>
                            <div className="w-full h-8 flex rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800">
                                {categoryBreakdown.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                        className="h-full border-r border-white/10 last:border-none transition-all hover:opacity-80 cursor-help"
                                        title={`${item.name}: ${Math.round(item.percentage)}%`}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {categoryBreakdown.map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{item.name} {Math.round(item.percentage)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 space-y-2">
                        <PieIcon size={48} className="opacity-10" />
                        <p className="text-sm font-medium">No expenses logged for {format(new Date(), 'MMMM')}</p>
                    </div>
                )}
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center transition-colors">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full mr-3"></div>
                        Activity Pulse
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full ring-1 ring-emerald-100 dark:ring-emerald-900/40 transition-colors">
                        <Activity size={10} fill="currentColor" />
                        <span>METRIC ENGINE</span>
                    </div>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a' }} />
                            <Area type="stepAfter" dataKey="amount" stroke="#10b981" fillOpacity={0.1} fill="#10b981" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
};
