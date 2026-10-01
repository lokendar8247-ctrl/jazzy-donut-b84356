import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Layers, Check } from 'lucide-react';
import { Subject, StudyTask } from '../types/study';
import { getLocalDateString, getDateOffsetString } from '../utils/storage';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  defaultSubjectId?: string;
  onAddTask: (taskData: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>) => void;
  onRequestCreateSubject: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  subjects,
  defaultSubjectId,
  onAddTask,
  onRequestCreateSubject,
}) => {
  const todayStr = getLocalDateString();
  const tomorrowStr = getDateOffsetString(1);
  const in3DaysStr = getDateOffsetString(3);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(defaultSubjectId || (subjects[0]?.id ?? ''));
  const [chapterTopic, setChapterTopic] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setChapterTopic('');
      setDueDate(getLocalDateString());
      setError('');
      if (defaultSubjectId && subjects.some((s) => s.id === defaultSubjectId)) {
        setSubjectId(defaultSubjectId);
      } else if (subjects.length > 0) {
        setSubjectId(subjects[0].id);
      } else {
        setSubjectId('');
      }
    }
  }, [isOpen, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title.');
      return;
    }
    if (!subjectId) {
      setError('Please select or create a subject first.');
      return;
    }
    onAddTask({
      title: trimmedTitle,
      subjectId,
      chapterTopic: chapterTopic.trim() || 'General Review',
      dueDate: dueDate || todayStr,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-task-title"
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl p-6 transition-transform">
        {/* Grab handle on mobile */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="modal-add-task-title" className="text-lg font-bold text-slate-900">
              Add Study Task
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign a task to a subject, chapter/topic, and due date
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-600 mb-4">
              You need at least one Subject before adding a study task.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestCreateSubject();
              }}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Subject
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="task-title-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Task Title
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g., Complete Practice Problems 1–15"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-subject-select"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  Subject
                </label>
                <select
                  id="task-subject-select"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                >
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-chapter-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Chapter / Topic
                </label>
                <input
                  id="task-chapter-input"
                  type="text"
                  value={chapterTopic}
                  onChange={(e) => setChapterTopic(e.target.value)}
                  placeholder="e.g., Chapter 4: Matrices"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="task-duedate-input"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due Date
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDueDate(todayStr)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      dueDate === todayStr
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(tomorrowStr)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      dueDate === tomorrowStr
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(in3DaysStr)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      dueDate === in3DaysStr
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    +3 Days
                  </button>
                </div>
              </div>
              <input
                id="task-duedate-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 font-mono tabular-nums focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                Save Task
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
