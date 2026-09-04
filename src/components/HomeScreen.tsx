/**
 * Friendly, simple home screen tailored for mom
 */
import React from 'react';
import type { UserProfile, EnglishLevel, FeedbackMode } from '../types.ts';
import {
  Play,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Clock,
  Award,
  BookOpen,
  Volume2,
  Heart,
  HelpCircle,
  Coffee,
  Plane,
  ShoppingBag,
  Stethoscope,
} from 'lucide-react';

interface HomeScreenProps {
  profile: UserProfile;
  hasActiveSession: boolean;
  onStartNewConversation: () => void;
  onResumeConversation: () => void;
  onSelectLevel: (lvl: EnglishLevel) => void;
  onSelectMode: (mode: FeedbackMode) => void;
  onNavigateToProgress: () => void;
}

const LEVEL_DESCRIPTIONS: Record<EnglishLevel, { title: string; desc: string }> = {
  A1: { title: 'A1 — Начинающий', desc: 'Короткие и понятные фразы, простые вопросы и медленная речь.' },
  A2: { title: 'A2 — Базовый', desc: 'Повседневные темы: путешествия, покупки, семья, планы.' },
  B1: { title: 'B1 — Средний', desc: 'Естественный живой темп, разные темы, богаче словарный запас.' },
  B2: { title: 'B2 — Уверенный', desc: 'Глубокие обсуждения, идиомы и сложные языковые конструкции.' },
  C1: { title: 'C1 — Продвинутый', desc: 'Беглый английский на уровне носителя языка.' },
};

const MODE_DESCRIPTIONS: Record<FeedbackMode, { title: string; desc: string; icon: string }> = {
  gentle: {
    title: 'Мягкий (Gentle)',
    desc: 'Минимум замечаний. AI не сбивает настроение, главное — говорить без страха.',
    icon: '🌸',
  },
  normal: {
    title: 'Обычный (Normal)',
    desc: 'Баланс: исправление важных ошибок и подсказка более естественной фразы.',
    icon: '⚖️',
  },
  teacher: {
    title: 'Учитель (Teacher)',
    desc: 'Подробный разбор: AI на русском объясняет правила и почему так говорят.',
    icon: '🎓',
  },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  hasActiveSession,
  onStartNewConversation,
  onResumeConversation,
  onSelectLevel,
  onSelectMode,
  onNavigateToProgress,
}) => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:py-10 pb-24 md:pb-10 space-y-5 sm:space-y-6">
      {/* Friendly Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-tr from-indigo-500 to-indigo-700 text-white shadow-xl shadow-indigo-200 ring-4 ring-white mx-auto">
          <span className="text-4xl select-none" role="img" aria-label="Alex">👋</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Привет! Я твой друг Alex
          </h1>
          <p className="mt-1 text-base text-slate-600 max-w-lg mx-auto">
            Давай просто поболтаем по-английски! Я придумаю интересную ситуацию, поддержу любую тему и мягко помогу с ошибками.
          </p>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          id="btn-start-new-conversation"
          onClick={onStartNewConversation}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-lg sm:text-xl py-4 px-6 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Play className="h-6 w-6 fill-white" />
          <span>Начать разговор</span>
        </button>

        {hasActiveSession && (
          <button
            id="btn-resume-conversation"
            onClick={onResumeConversation}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/80 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-semibold text-base py-3 px-5 transition-colors cursor-pointer"
          >
            <span>Продолжить прошлый разговор</span>
            <ArrowRight className="h-4 w-4 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Quick Progress Strip */}
      <div
        id="home-progress-strip"
        onClick={onNavigateToProgress}
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ваш прогресс</span>
          <span className="text-xs font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
            Подробнее →
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {profile.totalConversations}
            </div>
            <div className="text-xs text-slate-500 font-medium">Бесед проведено</div>
          </div>
          <div className="border-x border-slate-100">
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 font-display">
              {profile.totalMinutes} мин
            </div>
            <div className="text-xs text-slate-500 font-medium">Время практики</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-display">
              {profile.savedVocabulary.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Слов в словаре</div>
          </div>
        </div>
      </div>

      {/* Level & Mode Setup Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <span>Настройки разговора</span>
        </h2>

        {/* Level selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Ваш уровень английского
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as EnglishLevel[]).map((lvl) => (
              <button
                key={lvl}
                id={`btn-level-${lvl}`}
                onClick={() => onSelectLevel(lvl)}
                className={`py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer ${
                  profile.level === lvl
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            💡 <strong className="text-slate-700">{LEVEL_DESCRIPTIONS[profile.level].title}:</strong>{' '}
            {LEVEL_DESCRIPTIONS[profile.level].desc}
          </p>
        </div>

        {/* Mode selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Режим подсказок и исправлений
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['gentle', 'normal', 'teacher'] as FeedbackMode[]).map((m) => {
              const def = MODE_DESCRIPTIONS[m];
              const isSelected = profile.mode === m;
              return (
                <button
                  key={m}
                  id={`btn-mode-${m}`}
                  onClick={() => onSelectMode(m)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <span>{def.icon}</span>
                    <span>{m === 'gentle' ? 'Мягкий' : m === 'normal' ? 'Обычный' : 'Учитель'}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {def.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inspiring Topics Preview */}
      <div className="rounded-2xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50 p-5 text-center space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          О чём поговорим сегодня?
        </h3>
        <p className="text-xs text-slate-500">
          Нейросеть сама придумает неожиданную историю:
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-medium text-amber-900">
            <Coffee className="h-3 w-3 text-amber-600" /> Уютное кафе
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-3 py-1 text-xs font-medium text-blue-900">
            <Plane className="h-3 w-3 text-blue-600" /> Аэропорт и путешествие
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-3 py-1 text-xs font-medium text-rose-900">
            <ShoppingBag className="h-3 w-3 text-rose-600" /> Покупка подарка
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200/80 px-3 py-1 text-xs font-medium text-teal-900">
            <Stethoscope className="h-3 w-3 text-teal-600" /> Аптека за границей
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200/80 px-3 py-1 text-xs font-medium text-purple-900">
            <Heart className="h-3 w-3 text-purple-600" /> Семья и воспоминания
          </span>
        </div>
      </div>
    </div>
  );
};
