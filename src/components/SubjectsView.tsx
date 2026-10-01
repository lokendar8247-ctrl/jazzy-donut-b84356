import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Search,
  BookOpen,
  Check,
  X,
  ListChecks,
  GraduationCap,
} from 'lucide-react';
import {
  Subject,
  StudyTask,
  StudySession,
  SubjectColorKey,
  SubjectIconKey,
} from '../types/study';
import {
  SUBJECT_COLORS,
  SUBJECT_ICONS,
  renderSubjectIcon,
} from '../utils/theme';
import { TaskItemRow } from './TaskItemRow';

interface SubjectsViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  onCreateSubject: (name: string, colorKey: SubjectColorKey, iconKey: SubjectIconKey) => void;
  onDeleteSubject: (subjectId: string) => void;
  onOpenAddTask: (defaultSubjectId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStudySubjectOrTask: (subjectId: string, task?: StudyTask) => void;
  onNavigateToSyllabus?: () => void;
}

const COLOR_KEYS: SubjectColorKey[] = [
  'blue',
  'indigo',
  'emerald',
  'teal',
  'amber',
  'rose',
  'violet',
  'slate',
];

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  tasks,
  sessions,
  onCreateSubject,
  onDeleteSubject,
  onOpenAddTask,
  onToggleTask,
  onDeleteTask,
  onStudySubjectOrTask,
  onNavigateToSyllabus,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState<SubjectColorKey>('blue');
  const [selectedIcon, setSelectedIcon] = useState<SubjectIconKey>('calculator');
  const [formError, setFormError] = useState('');

  // Task filtering state
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) {
      setFormError('Please enter a subject name.');
      return;
    }
    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError('A subject with this name already exists.');
      return;
    }
    onCreateSubject(trimmed, selectedColor, selectedIcon);
    setNewSubjectName('');
    setFormError('');
    setShowCreateForm(false);
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedSubjectFilter !== 'all' && t.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const subjName = subjectMap.get(t.subjectId)?.name.toLowerCase() || '';
      return (
        t.title.toLowerCase().includes(q) ||
        t.chapterTopic.toLowerCase().includes(q) ||
        subjName.includes(q)
      );
    }
    return true;
  });

  const pendingFilteredCount = filteredTasks.filter((t) => !t.completed).length;
  const completedFilteredCount = filteredTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-8">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subjects & Study Tasks
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Organize your courses, chapters, and assignments in one structured workspace
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showCreateForm ? 'Close Subject Form' : 'New Subject'}
          </button>
          <button
            type="button"
            onClick={() =>
              onOpenAddTask(selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined)
            }
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Create Subject Drawer / Form */}
      {showCreateForm && (
        <section className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Subject</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a subject title, color theme, and academic icon
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="mt-5 space-y-5">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor="subject-name-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Subject Name
              </label>
              <input
                id="subject-name-input"
                type="text"
                value={newSubjectName}
                onChange={(e) => {
                  setNewSubjectName(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="e.g., Microeconomics, Molecular Biology, Calculus II"
                className="w-full max-w-md min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Picker */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Subject Accent Color
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_KEYS.map((cKey) => {
                    const cTheme = SUBJECT_COLORS[cKey];
                    const isSelected = selectedColor === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setSelectedColor(cKey)}
                        className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/10 scale-105'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        title={cTheme.label}
                        aria-label={`Select color ${cTheme.label}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full ${cTheme.accentBg} flex items-center justify-center text-white`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Subject Icon
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {SUBJECT_ICONS.map((iconItem) => {
                    const isSelected = selectedIcon === iconItem.key;
                    const activeColorTheme = SUBJECT_COLORS[selectedColor];
                    return (
                      <button
                        key={iconItem.key}
                        type="button"
                        onClick={() => setSelectedIcon(iconItem.key)}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                          isSelected
                            ? `${activeColorTheme.softBg} ${activeColorTheme.borderColor} ${activeColorTheme.textColor} font-semibold`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {renderSubjectIcon(iconItem.key, 'w-4 h-4 shrink-0')}
                        <span className="truncate">{iconItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Check className="w-4 h-4" />
                Create Subject
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Subjects Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">
            Your Subjects ({subjects.length})
          </h2>
          {selectedSubjectFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Show All Subjects
            </button>
          )}
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No subjects created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your classes or subjects to start organizing tasks by chapter and tracking study sessions.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                + Create Custom Subject
              </button>
              {onNavigateToSyllabus && (
                <button
                  type="button"
                  onClick={onNavigateToSyllabus}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Browse JEE / NEET / Class 10-12 Syllabi</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((subject) => {
              const colorTheme = SUBJECT_COLORS[subject.colorKey] || SUBJECT_COLORS.blue;
              const subjTasks = tasks.filter((t) => t.subjectId === subject.id);
              const pendingCount = subjTasks.filter((t) => !t.completed).length;
              const completedCount = subjTasks.filter((t) => t.completed).length;
              const totalCount = subjTasks.length;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              const subjMinutes = sessions
                .filter((s) => s.subjectId === subject.id)
                .reduce((acc, s) => acc + s.durationMinutes, 0);

              const isFiltered = selectedSubjectFilter === subject.id;

              return (
                <div
                  key={subject.id}
                  className={`rounded-2xl bg-white border transition-all p-5 flex flex-col justify-between ${
                    isFiltered
                      ? 'border-blue-600 ring-2 ring-blue-600/10'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top row: Icon + Title + Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubjectFilter(isFiltered ? 'all' : subject.id)
                        }
                        className="flex items-center gap-3 text-left group min-w-0 flex-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl ${colorTheme.softBg} ${colorTheme.textColor} flex items-center justify-center shrink-0`}
                        >
                          {renderSubjectIcon(subject.iconKey, 'w-5 h-5')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {subject.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                            {pendingCount} pending · {completedCount} done
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSubject(subject.id)}
                        className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title={`Delete ${subject.name}`}
                        aria-label={`Delete subject ${subject.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="tabular-nums">{pct}% completed</span>
                        <span className="font-mono tabular-nums">{subjMinutes}m studied</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorTheme.barColor} rounded-full transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAddTask(subject.id)}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>

                    <button
                      type="button"
                      onClick={() => onStudySubjectOrTask(subject.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold ${colorTheme.softBg} ${colorTheme.textColor} hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Study
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tasks Management Section */}
      <section className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                Study Tasks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                Showing {filteredTasks.length} tasks ({pendingFilteredCount} pending ·{' '}
                {completedFilteredCount} completed)
              </p>
            </div>

            {/* Status Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({tasks.filter((t) => !t.completed).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === 'completed'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({tasks.filter((t) => t.completed).length})
              </button>
            </div>
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title, chapter, or topic..."
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              aria-label="Filter tasks by subject"
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-900">No matching study tasks</p>
            <p className="text-xs text-slate-500 mt-1">
              Try clearing your filter or add a new task for your upcoming chapters.
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenAddTask(
                  selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined
                )
              }
              className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              + Add Study Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <TaskItemRow
                key={task.id}
                task={task}
                subject={subjectMap.get(task.subjectId)}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onStudyTask={(t) => onStudySubjectOrTask(t.subjectId, t)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
