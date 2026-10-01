export type AppTab = 'home' | 'subjects' | 'syllabus' | 'timer' | 'progress';

export type SubjectColorKey =
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'teal'
  | 'violet'
  | 'slate';

export type SubjectIconKey =
  | 'calculator'
  | 'code'
  | 'flask'
  | 'book'
  | 'atom'
  | 'globe'
  | 'landmark'
  | 'compass';

export interface Subject {
  id: string;
  name: string;
  colorKey: SubjectColorKey;
  iconKey: SubjectIconKey;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string;
  chapterTopic: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  dateStr: string; // YYYY-MM-DD
}

export type StudyThemeKey =
  | 'classic'
  | 'warm_sepia'
  | 'midnight'
  | 'forest'
  | 'saffron';

export interface IndianQuote {
  quote: string;
  author: string;
  source?: string;
}

export interface StudySnapState {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  dailyGoalMinutes: number;
  studyTheme: StudyThemeKey;
  targetExam?: string;
  completedChapterIds?: string[];
}
