import React from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  RotateCcw,
  Download,
} from 'lucide-react';
import { Subject, StudyTask, StudySession } from '../types/study';
import { getLocalDateString, getDateOffsetString } from '../utils/storage';
import { SUBJECT_COLORS, renderSubjectIcon, ExamPreset } from '../utils/theme';
import { WeeklyTrendChart } from './WeeklyTrendChart';
import { RecentSessionsList } from './RecentSessionsList';
import { IndianStudentEngagement } from './IndianStudentEngagement';

interface ProgressViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  dailyGoalMinutes: number;
  targetExam?: string;
  onUpdateDailyGoal: (minutes: number) => void;
  onResetSampleData: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onClearAllSessions?: () => void;
  onUpdateTargetExam?: (examName: string) => void;
  onApplyExamPreset?: (preset: ExamPreset) => void;
  onStartStudy?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  subjects,
  tasks,
  sessions,
  dailyGoalMinutes,
  targetExam,
  onUpdateDailyGoal,
  onResetSampleData,
  onDeleteSession,
  onClearAllSessions,
  onUpdateTargetExam,
  onApplyExamPreset,
  onStartStudy,
}) => {
  const todayStr = getLocalDateString();
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Core metrics
  const totalCompletedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  const totalStudySessions = sessions.length;
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.floor(totalStudyMinutes / 60);
  const remainingMinutes = totalStudyMinutes % 60;

  // Daily Progress (Today)
  const todaySessions = sessions.filter((s) => s.dateStr === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const dailyGoalPct =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))
      : 0;

  const todayTasks = tasks.filter(
    (t) =>
      t.dueDate <= todayStr ||
      (t.completed && t.completedAt && t.completedAt.startsWith(todayStr))
  );
  const todayCompletedTasks = todayTasks.filter((t) => t.completed).length;
  const todayTaskPct =
    todayTasks.length > 0 ? Math.round((todayCompletedTasks / todayTasks.length) * 100) : 0;

  // Last 7 days bar chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = -(6 - i);
    const dateStr = getDateOffsetString(offset);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayLabel =
      offset === 0
        ? 'Today'
        : dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayMinutes = sessions
      .filter((s) => s.dateStr === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const daySessionsCount = sessions.filter((s) => s.dateStr === dateStr).length;

    return {
      dateStr,
      dayLabel,
      dayMinutes,
      daySessionsCount,
      isToday: offset === 0,
    };
  });

  const maxDayMinutes = Math.max(
    dailyGoalMinutes,
    ...last7Days.map((d) => d.dayMinutes),
    60
  );

  // Subject breakdown
  const subjectStats = subjects.map((subj) => {
    const subjSessions = sessions.filter((s) => s.subjectId === subj.id);
    const minutes = subjSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const subjTasks = tasks.filter((t) => t.subjectId === subj.id);
    const completed = subjTasks.filter((t) => t.completed).length;
    return {
      subject: subj,
      minutes,
      sessionsCount: subjSessions.length,
      completedTasks: completed,
      totalTasks: subjTasks.length,
      shareOfMinutes:
        totalStudyMinutes > 0 ? Math.round((minutes / totalStudyMinutes) * 100) : 0,
    };
  });

  const handleExportData = () => {
    const payload = JSON.stringify({ subjects, tasks, sessions, dailyGoalMinutes }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studysnap-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Study Progress & Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Track your focus hours, daily study targets, and academic consistency
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportData}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            type="button"
            onClick={onResetSampleData}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            title="Reset progress to a completely fresh 0-minute state"
          >
            <RotateCcw className="w-4 h-4" />
            Start Fresh (0 min)
          </button>
        </div>
      </div>

      {/* Indian Student Engagement (Daily Sankalp, Quotes, 1-Click Exam Presets) */}
      <IndianStudentEngagement
        todayMinutes={todayMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        targetExam={targetExam}
        onUpdateTargetExam={onUpdateTargetExam}
        onApplyExamPreset={onApplyExamPreset}
        onStartStudy={onStartStudy}
      />

      {/* Top 4 Required Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Completed Tasks */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalCompletedTasks}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Overall completion</span>
              <span className="font-mono tabular-nums font-semibold text-slate-700">
                {taskCompletionRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Total Study Sessions */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Study Sessions</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalStudySessions}
          </p>
          <p className="text-xs text-slate-500 mt-3 tabular-nums">
            {todaySessions.length} completed today · avg{' '}
            {totalStudySessions > 0 ? Math.round(totalStudyMinutes / totalStudySessions) : 0}m /
            session
          </p>
        </div>

        {/* 3. Total Study Minutes */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Study Minutes</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalStudyMinutes}
            <span className="text-base font-medium text-slate-500 ml-1">min</span>
          </p>
          <p className="text-xs text-slate-500 mt-3 tabular-nums">
            Equivalent to {totalHours}h {remainingMinutes}m of focused study
          </p>
        </div>

        {/* 4. Daily Progress */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Daily Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {dailyGoalPct}%
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="tabular-nums">
                {todayMinutes}m / {dailyGoalMinutes}m goal
              </span>
              <span className="tabular-nums">{todayTaskPct}% tasks</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${dailyGoalPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Trend Line Chart (Recharts) */}
      <WeeklyTrendChart
        sessions={sessions}
        dailyGoalMinutes={dailyGoalMinutes}
      />

      {/* Two-Column Analytics Grid: 7-Day Daily Study Chart & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 7-Day Study Activity Bar Chart (7 cols) */}
        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daily Study Minutes (Last 7 Days)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare your daily focus time against your {dailyGoalMinutes}-minute daily target
              </p>
            </div>

            {/* Daily Goal Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="daily-goal-select" className="text-xs text-slate-500 font-medium">
                Daily Target:
              </label>
              <select
                id="daily-goal-select"
                value={dailyGoalMinutes}
                onChange={(e) => onUpdateDailyGoal(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono tabular-nums font-semibold text-slate-800"
              >
                <option value={60}>1 Hour (60m)</option>
                <option value={90}>1.5 Hours (90m)</option>
                <option value={120}>2 Hours (120m)</option>
                <option value={180}>3 Hours (180m)</option>
                <option value={240}>4 Hours (240m)</option>
              </select>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 px-2">
              {last7Days.map((day) => {
                const heightPct =
                  maxDayMinutes > 0
                    ? Math.max(6, Math.round((day.dayMinutes / maxDayMinutes) * 100))
                    : 6;
                return (
                  <div
                    key={day.dateStr}
                    className="flex flex-col items-center justify-end h-full group"
                  >
                    <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-600 mb-1.5">
                      {day.dayMinutes}m
                    </span>
                    <div className="w-full max-w-[40px] bg-slate-100 rounded-xl h-32 flex items-end p-0.5 overflow-hidden">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 ${
                          day.isToday
                            ? 'bg-blue-600'
                            : day.dayMinutes > 0
                            ? 'bg-slate-800'
                            : 'bg-slate-200'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2.5 ${
                        day.isToday
                          ? 'font-bold text-blue-600'
                          : 'font-medium text-slate-500'
                      }`}
                    >
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Time & Tasks by Subject Breakdown (5 cols) */}
        <section className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
          <div className="pb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Breakdown by Subject</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of study minutes and completed tasks across your courses
            </p>
          </div>

          {subjectStats.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No subjects added yet.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {subjectStats.map((item) => {
                const colorTheme = SUBJECT_COLORS[item.subject.colorKey] || SUBJECT_COLORS.blue;
                return (
                  <div key={item.subject.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg ${colorTheme.softBg} ${colorTheme.textColor} flex items-center justify-center shrink-0`}
                        >
                          {renderSubjectIcon(item.subject.iconKey, 'w-4 h-4')}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {item.subject.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                        {item.minutes}m ({item.shareOfMinutes}%) · {item.completedTasks}/
                        {item.totalTasks} tasks
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorTheme.barColor} rounded-full transition-all duration-300`}
                        style={{ width: `${Math.max(4, item.shareOfMinutes)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* New 'Recent Sessions' List with Detailed Logs, Timestamps, Durations, and Subject Names */}
      <RecentSessionsList
        sessions={sessions}
        subjects={subjects}
        tasks={tasks}
        onDeleteSession={onDeleteSession}
        onClearAllSessions={onClearAllSessions}
        onStartStudy={onStartStudy}
      />
    </div>
  );
};
