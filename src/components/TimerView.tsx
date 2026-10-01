import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  VolumeX,
  Coffee,
  Brain,
  Clock,
  Check,
  Bell,
  BellRing,
  Music,
  X,
} from 'lucide-react';
import { Subject, StudyTask, StudySession } from '../types/study';
import { SUBJECT_COLORS, renderSubjectIcon } from '../utils/theme';
import {
  playTimerChime,
  unlockAudio,
  sendTimerBrowserNotification,
  requestBrowserNotificationPermission,
} from '../utils/sound';
import { getLocalDateString } from '../utils/storage';

interface TimerViewProps {
  subjects: Subject[];
  tasks: StudyTask[];
  sessions: StudySession[];
  initialSubjectId?: string;
  initialTaskId?: string;
  onRecordSession: (subjectId: string, durationMinutes: number, taskId?: string) => void;
  onToggleTask: (taskId: string) => void;
}

type TimerPhase = 'study' | 'break';
type TimerStatus = 'idle' | 'running' | 'paused';

export const TimerView: React.FC<TimerViewProps> = ({
  subjects,
  tasks,
  sessions,
  initialSubjectId,
  initialTaskId,
  onRecordSession,
  onToggleTask,
}) => {
  // Default Pomodoro: 25 min study + 5 min break
  const [studyDurationSec, setStudyDurationSec] = useState<number>(25 * 60);
  const [breakDurationSec, setBreakDurationSec] = useState<number>(5 * 60);
  const [phase, setPhase] = useState<TimerPhase>('study');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [justPlayedChime, setJustPlayedChime] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  // Sync if user navigated here via "Study" on a specific task or subject
  useEffect(() => {
    if (initialSubjectId && subjects.some((s) => s.id === initialSubjectId)) {
      setSelectedSubjectId(initialSubjectId);
    }
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
    }
  }, [initialSubjectId, initialTaskId, subjects]);

  // Ensure valid subject selection if subjects change
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const totalPhaseSeconds = phase === 'study' ? studyDurationSec : breakDurationSec;

  // Refs to avoid stale closures inside interval
  const stateRef = useRef({
    phase,
    studyDurationSec,
    breakDurationSec,
    selectedSubjectId,
    selectedTaskId,
    soundEnabled,
    onRecordSession,
  });

  useEffect(() => {
    stateRef.current = {
      phase,
      studyDurationSec,
      breakDurationSec,
      selectedSubjectId,
      selectedTaskId,
      soundEnabled,
      onRecordSession,
    };
  }, [
    phase,
    studyDurationSec,
    breakDurationSec,
    selectedSubjectId,
    selectedTaskId,
    soundEnabled,
    onRecordSession,
  ]);

  useEffect(() => {
    if (status !== 'running') return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Timer completed!
          const current = stateRef.current;
          if (current.phase === 'study') {
            // Calculate recorded minutes (if 5s quick demo was used, record 25m standard Pomodoro or actual minutes)
            const recordedMinutes =
              current.studyDurationSec < 60
                ? 25
                : Math.max(1, Math.round(current.studyDurationSec / 60));

            if (current.selectedSubjectId) {
              current.onRecordSession(
                current.selectedSubjectId,
                recordedMinutes,
                current.selectedTaskId || undefined
              );
            }
            if (current.soundEnabled) {
              playTimerChime('study_complete');
            }
            sendTimerBrowserNotification(
              'Study Session Completed! 🎉',
              `Great job! Recorded ${recordedMinutes} minutes. Time for your ${Math.max(
                1,
                Math.round(current.breakDurationSec / 60)
              )}-minute break.`
            );
            setCompletionBanner(
              `Study session completed! Recorded ${recordedMinutes} minutes. Starting your ${Math.max(
                1,
                Math.round(current.breakDurationSec / 60)
              )}-minute break.`
            );
            setPhase('break');
            setStatus('idle');
            return current.breakDurationSec;
          } else {
            if (current.soundEnabled) {
              playTimerChime('break_complete');
            }
            sendTimerBrowserNotification(
              'Break Finished! 🔔',
              'Break time is over. Ready for your next focused study session?'
            );
            setCompletionBanner('Break finished! Ready for your next study session.');
            setPhase('study');
            setStatus('idle');
            return current.studyDurationSec;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  const handleStart = () => {
    unlockAudio();
    setCompletionBanner(null);
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    unlockAudio();
    setStatus('running');
  };

  const handleReset = () => {
    setStatus('idle');
    setSecondsLeft(phase === 'study' ? studyDurationSec : breakDurationSec);
  };

  const switchPhase = (newPhase: TimerPhase) => {
    unlockAudio();
    setStatus('idle');
    setPhase(newPhase);
    setSecondsLeft(newPhase === 'study' ? studyDurationSec : breakDurationSec);
  };

  const applyPreset = (studySec: number, breakSec: number) => {
    unlockAudio();
    setStatus('idle');
    setStudyDurationSec(studySec);
    setBreakDurationSec(breakSec);
    setPhase('study');
    setSecondsLeft(studySec);
    setCompletionBanner(null);
  };

  const handleTestChime = () => {
    unlockAudio();
    playTimerChime(phase === 'study' ? 'study_complete' : 'break_complete');
    setJustPlayedChime(true);
    setTimeout(() => setJustPlayedChime(false), 1200);
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const res = await requestBrowserNotificationPermission();
    setNotificationPermission(res);
    if (res === 'granted') {
      sendTimerBrowserNotification(
        'StudySnap Alerts Enabled 🔔',
        'You will receive browser alerts whenever your study sessions or breaks complete.'
      );
    }
  };

  const handleCompleteAndRecordNow = () => {
    if (!selectedSubjectId) return;
    unlockAudio();
    const elapsedSec = studyDurationSec - secondsLeft;
    // Record at least the configured study duration (e.g., 25m) or elapsed minutes if user wants to log a full Pomodoro
    const minutesToRecord =
      studyDurationSec < 60
        ? 25
        : elapsedSec >= 60
        ? Math.round(elapsedSec / 60)
        : Math.round(studyDurationSec / 60);

    onRecordSession(selectedSubjectId, minutesToRecord, selectedTaskId || undefined);
    if (soundEnabled) {
      playTimerChime('study_complete');
    }
    sendTimerBrowserNotification(
      'Study Session Saved! 🎉',
      `Manually recorded ${minutesToRecord}-minute study session.`
    );
    setCompletionBanner(
      `Recorded ${minutesToRecord}-minute study session! Switched to break mode.`
    );
    setStatus('idle');
    setPhase('break');
    setSecondsLeft(breakDurationSec);
  };

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Circular ring math
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const progressFraction =
    totalPhaseSeconds > 0 ? (totalPhaseSeconds - secondsLeft) / totalPhaseSeconds : 0;
  const strokeDashoffset = circumference - progressFraction * circumference;

  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const currentSubject = subjectMap.get(selectedSubjectId);
  const subjectTasks = tasks.filter(
    (t) => t.subjectId === selectedSubjectId && !t.completed
  );
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  const todayStr = getLocalDateString();
  const todaySessions = sessions.filter((s) => s.dateStr === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pomodoro Study Timer
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            25 minutes of focused study followed by a 5-minute restorative break
          </p>
        </div>

        {/* Duration Presets + Sound Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => applyPreset(25 * 60, 5 * 60)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                studyDurationSec === 25 * 60
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              25m / 5m
            </button>
            <button
              type="button"
              onClick={() => applyPreset(50 * 60, 10 * 60)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                studyDurationSec === 50 * 60
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              50m / 10m
            </button>
            <button
              type="button"
              onClick={() => applyPreset(15 * 60, 3 * 60)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                studyDurationSec === 15 * 60
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              15m / 3m
            </button>
            <button
              type="button"
              onClick={() => applyPreset(5, 3)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                studyDurationSec === 5
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="5-second test timer that records a 25m session upon completion"
            >
              5s Demo
            </button>
          </div>

          {/* Sound Chime Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`min-h-[40px] px-3 py-1.5 flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              soundEnabled
                ? 'border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100/80'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound is active. Click to mute.' : 'Chime sound is muted. Click to unmute.'}
            aria-label={soundEnabled ? 'Chime sound active' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Test Chime Preview Button */}
          <button
            type="button"
            onClick={handleTestChime}
            className={`min-h-[40px] px-3 py-1.5 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer ${
              justPlayedChime ? 'border-blue-400 ring-2 ring-blue-100 text-blue-700' : ''
            }`}
            title="Play a sample of the subtle completion chime"
            aria-label="Preview sound chime"
          >
            <Music className={`w-3.5 h-3.5 ${justPlayedChime ? 'text-blue-600 animate-bounce' : 'text-slate-500'}`} />
            <span className="hidden md:inline">{justPlayedChime ? 'Chiming...' : 'Test Chime'}</span>
          </button>

          {/* Browser Alert Notification Permission Button */}
          {notificationPermission !== 'unsupported' && (
            <button
              type="button"
              onClick={handleRequestNotification}
              className={`min-h-[40px] px-3 py-1.5 flex items-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                notificationPermission === 'granted'
                  ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={
                notificationPermission === 'granted'
                  ? 'Browser notifications are enabled and will alert you even in other tabs.'
                  : 'Click to enable browser notifications when the timer hits zero.'
              }
              aria-label="Toggle browser notifications"
            >
              {notificationPermission === 'granted' ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Alerts On</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Enable Alerts</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Completion Feedback Alert Banner */}
      {completionBanner && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <BellRing className="w-4 h-4 animate-pulse" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950">{completionBanner}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Sound chime played and notification triggered.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleStart}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start {phase === 'study' ? 'Study' : 'Break'} Now</span>
              </button>
            )}

            {currentTask && !currentTask.completed && (
              <button
                type="button"
                onClick={() => {
                  onToggleTask(currentTask.id);
                  setCompletionBanner('Task marked completed and study session saved!');
                }}
                className="min-h-[36px] px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Task Done</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCompletionBanner(null)}
              className="p-1.5 text-emerald-700 hover:text-emerald-900 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Timer Centerpiece (7 cols) + Subject/Session Context (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: Pomodoro Timer Card */}
        <section className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col items-center">
          {/* Phase Segmented Switcher */}
          <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => switchPhase('study')}
              className={`min-h-[40px] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                phase === 'study'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-4 h-4 text-blue-600" />
              Focus Study (
              {studyDurationSec < 60 ? `${studyDurationSec}s` : `${studyDurationSec / 60}m`})
            </button>
            <button
              type="button"
              onClick={() => switchPhase('break')}
              className={`min-h-[40px] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                phase === 'break'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-4 h-4 text-emerald-600" />
              Short Break (
              {breakDurationSec < 60 ? `${breakDurationSec}s` : `${breakDurationSec / 60}m`})
            </button>
          </div>

          {/* Circular Progress Dial */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              <circle
                cx="128"
                cy="128"
                r={radius}
                fill="none"
                stroke={phase === 'study' ? '#2563EB' : '#059669'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <span className="text-xs font-semibold text-slate-500">
                {phase === 'study' ? 'Focus Session' : 'Rest & Recharge'}
              </span>
              <span className="text-5xl sm:text-6xl font-bold font-mono tabular-nums tracking-tight text-slate-900 my-2">
                {formattedTime}
              </span>
              <span className="text-xs text-slate-500 truncate max-w-[180px]">
                {currentSubject ? currentSubject.name : 'Select a Subject'}
              </span>
            </div>
          </div>

          {/* Primary Controls: Start, Pause, Resume, Reset */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 w-full max-w-md">
            {status === 'idle' && (
              <button
                type="button"
                onClick={handleStart}
                className={`flex-1 min-h-[48px] px-6 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap ${
                  phase === 'study'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Start {phase === 'study' ? 'Study Timer' : 'Break Timer'}
              </button>
            )}

            {status === 'running' && (
              <button
                type="button"
                onClick={handlePause}
                className="flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </button>
            )}

            {status === 'paused' && (
              <button
                type="button"
                onClick={handleResume}
                className="flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="min-h-[48px] px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Secondary Action: Complete & Record Session Immediately */}
          {phase === 'study' && subjects.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-center">
              <button
                type="button"
                onClick={handleCompleteAndRecordNow}
                className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete & Record Study Session Now
              </button>
            </div>
          )}
        </section>

        {/* Right Column: Session Setup & Today's Recorded Sessions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subject & Task Selector */}
          <section className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Session Focus</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Link your timer to a subject and task so your minutes are logged accurately
              </p>
            </div>

            <div>
              <label
                htmlFor="timer-subject-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Studying Subject
              </label>
              <select
                id="timer-subject-select"
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTaskId('');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="timer-task-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Target Task (Optional)
              </label>
              <select
                id="timer-task-select"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              >
                <option value="">General Subject Study</option>
                {subjectTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.chapterTopic})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Today's Recorded Sessions List */}
          <section className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today’s Study Log</h2>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  {todaySessions.length}{' '}
                  {todaySessions.length === 1 ? 'session' : 'sessions'} · {todayMinutes} min total
                </p>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            {todaySessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-slate-500">
                  No study sessions recorded today yet. Complete a timer session to log your progress.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {todaySessions.map((sess) => {
                  const subj = subjectMap.get(sess.subjectId);
                  const colorTheme = subj ? SUBJECT_COLORS[subj.colorKey] : SUBJECT_COLORS.slate;
                  const timeStr = new Date(sess.completedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={sess.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg ${colorTheme.softBg} ${colorTheme.textColor} flex items-center justify-center shrink-0`}
                        >
                          {renderSubjectIcon(subj?.iconKey || 'book', 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {subj ? subj.name : 'Study Session'}
                          </p>
                          <p className="text-xs text-slate-500 tabular-nums">
                            Completed at {timeStr}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono tabular-nums font-semibold text-slate-900 shrink-0">
                        +{sess.durationMinutes} min
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
