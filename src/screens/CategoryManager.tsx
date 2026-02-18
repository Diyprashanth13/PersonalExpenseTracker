import React, { useState } from 'react';
import { Category } from '../types';
import { ChevronLeft, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface CategoryManagerProps {
  categories: Category[];
  onDelete: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onDelete }) => {
  const navigate = useNavigate();
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const confirmDelete = () => {
    if (deletingCategory) {
      onDelete(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const CategorySection = ({ title, items }: { title: string, items: Category[] }) => (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{title} Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(cat => (
          <div 
            key={cat.id} 
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                   <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{cat.color}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Link 
                to={`/categories/edit/${cat.id}`}
                className="p-2 text-slate-400 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
              >
                <Edit2 size={18} />
              </Link>
              <button 
                onClick={() => setDeletingCategory(cat)}
                className="p-2 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
          <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">Manage Labels</h1>
        <Link to="/categories/add" className="p-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-95 transition-all">
          <Plus size={20} />
        </Link>
      </header>

      <CategorySection title="Expense" items={expenseCategories} />
      <CategorySection title="Income" items={incomeCategories} />
      
      {categories.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-slate-400 dark:text-slate-600 font-medium">No custom labels defined yet.</p>
        </div>
      )}

      {/* Custom Deletion Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" 
            onClick={() => setDeletingCategory(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500 dark:text-rose-400">
                <AlertTriangle size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Confirm Deletion</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  Deleting <span className="font-bold text-slate-800 dark:text-slate-100">"{deletingCategory.name}"</span> will leave any associated transactions 
                  <span className="text-rose-600 dark:text-rose-400 font-bold"> uncategorized</span>.
                </p>
              </div>

              <div className="flex flex-col space-y-3 pt-2">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeletingCategory(null)}
                  className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};