import React from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { StudyThemeKey } from '../types/study';
import { STUDY_THEMES } from '../utils/theme';

interface StudyThemeSelectorProps {
  currentTheme: StudyThemeKey;
  onSelectTheme: (theme: StudyThemeKey) => void;
}

export const StudyThemeSelector: React.FC<StudyThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const themeKeys: StudyThemeKey[] = ['classic', 'warm_sepia', 'midnight', 'forest', 'saffron'];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
      <span className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-500 pl-2 pr-1">
        <Palette className="w-3.5 h-3.5 text-slate-600" />
        <span>Theme:</span>
      </span>

      <div className="flex items-center gap-1">
        {themeKeys.map((key) => {
          const cfg = STUDY_THEMES[key];
          const isSelected = currentTheme === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTheme(key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              title={`${cfg.label} — ${cfg.tagline}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cfg.dotColor }}
              />
              <span className="hidden sm:inline text-[11px]">{cfg.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
