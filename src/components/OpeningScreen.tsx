import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Timer,
  BookOpen,
  BarChart3,
  Smartphone,
  CheckCircle2,
  X,
  GraduationCap,
  Atom,
  FlaskConical,
  Flame,
} from 'lucide-react';
import { StudyThemeKey } from '../types/study';
import { ExamPreset } from '../utils/theme';

interface OpeningScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onStartStudying: () => void;
  onOpenTimer: () => void;
  onOpenSyllabus: () => void;
  onOpenInstall: () => void;
  onSelectExamPreset?: (preset: ExamPreset) => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  isOpen,
  onClose,
  onStartStudying,
  onOpenTimer,
  onOpenSyllabus,
  onOpenInstall,
  onSelectExamPreset,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('jee');
  const [dontShowAgain, setDontShowAgain] = useState(() => {
    return localStorage.getItem('studysnap_hide_welcome') === 'true';
  });

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('studysnap_hide_welcome', 'true');
    } else {
      localStorage.removeItem('studysnap_hide_welcome');
    }
    onClose();
  };

  const examPresets = [
    { id: 'class10', name: 'Class 10 CBSE', icon: '📘', badge: 'Board Exams' },
    { id: 'class12', name: 'Class 12 Boards', icon: '🎓', badge: 'CBSE / State' },
    { id: 'jee', name: 'JEE Main & Adv', icon: '⚛️', badge: 'Engineering' },
    { id: 'neet', name: 'NEET UG', icon: '🧬', badge: 'Medical' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
          aria-label="Close open interface"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Hero Banner with Official StudySnap Emblem */}
        <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-6 sm:p-8 text-white text-center overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Official App Photo */}
            <div className="relative group mb-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
              <img
                src="/app-logo.jpg"
                alt="StudySnap Official Logo"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover shadow-xl border-2 border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* App Title & Tagline */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
              StudySnap
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-300 uppercase">
              Learn • Practice • Score
            </p>

            {/* Academic Grade Badge */}
            <div className="inline-flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Classes 10–12 • JEE Main • NEET Academic Suite</span>
            </div>
          </div>
        </div>

        {/* Interactive Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Quick Target Exam Selector */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Your Academic Target:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {examPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[78px] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {preset.badge}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Official Syllabi</p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Physics, Chemistry, Math & Biology with subtopic checks
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Pomodoro Timer</p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  25/5 min focus blocks with sound alerts & session logs
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Progress Tracker</p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Streak analytics, study charts, and completion stats
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onStartStudying();
                }}
                className="w-full sm:flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Open StudySnap Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenTimer();
                }}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Timer className="w-4 h-4 text-blue-600" />
                <span>Start Timer</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenInstall();
                }}
                className="hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Install as Phone App / APK</span>
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-500">Don't show on start</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
