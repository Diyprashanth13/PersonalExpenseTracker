import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSettings, DashboardSectionConfig } from '../types';
import { ChevronLeft, GripVertical, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

interface DashboardCustomizerProps {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ settings, updateSettings }) => {
  const navigate = useNavigate();

  const toggleSection = (id: string) => {
    const next = settings.dashboardSections.map(s => 
      s.id === id ? { ...s, isEnabled: !s.isEnabled } : s
    );
    updateSettings({ dashboardSections: next });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...settings.dashboardSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    const [movedItem] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, movedItem);
    
    updateSettings({ dashboardSections: newSections });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Customize Home</h1>
        <div className="w-10" />
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden divide-y divide-slate-50">
        <div className="p-6 bg-slate-50/50">
           <p className="text-sm text-slate-500 font-medium">Control the visibility and order of components on your Dashboard screen.</p>
        </div>
        
        {settings.dashboardSections.map((section, index) => (
          <div 
            key={section.id} 
            className={`flex items-center justify-between p-6 transition-all ${!section.isEnabled ? 'bg-slate-50 opacity-60' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className={`p-1 rounded-md transition-colors ${index === 0 ? 'text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                >
                  <ChevronUp size={16} />
                </button>
                <button 
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === settings.dashboardSections.length - 1}
                  className={`p-1 rounded-md transition-colors ${index === settings.dashboardSections.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'}`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{section.label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.isEnabled ? 'Visible' : 'Hidden'}</p>
              </div>
            </div>

            <button 
              onClick={() => toggleSection(section.id)}
              className={`p-3 rounded-2xl transition-all ${
                section.isEnabled 
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {section.isEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 font-medium italic">Changes are saved automatically and applied to your home screen.</p>
      </div>
    </div>
  );
};