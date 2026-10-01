/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Timer,
  BarChart3,
  Plus,
  GraduationCap,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  AppTab,
  StudySnapState,
  Subject,
  StudyTask,
  StudySession,
  SubjectColorKey,
  SubjectIconKey,
  StudyThemeKey,
} from './types/study';
import {
  loadStudySnapState,
  saveStudySnapState,
  createInitialSeedState,
  getLocalDateString,
} from './utils/storage';
import { STUDY_THEMES, ExamPreset } from './utils/theme';
import { ExamSyllabus } from './utils/syllabusData';
import { HomeView } from './components/HomeView';
import { SubjectsView } from './components/SubjectsView';
import { SyllabusView } from './components/SyllabusView';
import { TimerView } from './components/TimerView';
import { ProgressView } from './components/ProgressView';
import { TaskFormModal } from './components/TaskFormModal';
import { StudyThemeSelector } from './components/StudyThemeSelector';
import { InstallAppModal } from './components/InstallAppModal';
import { OpeningScreen } from './components/OpeningScreen';

export default function App() {
  const [state, setState] = useState<StudySnapState>(() => loadStudySnapState());
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Modal states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultTaskSubjectId, setDefaultTaskSubjectId] = useState<string | undefined>(
    undefined
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOpeningScreenOpen, setIsOpeningScreenOpen] = useState(() => {
    return localStorage.getItem('studysnap_hide_welcome') !== 'true';
  });
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('studysnap_student_name') || '';
  });

  // Listen for native PWA / APK install prompt on Android & Desktop
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Timer focus target when navigating from Home, Subjects, or Syllabus
  const [timerTargetSubjectId, setTimerTargetSubjectId] = useState<string | undefined>(
    undefined
  );
  const [timerTargetTaskId, setTimerTargetTaskId] = useState<string | undefined>(
    undefined
  );

  // Persist to localStorage whenever state updates
  useEffect(() => {
    saveStudySnapState(state);
  }, [state]);

  // Subject Handlers
  const handleCreateSubject = (
    name: string,
    colorKey: SubjectColorKey,
    iconKey: SubjectIconKey
  ) => {
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name,
      colorKey,
      iconKey,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      tasks: prev.tasks.filter((t) => t.subjectId !== subjectId),
      sessions: prev.sessions.filter((sess) => sess.subjectId !== subjectId),
    }));
  };

  // Task Handlers
  const handleOpenAddTask = (subjectId?: string) => {
    setDefaultTaskSubjectId(subjectId);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (
    taskData: Omit<StudyTask, 'id' | 'completed' | 'createdAt'>
  ) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Study Session Handlers
  const handleRecordSession = (
    subjectId: string,
    durationMinutes: number,
    taskId?: string
  ) => {
    let targetSubjId = subjectId;
    let nextSubjects = state.subjects;

    // If no subject exists, automatically create a default General Study subject
    if (!targetSubjId || !nextSubjects.some((s) => s.id === targetSubjId)) {
      if (nextSubjects.length === 0) {
        const generalSubj: Subject = {
          id: `subj-${Date.now()}`,
          name: 'General Study',
          colorKey: 'blue',
          iconKey: 'book',
          createdAt: new Date().toISOString(),
        };
        nextSubjects = [generalSubj];
        targetSubjId = generalSubj.id;
      } else {
        targetSubjId = nextSubjects[0].id;
      }
    }

    const now = new Date();
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: targetSubjId,
      taskId,
      durationMinutes,
      completedAt: now.toISOString(),
      dateStr: getLocalDateString(now),
    };
    setState((prev) => ({
      ...prev,
      subjects: nextSubjects,
      sessions: [newSession, ...prev.sessions],
    }));
  };

  const handleDeleteSession = (sessionId: string) => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
  };

  const handleClearAllSessions = () => {
    setState((prev) => ({
      ...prev,
      sessions: [],
    }));
  };

  const handleStartStudyingFromHome = (task?: StudyTask) => {
    if (task) {
      setTimerTargetSubjectId(task.subjectId);
      setTimerTargetTaskId(task.id);
    } else if (state.subjects.length > 0) {
      setTimerTargetSubjectId(state.subjects[0].id);
      setTimerTargetTaskId(undefined);
    }
    setActiveTab('timer');
  };

  const handleStudySubjectOrTask = (subjectId: string, task?: StudyTask) => {
    setTimerTargetSubjectId(subjectId);
    setTimerTargetTaskId(task?.id);
    setActiveTab('timer');
  };

  const handleUpdateDailyGoal = (minutes: number) => {
    setState((prev) => ({
      ...prev,
      dailyGoalMinutes: minutes,
    }));
  };

  const handleSelectTheme = (themeKey: StudyThemeKey) => {
    setState((prev) => ({
      ...prev,
      studyTheme: themeKey,
    }));
  };

  const handleUpdateTargetExam = (examName: string) => {
    setState((prev) => ({
      ...prev,
      targetExam: examName,
    }));
  };

  const handleApplyExamPreset = (preset: ExamPreset) => {
    const timestamp = Date.now();
    const newSubjects: Subject[] = preset.subjects.map((s, idx) => ({
      id: `subj-preset-${timestamp}-${idx}`,
      name: s.name,
      colorKey: s.colorKey,
      iconKey: s.iconKey,
      createdAt: new Date().toISOString(),
    }));

    const todayStr = getLocalDateString();
    const newTasks: StudyTask[] = preset.starterTasks.map((t, idx) => ({
      id: `task-preset-${timestamp}-${idx}`,
      title: t.title,
      subjectId: newSubjects[t.subjectIndex]?.id || newSubjects[0].id,
      chapterTopic: t.chapterTopic,
      dueDate: todayStr,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setState((prev) => ({
      ...prev,
      subjects: newSubjects,
      tasks: newTasks,
      targetExam: preset.name,
    }));
  };

  // Syllabus Interaction Handlers
  const handleToggleChapter = (chapterId: string) => {
    setState((prev) => {
      const current = prev.completedChapterIds || [];
      const next = current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId];
      return {
        ...prev,
        completedChapterIds: next,
      };
    });
  };

  const handleStartStudyChapter = (subjectName: string, chapterTitle: string) => {
    const existingSubj = state.subjects.find(
      (s) => s.name.toLowerCase() === subjectName.toLowerCase()
    );
    let targetSubjId: string;

    if (!existingSubj) {
      const createdSubj: Subject = {
        id: `subj-${Date.now()}`,
        name: subjectName,
        colorKey: 'blue',
        iconKey: 'atom',
        createdAt: new Date().toISOString(),
      };
      targetSubjId = createdSubj.id;
      setState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, createdSubj],
      }));
    } else {
      targetSubjId = existingSubj.id;
    }

    setTimerTargetSubjectId(targetSubjId);
    setTimerTargetTaskId(undefined);
    setActiveTab('timer');
  };

  const handleAddTaskForChapter = (subjectName: string, chapterTitle: string) => {
    const existingSubj = state.subjects.find(
      (s) => s.name.toLowerCase() === subjectName.toLowerCase()
    );
    let targetSubjId: string;

    if (!existingSubj) {
      const createdSubj: Subject = {
        id: `subj-${Date.now()}`,
        name: subjectName,
        colorKey: 'indigo',
        iconKey: 'book',
        createdAt: new Date().toISOString(),
      };
      targetSubjId = createdSubj.id;
      setState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, createdSubj],
      }));
    } else {
      targetSubjId = existingSubj.id;
    }
    setDefaultTaskSubjectId(targetSubjId);
    setIsAddTaskOpen(true);
  };

  const handleImportSyllabusToSubjects = (syllabus: ExamSyllabus) => {
    const timestamp = Date.now();
    const existingNames = new Set(state.subjects.map((s) => s.name.toLowerCase()));
    const toAdd: Subject[] = [];

    syllabus.subjects.forEach((s, idx) => {
      if (!existingNames.has(s.name.toLowerCase())) {
        toAdd.push({
          id: `subj-syl-${timestamp}-${idx}`,
          name: s.name,
          colorKey: s.colorKey,
          iconKey: s.iconKey,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (toAdd.length > 0) {
      setState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, ...toAdd],
      }));
    }
  };

  const handleResetSampleData = () => {
    const fresh = createInitialSeedState();
    setState(fresh);
  };

  const themeConfig = STUDY_THEMES[state.studyTheme || 'classic'] || STUDY_THEMES.classic;

  return (
    <div className={`min-h-screen flex flex-col ${themeConfig.pageBg} ${themeConfig.textPrimary} pb-24 transition-colors duration-300`}>
      {/* Top Bar Header */}
      <header className={`sticky top-0 z-30 h-16 ${themeConfig.headerBg} backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between gap-4`}>
        {/* Zone 1: Official App Logo and Name */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpeningScreenOpen(true)}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            title="Click to view StudySnap Launch Interface"
          >
            <img
              src="/app-logo.jpg"
              alt="StudySnap Logo"
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-blue-500/20 group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                StudySnap
              </span>
              <span className="text-[9px] font-bold text-blue-600 tracking-wider uppercase leading-none hidden sm:inline">
                Learn · Practice · Score
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-600">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Home
          </a>
          <a
            href="#subjects"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('subjects');
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Subjects
          </a>
          <a
            href="#syllabus"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('syllabus');
            }}
            className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'syllabus'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Syllabus</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
              New
            </span>
          </a>
          <a
            href="#timer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('timer');
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'timer'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Timer
          </a>
          <a
            href="#progress"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('progress');
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'progress'
                ? 'text-blue-600 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Progress
          </a>
        </nav>

        {/* Zone 3: Launch Screen + Install App + Study Theme Selector & Primary Add Task Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsOpeningScreenOpen(true)}
            className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-blue-200/90 bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Open Welcome / Launch Interface"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Open Screen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Install StudySnap as an App or get Android APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </button>

          <StudyThemeSelector
            currentTheme={state.studyTheme || 'classic'}
            onSelectTheme={handleSelectTheme}
          />

          <button
            type="button"
            onClick={() => handleOpenAddTask()}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-sm hover:shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeView
            subjects={state.subjects}
            tasks={state.tasks}
            sessions={state.sessions}
            studentName={studentName}
            onStartStudying={handleStartStudyingFromHome}
            onOpenAddTask={() => handleOpenAddTask()}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onNavigateToSubjects={() => setActiveTab('subjects')}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            subjects={state.subjects}
            tasks={state.tasks}
            sessions={state.sessions}
            onCreateSubject={handleCreateSubject}
            onDeleteSubject={handleDeleteSubject}
            onOpenAddTask={handleOpenAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onStudySubjectOrTask={handleStudySubjectOrTask}
            onNavigateToSyllabus={() => setActiveTab('syllabus')}
          />
        )}

        {activeTab === 'syllabus' && (
          <SyllabusView
            completedChapterIds={state.completedChapterIds || []}
            onToggleChapter={handleToggleChapter}
            onStartStudyChapter={handleStartStudyChapter}
            onAddTaskForChapter={handleAddTaskForChapter}
            onImportSyllabusToSubjects={handleImportSyllabusToSubjects}
            existingSubjects={state.subjects}
          />
        )}

        {activeTab === 'timer' && (
          <TimerView
            subjects={state.subjects}
            tasks={state.tasks}
            sessions={state.sessions}
            initialSubjectId={timerTargetSubjectId}
            initialTaskId={timerTargetTaskId}
            onRecordSession={handleRecordSession}
            onToggleTask={handleToggleTask}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            subjects={state.subjects}
            tasks={state.tasks}
            sessions={state.sessions}
            dailyGoalMinutes={state.dailyGoalMinutes}
            targetExam={state.targetExam}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onResetSampleData={handleResetSampleData}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
            onUpdateTargetExam={handleUpdateTargetExam}
            onApplyExamPreset={handleApplyExamPreset}
            onStartStudy={() => setActiveTab('timer')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation: Home | Subjects | Syllabus | Timer | Progress */}
      <nav
        aria-label="Bottom Navigation"
        className={`fixed bottom-0 left-0 right-0 z-40 ${themeConfig.headerBg} backdrop-blur-md border-t border-slate-200/90`}
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16 px-1">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Home
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Subjects
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              activeTab === 'syllabus'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Syllabus
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timer')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              activeTab === 'timer'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Timer
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
              activeTab === 'progress'
                ? 'text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
              Progress
            </span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <TaskFormModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        subjects={state.subjects}
        defaultSubjectId={defaultTaskSubjectId}
        onAddTask={handleAddTask}
        onRequestCreateSubject={() => {
          setActiveTab('subjects');
        }}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />

      <OpeningScreen
        isOpen={isOpeningScreenOpen}
        onClose={() => setIsOpeningScreenOpen(false)}
        onStartStudying={() => {
          setActiveTab('home');
          setIsOpeningScreenOpen(false);
        }}
        onOpenTimer={() => {
          setActiveTab('timer');
          setIsOpeningScreenOpen(false);
        }}
        onOpenSyllabus={() => {
          setActiveTab('syllabus');
          setIsOpeningScreenOpen(false);
        }}
        onOpenInstall={() => {
          setIsOpeningScreenOpen(false);
          setIsInstallModalOpen(true);
        }}
        onSelectExamPreset={handleApplyExamPreset}
      />
    </div>
  );
}
