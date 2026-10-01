import React, { useState } from 'react';
import { Play, Plus, CheckCircle2, Clock, Flame } from 'lucide-react';
import { Subject, StudyTask, StudySession } from '../types/study';
import { getGreeting, formatFullDate, getLocalDateString } from '../utils/storage';
import { TaskItemRow } from './TaskItemRow';

interface HomeViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  studentName?: string;
  onStartStudying: (task?: StudyTask) => void;
  onOpenAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNavigateToSubjects: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  subjects,
  tasks,
  sessions,
  studentName,
  onStartStudying,
  onOpenAddTask,
  onToggleTask,
  onDeleteTask,
  onNavigateToSubjects,
}) => {
  const [pendingScope, setPendingScope] = useState<'today' | 'all'>('today');

  const now = new Date();
  const greeting = getGreeting(now);
  const fullDate = formatFullDate(now);
  const todayStr = getLocalDateString(now);

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  // Tasks relevant to today (due today or overdue, plus any completed today)
  const todayTasks = tasks.filter(
    (t) =>
      t.dueDate <= todayStr ||
      (t.completed && t.completedAt && t.completedAt.startsWith(todayStr))
  );

  const todayPendingTasks = tasks.filter((t) => !t.completed && t.dueDate <= todayStr);
  const allPendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Progress percentage calculation
  // If there are tasks for today, calculate today's completion %, otherwise overall task completion %
  const progressDenominator = todayTasks.length > 0 ? todayTasks.length : tasks.length;
  const progressNumerator =
    todayTasks.length > 0
      ? todayTasks.filter((t) => t.completed).length
      : completedTasks.length;

  const progressPercentage =
    progressDenominator > 0 ? Math.round((progressNumerator / progressDenominator) * 100) : 0;

  // Today's study minutes & sessions
  const todaySessions = sessions.filter((s) => s.dateStr === todayStr);
  const todayStudyMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const displayedPendingTasks = pendingScope === 'today' ? todayPendingTasks : allPendingTasks;

  // SVG Ring calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Hero Greeting & Prominent Start Studying Anchor */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/app-logo.jpg"
              alt="StudySnap App Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 shadow-sm border border-blue-500/20"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">{fullDate}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Classes 10–12 · JEE · NEET
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {greeting}, {studentName || 'Student'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                {todayPendingTasks.length === 0
                  ? 'All tasks scheduled for today are finished. Ready for a focused review session?'
                  : `You have ${todayPendingTasks.length} pending ${
                      todayPendingTasks.length === 1 ? 'task' : 'tasks'
                    } scheduled for today and ${todayStudyMinutes} minutes logged.`}
              </p>
            </div>
          </div>

          {/* Primary Focal Anchor: Prominent Start Studying Button + Add Task */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onStartStudying(todayPendingTasks[0])}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Studying
            </button>
            <button
              type="button"
              onClick={onOpenAddTask}
              className="min-h-[48px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="my-6 border-t border-slate-100" />

        {/* Progress Percentage & Key Daily Metrics Row (No nested card boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Progress Ring & Percentage */}
          <div className="md:col-span-5 flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900">Today’s Goal Progress</h2>
              <p className="text-xs text-slate-500">
                <span className="font-mono tabular-nums font-semibold text-slate-700">
                  {progressNumerator}
                </span>{' '}
                of{' '}
                <span className="font-mono tabular-nums font-semibold text-slate-700">
                  {progressDenominator}
                </span>{' '}
                tasks completed
              </p>
              <div className="w-36 sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3 Clean Unboxed Metric Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
            <div>
              <p className="text-xs text-slate-500">Pending Today</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {todayPendingTasks.length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {allPendingTasks.length} total open
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Completed</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
                {completedTasks.length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {todayTasks.filter((t) => t.completed).length} done today
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Focus Time Today</p>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {todayStudyMinutes}m
              </p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {todaySessions.length} {todaySessions.length === 1 ? 'session' : 'sessions'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Split on Desktop: Today's Pending Tasks & Completed Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pending Tasks Column (7 cols on desktop) */}
        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {pendingScope === 'today' ? 'Today’s Pending Tasks' : 'All Pending Tasks'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap a checkbox to complete or press play to launch a 25-minute focus timer
              </p>
            </div>

            {/* Interactive Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPendingScope('today')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  pendingScope === 'today'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Due Today ({todayPendingTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setPendingScope('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  pendingScope === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Open ({allPendingTasks.length})
              </button>
            </div>
          </div>

          {displayedPendingTasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {pendingScope === 'today'
                  ? 'All caught up for today!'
                  : 'No pending tasks remaining'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {pendingScope === 'today' && allPendingTasks.length > 0
                  ? `You have ${allPendingTasks.length} upcoming task(s) scheduled for later dates.`
                  : 'Add a new study task or start a Pomodoro focus session.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                {pendingScope === 'today' && allPendingTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPendingScope('all')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-900 transition-colors whitespace-nowrap"
                  >
                    View Upcoming ({allPendingTasks.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenAddTask}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors whitespace-nowrap"
                >
                  + Add Task
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayedPendingTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  subject={subjectMap.get(task.subjectId)}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                  onStudyTask={(t) => onStartStudying(t)}
                />
              ))}
            </div>
          )}

          <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{subjects.length} active subjects</span>
            <button
              type="button"
              onClick={onNavigateToSubjects}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Manage Subjects & Tasks →
            </button>
          </div>
        </section>

        {/* Completed Tasks Column (5 cols on desktop) */}
        <section className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/90 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Completed Tasks</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedTasks.length}{' '}
                {completedTasks.length === 1 ? 'task finished' : 'tasks finished'}
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
              {progressPercentage}% Done
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No completed tasks yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Check off any pending task on your list to track your daily momentum.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completedTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  subject={subjectMap.get(task.subjectId)}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          )}

          {todaySessions.length > 0 && (
            <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Logged <strong className="font-mono tabular-nums">{todayStudyMinutes} min</strong>{' '}
                across {todaySessions.length} Pomodoro{' '}
                {todaySessions.length === 1 ? 'session' : 'sessions'} today.
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
