import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Calendar,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Subject, StudyTask, StudySession } from '../types/study';
import { SUBJECT_COLORS, renderSubjectIcon } from '../utils/theme';
import { formatSessionTimestamp } from '../utils/storage';

interface RecentSessionsListProps {
  sessions: StudySession[];
  subjects: Subject[];
  tasks: StudyTask[];
  onDeleteSession?: (sessionId: string) => void;
  onClearAllSessions?: () => void;
  onStartStudy?: () => void;
}

export const RecentSessionsList: React.FC<RecentSessionsListProps> = ({
  sessions,
  subjects,
  tasks,
  onDeleteSession,
  onClearAllSessions,
  onStartStudy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const taskMap = new Map<string, StudyTask>(tasks.map((t) => [t.id, t]));

  // Sort sessions: newest first
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Filter sessions
  const filteredSessions = sortedSessions.filter((session) => {
    const subject = subjectMap.get(session.subjectId);
    const task = session.taskId ? taskMap.get(session.taskId) : undefined;

    // Filter by subject
    if (selectedSubjectFilter !== 'all' && session.subjectId !== selectedSubjectFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const subjectName = (subject?.name || 'General Study').toLowerCase();
      const taskTitle = (task?.title || '').toLowerCase();
      return subjectName.includes(q) || taskTitle.includes(q);
    }

    return true;
  });

  const totalFilteredMinutes = filteredSessions.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );

  return (
    <section className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Section Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Recent Study Sessions Log
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Detailed chronological record of every completed Pomodoro study session with exact timestamps and durations
          </p>
        </div>

        {/* Action Buttons & Quick Summary */}
        <div className="flex flex-wrap items-center gap-2.5">
          {sessions.length > 0 && onClearAllSessions && (
            <>
              {isConfirmingClear ? (
                <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-xs text-rose-700 px-2 font-medium">Clear all {sessions.length} logs?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllSessions();
                      setIsConfirmingClear(false);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/60 text-xs font-medium text-slate-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Clear all recorded study sessions"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </>
          )}

          {onStartStudy && (
            <button
              type="button"
              onClick={onStartStudy}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar (when sessions exist) */}
      {sessions.length > 0 && (
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-sm bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by subject or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="all">All Subjects ({sessions.length})</option>
              {subjects.map((subj) => {
                const count = sessions.filter((s) => s.subjectId === subj.id).length;
                return (
                  <option key={subj.id} value={subj.id}>
                    {subj.name} ({count})
                  </option>
                );
              })}
            </select>

            <span className="text-xs text-slate-500 font-mono tabular-nums pl-1">
              Total: {totalFilteredMinutes}m ({Math.floor(totalFilteredMinutes / 60)}h{' '}
              {totalFilteredMinutes % 60}m)
            </span>
          </div>
        </div>
      )}

      {/* Content: Sessions List or Fresh Clean Empty State */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <Flame className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              All Fresh! No Study Sessions Yet
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your focus journey begins with your first 25-minute Pomodoro session. Every minute of dedicated study here builds your consistency.
            </p>
            <p className="text-xs text-amber-700 font-medium pt-1 italic">
              "With disciplined daily practice, academic excellence is achieved."
            </p>
          </div>
          {onStartStudy && (
            <button
              type="button"
              onClick={onStartStudy}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Your First Study Session</span>
            </button>
          )}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No study sessions found matching "{searchQuery || selectedSubjectFilter}".
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredSessions.map((session) => {
            const subj = subjectMap.get(session.subjectId);
            const colorTheme = subj ? SUBJECT_COLORS[subj.colorKey] : SUBJECT_COLORS.slate;
            const linkedTask = session.taskId ? taskMap.get(session.taskId) : undefined;
            const timeData = formatSessionTimestamp(session.completedAt);

            return (
              <div
                key={session.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Subject & Task Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl ${colorTheme.softBg} ${colorTheme.textColor} flex items-center justify-center shrink-0 border ${colorTheme.borderColor}`}
                  >
                    {renderSubjectIcon(subj?.iconKey || 'book', 'w-5 h-5')}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {subj ? subj.name : 'General Study'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {timeData.relativeLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
                      {linkedTask ? (
                        <>
                          <span className="truncate max-w-[280px] font-medium text-slate-700">
                            {linkedTask.title}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500">Focus Session</span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                        </>
                      )}
                      <span className="text-slate-500 font-mono tabular-nums">
                        {timeData.timeLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duration & Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 font-mono tabular-nums text-xs font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {session.durationMinutes} min
                    </span>
                  </div>

                  {onDeleteSession && (
                    <button
                      type="button"
                      onClick={() => onDeleteSession(session.id)}
                      className="opacity-60 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Delete this study session"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
