import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Plus,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Download,
  Check,
  Tag,
} from 'lucide-react';
import {
  ALL_SYLLABI,
  ExamCategory,
  ExamSyllabus,
  SyllabusSubject,
  SyllabusChapter,
} from '../utils/syllabusData';
import { Subject, StudyTask } from '../types/study';
import { SUBJECT_COLORS, renderSubjectIcon } from '../utils/theme';
import { getLocalDateString } from '../utils/storage';

interface SyllabusViewProps {
  completedChapterIds: string[];
  onToggleChapter: (chapterId: string) => void;
  onStartStudyChapter: (subjectName: string, chapterTitle: string) => void;
  onAddTaskForChapter: (subjectName: string, chapterTitle: string) => void;
  onImportSyllabusToSubjects: (syllabus: ExamSyllabus) => void;
  existingSubjects: Subject[];
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({
  completedChapterIds = [],
  onToggleChapter,
  onStartStudyChapter,
  onAddTaskForChapter,
  onImportSyllabusToSubjects,
  existingSubjects,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<ExamCategory>('jee');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [justImported, setJustImported] = useState(false);

  // Find active exam syllabus
  const activeSyllabus = useMemo(
    () => ALL_SYLLABI.find((s) => s.id === selectedExamId) || ALL_SYLLABI[0],
    [selectedExamId]
  );

  // Filtered chapters logic
  const filteredData = useMemo(() => {
    const subjectsToSearch =
      selectedSubjectId === 'all'
        ? activeSyllabus.subjects
        : activeSyllabus.subjects.filter((s) => s.id === selectedSubjectId);

    const query = searchQuery.trim().toLowerCase();

    return subjectsToSearch
      .map((subj) => {
        const matchingChapters = subj.chapters.filter((ch) => {
          if (!query) return true;
          const matchTitle = ch.title.toLowerCase().includes(query);
          const matchTopic = ch.importantTopics.some((topic) =>
            topic.toLowerCase().includes(query)
          );
          return matchTitle || matchTopic;
        });

        return {
          ...subj,
          chapters: matchingChapters,
        };
      })
      .filter((subj) => subj.chapters.length > 0);
  }, [activeSyllabus, selectedSubjectId, searchQuery]);

  // Overall counts for active exam
  const allExamChapters = useMemo(() => {
    return activeSyllabus.subjects.flatMap((s) => s.chapters);
  }, [activeSyllabus]);

  const completedExamChaptersCount = useMemo(() => {
    return allExamChapters.filter((ch) => completedChapterIds.includes(ch.id)).length;
  }, [allExamChapters, completedChapterIds]);

  const examProgressPct =
    allExamChapters.length > 0
      ? Math.round((completedExamChaptersCount / allExamChapters.length) * 100)
      : 0;

  const totalEstimatedHours = useMemo(() => {
    return allExamChapters.reduce((acc, ch) => acc + (ch.estimatedHours || 0), 0);
  }, [allExamChapters]);

  const handleImport = () => {
    onImportSyllabusToSubjects(activeSyllabus);
    setJustImported(true);
    setTimeout(() => setJustImported(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Official Exam & Academic Syllabi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
              JEE · NEET · Class 10, 11, 12
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete chapter-by-chapter curriculum, high-yield topic breakdowns, and progress tracking
          </p>
        </div>

        {/* 1-Click Import into Active Subjects */}
        <button
          type="button"
          onClick={handleImport}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
            justImported
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          title="Import all subjects from this exam into your active StudySnap subjects"
        >
          {justImported ? (
            <>
              <Check className="w-4 h-4" />
              <span>Syllabus Imported!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Import {activeSyllabus.badge} Subjects</span>
            </>
          )}
        </button>
      </div>

      {/* Exam Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ALL_SYLLABI.map((exam) => {
          const isSelected = exam.id === selectedExamId;
          const chapters = exam.subjects.flatMap((s) => s.chapters);
          const completedCount = chapters.filter((c) =>
            completedChapterIds.includes(c.id)
          ).length;
          const pct = Math.round((completedCount / (chapters.length || 1)) * 100);

          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => {
                setSelectedExamId(exam.id);
                setSelectedSubjectId('all');
                setSearchQuery('');
              }}
              className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{exam.name}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full tabular-nums ${
                  isSelected ? 'bg-slate-800 text-blue-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress & Overview Card for Selected Exam */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                {activeSyllabus.badge}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {activeSyllabus.name}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeSyllabus.description}
            </p>
          </div>

          {/* Completion Metrics & Progress Ring */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 shrink-0">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Syllabus Completion</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {completedExamChaptersCount}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / {allExamChapters.length} chapters
                </span>
              </div>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${examProgressPct}%` }}
                />
              </div>
            </div>

            <div className="border-l border-slate-200 pl-6 space-y-1">
              <p className="text-xs font-medium text-slate-500">Estimated Prep Time</p>
              <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {totalEstimatedHours}
                <span className="text-xs font-normal text-slate-500 ml-1">hrs</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Across {activeSyllabus.subjects.length} subjects
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Subject Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedSubjectId === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              All Subjects ({allExamChapters.length})
            </button>

            {activeSyllabus.subjects.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              const colorTheme = SUBJECT_COLORS[subj.colorKey] || SUBJECT_COLORS.blue;
              const completedCount = subj.chapters.filter((c) =>
                completedChapterIds.includes(c.id)
              ).length;

              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? `${colorTheme.accentBg} text-white`
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {renderSubjectIcon(subj.iconKey, 'w-3.5 h-3.5')}
                  <span>{subj.name}</span>
                  <span className="text-[10px] font-mono tabular-nums opacity-80">
                    ({completedCount}/{subj.chapters.length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search chapters or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Chapters Breakdown Grid by Subject */}
      <div className="space-y-6">
        {filteredData.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-12 text-center text-xs text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No chapters found</p>
            <p>No chapters matched "{searchQuery}". Try searching for another topic or clear the search.</p>
          </div>
        ) : (
          filteredData.map((subj) => {
            const colorTheme = SUBJECT_COLORS[subj.colorKey] || SUBJECT_COLORS.blue;
            const completedCount = subj.chapters.filter((c) =>
              completedChapterIds.includes(c.id)
            ).length;
            const pct = Math.round((completedCount / (subj.chapters.length || 1)) * 100);

            return (
              <section
                key={subj.id}
                className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs"
              >
                {/* Subject Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl ${colorTheme.softBg} ${colorTheme.textColor} flex items-center justify-center shrink-0 border ${colorTheme.borderColor}`}
                    >
                      {renderSubjectIcon(subj.iconKey, 'w-4 h-4')}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {subj.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {subj.chapters.length} chapters · {completedCount} completed ({pct}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="w-24 sm:w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorTheme.barColor} rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="divide-y divide-slate-100">
                  {subj.chapters.map((ch) => {
                    const isCompleted = completedChapterIds.includes(ch.id);

                    return (
                      <div
                        key={ch.id}
                        className={`px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors group ${
                          isCompleted ? 'bg-emerald-50/20' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Checkbox + Chapter info */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleChapter(ch.id)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 bg-white hover:border-slate-400 text-transparent'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark chapter as completed'}
                            aria-label={`Mark chapter ${ch.number} completed`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <div className="min-w-0 space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                                Ch {ch.number}
                              </span>
                              <h4
                                className={`text-sm font-bold ${
                                  isCompleted
                                    ? 'text-emerald-950 line-through decoration-emerald-600/50'
                                    : 'text-slate-900'
                                }`}
                              >
                                {ch.title}
                              </h4>
                              {ch.estimatedHours && (
                                <span className="text-[10px] font-mono text-slate-400 tabular-nums flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  ~{ch.estimatedHours}h
                                </span>
                              )}
                            </div>

                            {/* Important Topics Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-medium text-slate-400">
                                Key Topics:
                              </span>
                              {ch.importantTopics.map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Study Now with Timer & Create Task */}
                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto pl-9 lg:pl-0">
                          <button
                            type="button"
                            onClick={() => onAddTaskForChapter(subj.name, ch.title)}
                            className="min-h-[34px] px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Add a study assignment or review task for this chapter"
                          >
                            <Plus className="w-3.5 h-3.5 text-slate-500" />
                            <span>Add Task</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onStartStudyChapter(subj.name, ch.title)}
                            className="min-h-[34px] px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            title="Launch 25-minute Pomodoro study session for this chapter"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Focus Timer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};
