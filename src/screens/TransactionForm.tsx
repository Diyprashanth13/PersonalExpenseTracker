import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Transaction, Category, TransactionType } from '../types';
import { ChevronLeft, Save, Trash2, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useFinanceStore } from '../store/useFinanceStore';
import { CURRENCIES } from '../constants';

interface TransactionFormProps {
    categories: Category[];
    transactions: Transaction[];
    onSave: (t: Transaction) => void;
    onDelete: (id: string) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ categories, transactions, onSave, onDelete }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [notes, setNotes] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const settings = useFinanceStore(state => state.settings);
    const currencySymbol = CURRENCIES.find(c => c.code === settings.currency)?.symbol || '$';

    useEffect(() => {
        if (isEditing) {
            const t = transactions.find(tx => tx.id === id);
            if (t) {
                setAmount(t.amount.toString());
                setType(t.type);
                setCategoryId(t.categoryId);
                setDate(format(new Date(t.date), 'yyyy-MM-dd'));
                setNotes(t.notes || '');
            }
        }
    }, [id, transactions, isEditing]);

    const filteredCategories = categories.filter(c => c.type === type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !categoryId) return;

        onSave({
            id: isEditing ? id! : Math.random().toString(36).substr(2, 9),
            amount: parseFloat(amount),
            type,
            categoryId,
            date: new Date(date).toISOString(),
            notes,
        });
        navigate(-1);
    };

    const handleDelete = () => {
        if (id) {
            onDelete(id);
            navigate(-1);
        }
    };

    const selectedCategory = categories.find(c => c.id === categoryId);

    return (
        <div className="max-w-md mx-auto">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
                    <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{isEditing ? 'Edit Entry' : 'New Entry'}</h1>
                <div className="w-10" />
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 transition-colors">
                    {/* Amount Input */}
                    <div className="text-center space-y-2 pt-4">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Transaction Amount</label>
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-3xl font-light text-slate-400 dark:text-slate-600">{currencySymbol}</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="text-4xl font-black text-slate-900 dark:text-white w-full bg-transparent focus:outline-none text-center tracking-tight"
                            />
                        </div>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] transition-colors">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            EXPENSE
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            INCOME
                        </button>
                    </div>

                    {/* Category Grid */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category Label</label>
                        <div className="grid grid-cols-4 gap-3">
                            {filteredCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`flex flex-col items-center p-2 rounded-2xl transition-all border-2 ${categoryId === cat.id ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-inner' : 'border-transparent bg-slate-50 dark:bg-slate-800'
                                        }`}
                                >
                                    <span className="text-2xl mb-1">{cat.icon}</span>
                                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 truncate w-full text-center uppercase tracking-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        {/* Date */}
                        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-transparent focus-within:border-emerald-100 dark:focus-within:border-emerald-900/50 transition-colors">
                            <Calendar size={18} className="text-slate-400 dark:text-slate-600" />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent text-sm text-slate-800 dark:text-slate-100 font-bold focus:outline-none w-full"
                            />
                        </div>

                        {/* Notes */}
                        <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-transparent focus-within:border-emerald-100 dark:focus-within:border-emerald-900/50 transition-colors">
                            <FileText size={18} className="text-slate-400 dark:text-slate-600 mt-0.5" />
                            <textarea
                                placeholder="Strategic notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                                className="bg-transparent text-sm text-slate-800 dark:text-slate-100 font-medium focus:outline-none w-full resize-none placeholder-slate-400 dark:placeholder-slate-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="p-4 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/20 text-rose-500 rounded-[1.5rem] shadow-xl shadow-rose-200/20 dark:shadow-none hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-95"
                        >
                            <Trash2 size={24} />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white font-black py-4 rounded-[1.5rem] shadow-2xl shadow-slate-300 dark:shadow-emerald-900/40 flex items-center justify-center space-x-2 hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all active:scale-95"
                    >
                        <Save size={20} />
                        <span>{isEditing ? 'Update Entry' : 'Commit Entry'}</span>
                    </button>
                </div>
            </form>

            {/* High-Fidelity Deletion Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500 dark:text-rose-400">
                                <AlertTriangle size={40} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Delete Record?</h2>
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                    Impact: {type === 'income' ? '-' : '+'}{currencySymbol}{amount} on current balance
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                                    This transaction involving <span className="font-bold text-slate-800 dark:text-slate-100">{selectedCategory?.name || 'Uncategorized'}</span> will be permanently removed. This action is irreversible.
                                </p>
                            </div>

                            <div className="flex flex-col space-y-3 pt-2">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 active:scale-95 transition-all"
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                >
                                    Keep Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};