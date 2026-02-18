import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Category, TransactionType } from '../types';
import { ChevronLeft, Save, Sparkles } from 'lucide-react';
import { CATEGORY_PRESET_COLORS, CATEGORY_PRESET_ICONS } from '../constants';

interface CategoryFormProps {
  categories?: Category[];
  onSave: (cat: Category) => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ categories, onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('🍔');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    if (isEditing && categories) {
      const cat = categories.find(c => c.id === id);
      if (cat) {
        setName(cat.name);
        setType(cat.type);
        setIcon(cat.icon);
        setColor(cat.color);
      }
    }
  }, [id, categories, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const existingCat = isEditing && categories ? categories.find(c => c.id === id) : null;

    onSave({
      id: isEditing ? id! : `cat_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: existingCat?.isDefault ?? false,
      createdAt: existingCat?.createdAt ?? Date.now(),
      updatedAt: Date.now()
    });
    navigate(-1);
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">{isEditing ? 'Edit Label' : 'New Label'}</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">

          <div className="flex justify-center">
            <div
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl transition-all duration-500 scale-110"
              style={{ backgroundColor: `${color}15`, color: color, border: `4px solid ${color}10` }}
            >
              {icon}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Label Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscription, Rent..."
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Behavior</label>
            <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem]">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'
                  }`}
              >
                EXPENSE
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                  }`}
              >
                INCOME
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Symbol</label>
            <div className="grid grid-cols-6 gap-2">
              {CATEGORY_PRESET_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-10 w-10 flex items-center justify-center rounded-xl text-xl transition-all hover:bg-slate-50 ${icon === i ? 'bg-emerald-50 ring-2 ring-emerald-500 scale-110' : ''
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Color Signature</label>
            <div className="grid grid-cols-6 gap-3">
              {CATEGORY_PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${color === c ? 'ring-4 ring-slate-100 scale-125' : ''
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Save size={20} />
          <span className="tracking-tight">Commit Changes</span>
        </button>
      </form>
    </div>
  );
};