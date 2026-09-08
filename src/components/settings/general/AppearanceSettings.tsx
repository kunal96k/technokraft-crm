import React from 'react';
import { Palette, Sun, Moon, Laptop, LayoutGrid, List } from 'lucide-react';
import { AppearanceConfigData } from '../../../types/settings';
import { useTheme, ThemeMode } from '../../../context/ThemeContext';

interface AppearanceSettingsProps {
  data: AppearanceConfigData;
  onChange: (updated: AppearanceConfigData) => void;
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ data, onChange }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemeMode) => {
    onChange({ ...data, theme: newTheme });
    setTheme(newTheme);
  };

  const currentTheme = data.theme || theme;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Appearance & Display Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select interface contrast, dark mode scheduling, and data table padding density.
        </p>
      </div>

      {/* Theme selection */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Color Theme
        </label>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => handleThemeChange('Light')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all cursor-pointer ${
              currentTheme === 'Light'
                ? 'border-[#5B4DB7] bg-purple-50/70 text-[#5B4DB7] dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/20 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('Dark')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all cursor-pointer ${
              currentTheme === 'Dark'
                ? 'border-[#5B4DB7] bg-purple-50/70 text-[#5B4DB7] dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/20 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <Moon className="w-5 h-5 text-purple-400" />
            <span>Dark</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('System')}
            className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-2 transition-all cursor-pointer ${
              currentTheme === 'System'
                ? 'border-[#5B4DB7] bg-purple-50/70 text-[#5B4DB7] dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/20 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <Laptop className="w-5 h-5 text-blue-500" />
            <span>System</span>
          </button>
        </div>
      </div>


      {/* Density selection */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Data Grid & Layout Density
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onChange({ ...data, density: 'Comfortable' })}
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2.5 transition-all ${
              data.density === 'Comfortable'
                ? 'border-purple-600 bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Comfortable (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...data, density: 'Compact' })}
            className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2.5 transition-all ${
              data.density === 'Compact'
                ? 'border-purple-600 bg-purple-50/70 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Compact (High Density)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
