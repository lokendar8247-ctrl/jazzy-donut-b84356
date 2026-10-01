import React, { useState } from 'react';
import {
  Flame,
  BookOpen,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  Target,
  Quote,
  Check,
} from 'lucide-react';
import {
  INDIAN_STUDY_QUOTES,
  INDIAN_EXAM_PRESETS,
  ExamPreset,
} from '../utils/theme';

interface IndianStudentEngagementProps {
  todayMinutes: number;
  dailyGoalMinutes: number;
  targetExam?: string;
  onUpdateTargetExam?: (examName: string) => void;
  onApplyExamPreset?: (preset: ExamPreset) => void;
  onStartStudy?: () => void;
}

export const IndianStudentEngagement: React.FC<IndianStudentEngagementProps> = ({
  todayMinutes,
  dailyGoalMinutes,
  targetExam = 'Board / Competitive Exam 2026',
  onUpdateTargetExam,
  onApplyExamPreset,
  onStartStudy,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [examNameInput, setExamNameInput] = useState(targetExam);

  const currentQuote = INDIAN_STUDY_QUOTES[quoteIndex % INDIAN_STUDY_QUOTES.length];

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INDIAN_STUDY_QUOTES.length);
  };

  const handleSelectPreset = (preset: ExamPreset) => {
    if (onApplyExamPreset) {
      onApplyExamPreset(preset);
      setAppliedPresetId(preset.id);
      setTimeout(() => setAppliedPresetId(null), 2500);
    }
  };

  const handleSaveExamName = (e: React.FormEvent) => {
    e.preventDefault();
    if (examNameInput.trim() && onUpdateTargetExam) {
      onUpdateTargetExam(examNameInput.trim());
      setIsEditingExam(false);
    }
  };

  const pct = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner: Daily Goal & Inspiration Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Daily Study Commitment - 5 cols */}
        <section className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Daily Study Target
                  </h3>
                  <p className="text-[11px] text-amber-900/80 font-medium">
                    Focus & Academic Discipline
                  </p>
                </div>
              </div>

              {/* Target Exam Tag */}
              <div className="relative">
                {isEditingExam ? (
                  <form onSubmit={handleSaveExamName} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={examNameInput}
                      onChange={(e) => setExamNameInput(e.target.value)}
                      className="px-2 py-0.5 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-slate-900 max-w-[140px]"
                      placeholder="e.g. JEE / NEET 2026"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded-md cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setExamNameInput(targetExam);
                      setIsEditingExam(true);
                    }}
                    className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 hover:bg-amber-200/80 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                    title="Click to edit your target exam name"
                  >
                    🎯 {targetExam}
                  </button>
                )}
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-600 font-medium">Logged Today:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                  {todayMinutes} min{' '}
                  <span className="text-slate-500 text-xs font-normal">
                    / {dailyGoalMinutes} min ({pct}%)
                  </span>
                </span>
              </div>

              <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                {todayMinutes >= dailyGoalMinutes
                  ? 'Daily study goal completed! Outstanding discipline.'
                  : `${dailyGoalMinutes - todayMinutes} more minutes needed to reach today’s goal.`}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-amber-900 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              Focus on daily preparation, not outcome anxiety
            </span>
            {onStartStudy && (
              <button
                type="button"
                onClick={onStartStudy}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Study Now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </section>

        {/* Daily Student Inspiration Quote - 7 cols */}
        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Quote className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Daily Student Inspiration
                </h3>
              </div>

              <button
                type="button"
                onClick={handleNextQuote}
                className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Read next inspirational quote"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Quote</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-slate-800 leading-relaxed italic">
                “{currentQuote.quote}”
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-800">
                  — {currentQuote.author}
                </span>
                {currentQuote.source && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="italic">{currentQuote.source}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Every hour of focused study brings you closer to your goal.</span>
            <span>Quote {((quoteIndex % INDIAN_STUDY_QUOTES.length) + 1)} of {INDIAN_STUDY_QUOTES.length}</span>
          </div>
        </section>
      </div>

      {/* 1-Click Exam Syllabus & Subject Presets */}
      {onApplyExamPreset && (
        <section className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  1-Click Subject Presets for Aspirants
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly load standard subjects and starter tasks tailored for your exam preparation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {INDIAN_EXAM_PRESETS.map((preset) => {
              const isApplied = appliedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  className="rounded-2xl border border-slate-200/90 p-4 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between gap-3 bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {preset.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 pt-1">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {preset.tagline}
                    </p>
                    <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                      <p className="font-semibold text-slate-700">Includes 4 subjects:</p>
                      <p className="truncate text-slate-500">
                        {preset.subjects.map((s) => s.name.split(' ')[0]).join(', ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full min-h-[36px] py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Syllabus Loaded!</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Load {preset.badge}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
