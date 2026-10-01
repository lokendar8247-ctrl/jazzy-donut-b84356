import React from 'react';
import { Check, Trash2, Play } from 'lucide-react';
import { StudyTask, Subject } from '../types/study';
import { formatDueDateLabel } from '../utils/storage';
import { SUBJECT_COLORS } from '../utils/theme';

interface TaskItemRowProps {
  task: StudyTask;
  subject?: Subject;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStudyTask?: (task: StudyTask) => void;
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  subject,
  onToggleTask,
  onDeleteTask,
  onStudyTask,
}) => {
  const dueInfo = formatDueDateLabel(task.dueDate);
  const colorTheme = subject ? SUBJECT_COLORS[subject.colorKey] : SUBJECT_COLORS.slate;

  return (
    <div
      className={`group flex items-center justify-between gap-3 py-3.5 px-4 border-b border-slate-100 last:border-b-0 transition-colors ${
        task.completed ? 'bg-slate-50/50' : 'hover:bg-slate-50/80'
      }`}
    >
      {/* Left: 44x44px accessible checkbox toggle */}
      <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600"
          aria-label={task.completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
        >
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
              task.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white group-hover:border-blue-600'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
        </button>

        {/* Task Title + Unboxed Metadata */}
        <div className="min-w-0 flex-1">
          <p
            onClick={() => onToggleTask(task.id)}
            className={`text-sm font-semibold leading-snug cursor-pointer select-none transition-colors ${
              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>

          {/* Zero-Pill Metadata Discipline: Unboxed text with middot separators */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-slate-500">
            <span className={`font-medium ${task.completed ? 'text-slate-400' : colorTheme.textColor}`}>
              {subject ? subject.name : 'Unassigned Subject'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[220px] sm:max-w-[280px]">{task.chapterTopic}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`tabular-nums ${
                task.completed
                  ? 'text-slate-400'
                  : dueInfo.isOverdue
                  ? 'text-rose-600 font-semibold'
                  : dueInfo.isToday
                  ? 'text-amber-700 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {task.completed ? 'Completed' : dueInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Action Affordances (Study in Timer + Delete Task) */}
      <div className="flex items-center gap-1 shrink-0">
        {!task.completed && onStudyTask && (
          <button
            type="button"
            onClick={() => onStudyTask(task)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Start Pomodoro timer for this task"
            aria-label={`Start timer for ${task.title}`}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Delete task"
          aria-label={`Delete task ${task.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
