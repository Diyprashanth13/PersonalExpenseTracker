import React, { useState, useMemo } from 'react';
import { Transaction, Category, UserSettings, FilterState } from '../types';
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Search, SlidersHorizontal, ChevronRight, Inbox, X, Check, RotateCcw, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
    settings: UserSettings;
}

const initialFilters: FilterState = {
    type: 'all',
    categories: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, settings }) => {
    const [search, setSearch] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.type !== 'all') count++;
        if (filters.categories.length > 0) count++;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        if (filters.minAmount) count++;
        if (filters.maxAmount) count++;
        return count;
    }, [filters]);

    const filtered = useMemo(() => {
        return transactions
            .filter(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const tDate = parseISO(t.date);

                const matchesSearch = (cat?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                    (t.notes || '').toLowerCase().includes(search.toLowerCase());

                const matchesType = filters.type === 'all' || t.type === filters.type;

                const matchesCategories = filters.categories.length === 0 || filters.categories.includes(t.categoryId);

                const matchesStartDate = !filters.startDate || !isBefore(tDate, startOfDay(parseISO(filters.startDate)));
                const matchesEndDate = !filters.endDate || !isAfter(tDate, endOfDay(parseISO(filters.endDate)));

                const matchesMinAmount = !filters.minAmount || t.amount >= parseFloat(filters.minAmount);
                const matchesMaxAmount = !filters.maxAmount || t.amount <= parseFloat(filters.maxAmount);

                return matchesSearch && matchesType && matchesCategories && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, categories, search, filters]);

    const grouped = useMemo(() => {
        const groups: { date: string, items: Transaction[] }[] = [];
        filtered.forEach(t => {
            const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
            const group = groups.find(g => g.date === dateStr);
            if (group) group.items.push(t);
            else groups.push({ date: dateStr, items: [t] });
        });
        return groups;
    }, [filtered]);

    const formatCurrency = (val: number) => {
        const locale = settings.currency === 'INR' ? 'en-IN' : 'en-US';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: settings.currency }).format(val);
    };

    const toggleCategory = (id: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(id)
                ? prev.categories.filter(c => c !== id)
                : [...prev.categories, id]
        }));
    };

    return (
        <div className="space-y-6">
            <header className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">History</h1>

                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search category or note..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20 shadow-sm dark:text-white dark:placeholder-slate-600 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`p-3 rounded-2xl border transition-all shadow-sm flex items-center space-x-2 ${activeFilterCount > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        <SlidersHorizontal size={20} />
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] w-5 h-5 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'income', 'expense'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilters(prev => ({ ...prev, type: type as any }))}
                            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${filters.type === type
                                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </header>

            {/* Filter Drawer / Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 transition-colors">
                        <div className="p-6 space-y-8 max-h-[85vh] overflow-y-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filter Options</h2>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-slate-400 dark:text-slate-600" />
                                </button>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                                    <Calendar size={12} />
                                    <span>Date Range</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                                    />
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Amount Range */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                                    <DollarSign size={12} />
                                    <span>Amount Range</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minAmount}
                                        onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white dark:placeholder-slate-600"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxAmount}
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white dark:placeholder-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categories</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${filters.categories.includes(cat.id)
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <div className="flex-shrink-0 text-lg">{cat.icon}</div>
                                            <span className="text-xs font-semibold truncate">{cat.name}</span>
                                            {filters.categories.includes(cat.id) && <Check size={14} className="ml-auto flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex space-x-3">
                            <button
                                onClick={() => setFilters(initialFilters)}
                                className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <RotateCcw size={18} />
                                <span>Reset</span>
                            </button>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="flex-[2] py-4 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-100 dark:shadow-emerald-900/40 hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-[0.98] transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {grouped.length > 0 ? grouped.map(group => (
                    <div key={group.date} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {format(new Date(group.date), 'EEEE, MMM dd')}
                            </h3>
                            <span className="text-[10px] font-medium text-slate-300 dark:text-slate-700">
                                {group.items.length} {group.items.length === 1 ? 'transaction' : 'transactions'}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                            {group.items.map(t => {
                                const cat = categories.find(c => c.id === t.categoryId);
                                return (
                                    <Link
                                        key={t.id}
                                        to={`/edit/${t.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-3xl last:rounded-b-3xl group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                {cat?.icon || '❓'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{cat?.name || 'Uncategorized'}</p>
                                                {t.notes && <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{t.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </p>
                                            <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-700 transition-colors">
                            <Inbox size={40} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">No transactions found</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <button
                                onClick={() => {
                                    setFilters(initialFilters);
                                    setSearch('');
                                }}
                                className="mt-4 text-emerald-600 dark:text-emerald-400 text-sm font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
