import React from 'react';
import {
  Calculator,
  Code2,
  FlaskConical,
  BookOpen,
  Atom,
  Globe2,
  Landmark,
  Compass,
} from 'lucide-react';
import {
  SubjectColorKey,
  SubjectIconKey,
  StudyThemeKey,
  IndianQuote,
} from '../types/study';

export interface SubjectColorTheme {
  key: SubjectColorKey;
  label: string;
  accentBg: string;
  softBg: string;
  textColor: string;
  borderColor: string;
  barColor: string;
  hex: string;
}

export const SUBJECT_COLORS: Record<SubjectColorKey, SubjectColorTheme> = {
  blue: {
    key: 'blue',
    label: 'Royal Blue',
    accentBg: 'bg-blue-600',
    softBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    barColor: 'bg-blue-600',
    hex: '#2563EB',
  },
  emerald: {
    key: 'emerald',
    label: 'Forest Emerald',
    accentBg: 'bg-emerald-600',
    softBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    barColor: 'bg-emerald-600',
    hex: '#059669',
  },
  amber: {
    key: 'amber',
    label: 'Warm Amber',
    accentBg: 'bg-amber-600',
    softBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    barColor: 'bg-amber-600',
    hex: '#D97706',
  },
  rose: {
    key: 'rose',
    label: 'Crimson Rose',
    accentBg: 'bg-rose-600',
    softBg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    barColor: 'bg-rose-600',
    hex: '#E11D48',
  },
  indigo: {
    key: 'indigo',
    label: 'Deep Indigo',
    accentBg: 'bg-indigo-600',
    softBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    barColor: 'bg-indigo-600',
    hex: '#4F46E5',
  },
  teal: {
    key: 'teal',
    label: 'Ocean Teal',
    accentBg: 'bg-teal-600',
    softBg: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    barColor: 'bg-teal-600',
    hex: '#0D9488',
  },
  violet: {
    key: 'violet',
    label: 'Academic Violet',
    accentBg: 'bg-violet-600',
    softBg: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    barColor: 'bg-violet-600',
    hex: '#7C3AED',
  },
  slate: {
    key: 'slate',
    label: 'Graphite Slate',
    accentBg: 'bg-slate-700',
    softBg: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    barColor: 'bg-slate-700',
    hex: '#475569',
  },
};

export interface SubjectIconItem {
  key: SubjectIconKey;
  label: string;
  component: React.ComponentType<{ className?: string }>;
}

export const SUBJECT_ICONS: SubjectIconItem[] = [
  { key: 'calculator', label: 'Math / Calculator', component: Calculator },
  { key: 'code', label: 'Coding / CS', component: Code2 },
  { key: 'flask', label: 'Chemistry / Lab', component: FlaskConical },
  { key: 'book', label: 'Literature / Reading', component: BookOpen },
  { key: 'atom', label: 'Physics / Science', component: Atom },
  { key: 'globe', label: 'Languages / World', component: Globe2 },
  { key: 'landmark', label: 'History / Social', component: Landmark },
  { key: 'compass', label: 'Geography / Logic', component: Compass },
];

export function renderSubjectIcon(
  iconKey: SubjectIconKey,
  className = 'w-4 h-4'
): React.ReactNode {
  const meta = SUBJECT_ICONS.find((i) => i.key === iconKey) || SUBJECT_ICONS[3];
  const Component = meta.component;
  return <Component className={className} />;
}

export interface StudyThemeConfig {
  key: StudyThemeKey;
  label: string;
  tagline: string;
  dotColor: string;
  pageBg: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accentBg: string;
  accentHoverBg: string;
  accentText: string;
}

export const STUDY_THEMES: Record<StudyThemeKey, StudyThemeConfig> = {
  classic: {
    key: 'classic',
    label: 'Classic Slate',
    tagline: 'Clean & high-clarity daylight study',
    dotColor: '#2563EB',
    pageBg: 'bg-[#F8FAFC]',
    headerBg: 'bg-white/95',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200/90',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentBg: 'bg-blue-600',
    accentHoverBg: 'hover:bg-blue-700',
    accentText: 'text-blue-600',
  },
  warm_sepia: {
    key: 'warm_sepia',
    label: 'Warm Scholar',
    tagline: 'Parchment sepia to prevent eye strain during long hours',
    dotColor: '#D97706',
    pageBg: 'bg-[#FAF6EE]',
    headerBg: 'bg-[#FFFDF9]/95',
    cardBg: 'bg-[#FFFDF9]',
    cardBorder: 'border-[#EBE3D5]',
    textPrimary: 'text-[#2D241E]',
    textSecondary: 'text-[#6D5D4E]',
    accentBg: 'bg-[#C26E00]',
    accentHoverBg: 'hover:bg-[#A35D00]',
    accentText: 'text-[#C26E00]',
  },
  midnight: {
    key: 'midnight',
    label: 'Midnight Focus',
    tagline: 'Deep dark mode engineered for late night study sessions',
    dotColor: '#6366F1',
    pageBg: 'bg-[#0B0F19]',
    headerBg: 'bg-[#111827]/95',
    cardBg: 'bg-[#131B2E]',
    cardBorder: 'border-[#1E293B]',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accentBg: 'bg-indigo-600',
    accentHoverBg: 'hover:bg-indigo-700',
    accentText: 'text-indigo-400',
  },
  forest: {
    key: 'forest',
    label: 'Forest Focus',
    tagline: 'Sage calm & emerald serenity for deep concentration',
    dotColor: '#059669',
    pageBg: 'bg-[#F3F7F4]',
    headerBg: 'bg-white/95',
    cardBg: 'bg-white',
    cardBorder: 'border-[#D1E0D6]',
    textPrimary: 'text-[#16271D]',
    textSecondary: 'text-[#486352]',
    accentBg: 'bg-emerald-600',
    accentHoverBg: 'hover:bg-emerald-700',
    accentText: 'text-emerald-700',
  },
  saffron: {
    key: 'saffron',
    label: 'Golden Dawn',
    tagline: 'Vibrant golden morning energy & disciplined determination',
    dotColor: '#EA580C',
    pageBg: 'bg-[#FCF8F5]',
    headerBg: 'bg-white/95',
    cardBg: 'bg-white',
    cardBorder: 'border-[#F0DFD3]',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    accentBg: 'bg-amber-600',
    accentHoverBg: 'hover:bg-amber-700',
    accentText: 'text-amber-700',
  },
};

/**
 * Inspiring wisdom & quotes tailored for students in pure English
 */
export const INDIAN_STUDY_QUOTES: IndianQuote[] = [
  {
    quote: 'You have to dream before your dreams can come true. If you fail, never give up because F.A.I.L. means First Attempt In Learning.',
    author: 'Dr. A.P.J. Abdul Kalam',
    source: 'Wings of Fire',
  },
  {
    quote: 'Arise, awake, and stop not till the goal is reached.',
    author: 'Swami Vivekananda',
    source: 'Lectures from Colombo to Almora',
  },
  {
    quote: 'With continuous practice and disciplined focus, any challenging subject can be mastered.',
    author: 'Academic Wisdom',
    source: 'The Art of Learning',
  },
  {
    quote: 'Put your hundred percent effort into today’s study session without anxiety over rank or results.',
    author: 'Student Principle',
    source: 'Focus and Dedication',
  },
  {
    quote: 'You cannot change your future, but you can change your daily study habits, and surely your habits will change your future.',
    author: 'Dr. A.P.J. Abdul Kalam',
    source: 'Ignited Minds',
  },
  {
    quote: 'Before you begin any study session, remind yourself why you started and what you want to achieve.',
    author: 'Chanakya Wisdom',
    source: 'Discipline in Education',
  },
  {
    quote: 'Strength is life, weakness is death. Expand your knowledge and push your boundaries every day.',
    author: 'Swami Vivekananda',
    source: 'Complete Works',
  },
  {
    quote: 'Learning gives creativity, creativity leads to thinking, thinking provides knowledge, and knowledge makes you great.',
    author: 'Dr. A.P.J. Abdul Kalam',
    source: 'Indomitable Spirit',
  },
];

export interface ExamPreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  subjects: Array<{
    name: string;
    colorKey: SubjectColorKey;
    iconKey: SubjectIconKey;
  }>;
  starterTasks: Array<{
    title: string;
    subjectIndex: number;
    chapterTopic: string;
  }>;
}

export const INDIAN_EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'jee',
    name: 'JEE Main & Advanced',
    tagline: 'Engineering Aspirants (IITs / NITs)',
    badge: 'JEE 2026',
    subjects: [
      { name: 'Physics (Mechanics & Electrodynamics)', colorKey: 'blue', iconKey: 'atom' },
      { name: 'Organic & Inorganic Chemistry', colorKey: 'emerald', iconKey: 'flask' },
      { name: 'Mathematics (Calculus & Coordinate Geometry)', colorKey: 'indigo', iconKey: 'calculator' },
      { name: 'Revision & Past Year Questions', colorKey: 'amber', iconKey: 'compass' },
    ],
    starterTasks: [
      { title: 'Solve Rotational Motion Practice Questions', subjectIndex: 0, chapterTopic: 'Mechanics' },
      { title: 'Revise Aldehydes & Ketones Reaction Mechanisms', subjectIndex: 1, chapterTopic: 'Organic Chemistry' },
      { title: 'Solve Definite Integrals Past 5 Years Questions', subjectIndex: 2, chapterTopic: 'Integral Calculus' },
    ],
  },
  {
    id: 'neet',
    name: 'NEET UG (Medical)',
    tagline: 'Medical Aspirants (AIIMS / GMCs)',
    badge: 'NEET UG',
    subjects: [
      { name: 'Human Physiology & Zoology', colorKey: 'rose', iconKey: 'book' },
      { name: 'Botany & Plant Genetics', colorKey: 'emerald', iconKey: 'book' },
      { name: 'Chemistry (Physical, Organic & Inorganic)', colorKey: 'teal', iconKey: 'flask' },
      { name: 'Physics (Optics & Modern Physics)', colorKey: 'blue', iconKey: 'atom' },
    ],
    starterTasks: [
      { title: 'Read Molecular Basis of Inheritance Chapter', subjectIndex: 1, chapterTopic: 'Genetics' },
      { title: 'Solve 50 Numericals on Current Electricity & Circuits', subjectIndex: 3, chapterTopic: 'Current Electricity' },
      { title: 'Revise Chemical Bonding & Molecular Structure Tables', subjectIndex: 2, chapterTopic: 'Inorganic Chemistry' },
    ],
  },
  {
    id: 'upsc',
    name: 'UPSC Civil Services / State PSC',
    tagline: 'Civil Services Examination Aspirants',
    badge: 'UPSC CSE',
    subjects: [
      { name: 'General Studies I: History & Geography', colorKey: 'amber', iconKey: 'landmark' },
      { name: 'General Studies II: Polity & Governance', colorKey: 'indigo', iconKey: 'book' },
      { name: 'General Studies III: Economy & Environment', colorKey: 'teal', iconKey: 'globe' },
      { name: 'Daily Current Affairs & Editorial Analysis', colorKey: 'blue', iconKey: 'book' },
    ],
    starterTasks: [
      { title: 'Analyze Daily Editorial Points & Key Issues', subjectIndex: 3, chapterTopic: 'Current Affairs' },
      { title: 'Revise Fundamental Rights & Directive Principles', subjectIndex: 1, chapterTopic: 'Polity & Constitution' },
      { title: 'Practice Modern History Answer Writing Question', subjectIndex: 0, chapterTopic: 'Answer Writing' },
    ],
  },
  {
    id: 'cbse',
    name: 'Class 10 & 12 Board Exams',
    tagline: 'Senior Secondary Board Preparation',
    badge: 'Board Exams',
    subjects: [
      { name: 'Mathematics (Theory & Exemplar)', colorKey: 'indigo', iconKey: 'calculator' },
      { name: 'Science / Physics & Chemistry', colorKey: 'blue', iconKey: 'atom' },
      { name: 'Social Sciences & Humanities', colorKey: 'emerald', iconKey: 'landmark' },
      { name: 'English Core & Composition', colorKey: 'rose', iconKey: 'book' },
    ],
    starterTasks: [
      { title: 'Complete Quadratic Equations Practice Exercise', subjectIndex: 0, chapterTopic: 'Algebra' },
      { title: 'Revise Light Reflection & Refraction Ray Diagrams', subjectIndex: 1, chapterTopic: 'Physics' },
      { title: 'Draft Formal Letter and Essay Outline', subjectIndex: 3, chapterTopic: 'Writing Skills' },
    ],
  },
];
