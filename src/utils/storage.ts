import { StudySnapState, Subject, StudyTask, StudySession, StudyThemeKey } from '../types/study';

const STORAGE_KEY = 'studysnap_clean_v4_nodata';

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffsetString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return getLocalDateString(d);
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a study session completed timestamp into clean 12-hour AM/PM format
 * e.g., "Today, 4:15 PM" or "Yesterday, 10:30 AM" or "01 Oct 2026, 03:45 PM"
 */
export function formatSessionTimestamp(isoString: string): {
  relativeLabel: string;
  timeLabel: string;
  fullLabel: string;
} {
  const sessionDate = new Date(isoString);
  const now = new Date();
  const sessionDateStr = getLocalDateString(sessionDate);
  const todayStr = getLocalDateString(now);
  const yesterdayStr = getDateOffsetString(-1);

  const timeLabel = sessionDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  let relativeLabel = sessionDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (sessionDateStr === todayStr) {
    relativeLabel = 'Today';
  } else if (sessionDateStr === yesterdayStr) {
    relativeLabel = 'Yesterday';
  }

  return {
    relativeLabel,
    timeLabel,
    fullLabel: `${relativeLabel} at ${timeLabel}`,
  };
}

export function formatDueDateLabel(dueDateStr: string): {
  label: string;
  isToday: boolean;
  isOverdue: boolean;
} {
  const todayStr = getLocalDateString();
  const tomorrowStr = getDateOffsetString(1);
  if (dueDateStr === todayStr) {
    return { label: 'Due Today', isToday: true, isOverdue: false };
  }
  if (dueDateStr === tomorrowStr) {
    return { label: 'Due Tomorrow', isToday: false, isOverdue: false };
  }
  if (dueDateStr < todayStr) {
    const [y, m, d] = dueDateStr.split('-').map(Number);
    const parsed = new Date(y, m - 1, d);
    return {
      label: `Overdue (${parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      isToday: false,
      isOverdue: true,
    };
  }
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return {
    label: `Due ${parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    isToday: false,
    isOverdue: false,
  };
}

/**
 * Creates a completely clean initial state with ZERO demo data.
 * No subjects, no tasks, no sessions - 100% fresh for the student to start.
 */
export function createInitialSeedState(): StudySnapState {
  return {
    subjects: [],
    tasks: [],
    sessions: [],
    dailyGoalMinutes: 120, // 2 hours standard daily target
    studyTheme: 'classic',
    targetExam: 'Target Exam 2026',
  };
}

export function loadStudySnapState(): StudySnapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<StudySnapState>;
    if (
      !parsed ||
      !Array.isArray(parsed.subjects) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.sessions)
    ) {
      const initial = createInitialSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return {
      subjects: parsed.subjects,
      tasks: parsed.tasks,
      sessions: parsed.sessions,
      dailyGoalMinutes: parsed.dailyGoalMinutes || 120,
      studyTheme: (parsed.studyTheme as StudyThemeKey) || 'classic',
      targetExam: parsed.targetExam || 'Target Exam 2026',
    };
  } catch {
    return createInitialSeedState();
  }
}

export function saveStudySnapState(state: StudySnapState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist StudySnap state locally:', err);
  }
}
