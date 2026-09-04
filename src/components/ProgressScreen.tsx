/**
 * Progress and Learning History Screen
 * Clear, motivating charts and vocabulary repository for mom
 */
import React, { useState } from 'react';
import type { UserProfile, ConversationSession } from '../types.ts';
import {
  BarChart3,
  Clock,
  MessageSquare,
  Award,
  BookOpen,
  Sparkles,
  Volume2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { speakText } from '../services/speech.ts';

interface ProgressScreenProps {
  profile: UserProfile;
  sessions: ConversationSession[];
  onStartConversation: () => void;
  onDeleteSavedWord?: (word: string) => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  sessions,
  onStartConversation,
  onDeleteSavedWord,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vocabulary' | 'history'>('overview');
  const [vocabSearch, setVocabSearch] = useState('');

  // Calculate averages across sessions
  const sessionsWithReports = sessions.filter(s => s.report);
  const totalCount = profile.totalConversations || sessions.length;

  let avgGrammar = 0;
  let avgVocab = 0;
  let avgNatural = 0;
  let avgComp = 0;

  if (sessionsWithReports.length > 0) {
    const sum = sessionsWithReports.reduce(
      (acc, s) => {
        const sc = s.report!.scores;
        return {
          g: acc.g + sc.grammar,
          v: acc.v + sc.vocabulary,
          n: acc.n + sc.naturalness,
          c: acc.c + sc.comprehension,
        };
      },
      { g: 0, v: 0, n: 0, c: 0 }
    );
    avgGrammar = Math.round(sum.g / sessionsWithReports.length);
    avgVocab = Math.round(sum.v / sessionsWithReports.length);
    avgNatural = Math.round(sum.n / sessionsWithReports.length);
    avgComp = Math.round(sum.c / sessionsWithReports.length);
  } else {
    // Default baseline if no completed sessions yet
    avgGrammar = 85;
    avgVocab = 80;
    avgNatural = 82;
    avgComp = 90;
  }

  const overallAverage = Math.round((avgGrammar + avgVocab + avgNatural + avgComp) / 4);

  // Filtered vocabulary
  const filteredVocab = profile.savedVocabulary.filter(
    (w) =>
      w.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      w.translation.toLowerCase().includes(vocabSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6">
      {/* Title & Start Conversation Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Мой прогресс
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ваши успехи, словарный запас и история разговоров с Alex
          </p>
        </div>
        <button
          id="btn-progress-start-talk"
          onClick={onStartConversation}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Начать разговор</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          id="tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 Обзор и оценки
        </button>
        <button
          id="tab-vocabulary"
          onClick={() => setActiveTab('vocabulary')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'vocabulary'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📚 Мой словарь</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {profile.savedVocabulary.length}
          </span>
        </button>
        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📜 Прошлые беседы</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
            {sessions.length}
          </span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <span>Разговоров</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {totalCount}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Минут практики</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {profile.totalMinutes}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Средний балл</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {overallAverage}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>Изучено слов</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {profile.savedVocabulary.length}
              </div>
            </div>
          </div>

          {/* Skill Performance Bars */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Оценки по навыкам
            </h3>
            <div className="space-y-4">
              {/* Grammar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Grammar (Грамматика)</span>
                  <span className="text-indigo-600">{avgGrammar}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, avgGrammar))}%` }}
                  />
                </div>
              </div>

              {/* Vocabulary */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Vocabulary (Словарный запас)</span>
                  <span className="text-emerald-600">{avgVocab}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, avgVocab))}%` }}
                  />
                </div>
              </div>

              {/* Naturalness */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Naturalness (Естественность речи)</span>
                  <span className="text-amber-500">{avgNatural}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, avgNatural))}%` }}
                  />
                </div>
              </div>

              {/* Comprehension */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Context & Comprehension (Понимание)</span>
                  <span className="text-purple-600">{avgComp}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, avgComp))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Memory Card (Facts Alex remembers) */}
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>Что Alex помнит о вас из разговоров</span>
            </div>
            {profile.knownFacts && profile.knownFacts.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-rose-950">
                {profile.knownFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-rose-100">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600">
                Когда вы рассказываете о своей семье, увлечениях, городе или планах, Alex запоминает это и естественно упоминает в будущих беседах!
              </p>
            )}
          </div>

          {/* Common Tips / Golden Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Полезные напоминания
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">📸 Фотографии</strong>
                <span className="text-slate-600">
                  Правильно: <code className="text-emerald-700 font-bold">take a photo</code> (а не make a photo).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">⏳ Прошедшее время</strong>
                <span className="text-slate-600">
                  Past Simple: <code className="text-emerald-700 font-bold">I went to London</code> (не have went).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">🤝 Согласие</strong>
                <span className="text-slate-600">
                  Правильно: <code className="text-emerald-700 font-bold">I agree with you</code> (без глагола am).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-800 block mb-0.5">🌧️ Погода</strong>
                <span className="text-slate-600">
                  Сильный дождь: <code className="text-emerald-700 font-bold">heavy rain</code> (не strong rain).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VOCABULARY TAB */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по словам или переводу..."
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {filteredVocab.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">В словаре пока нет сохранённых слов.</p>
              <p className="text-xs text-slate-400 mt-1">
                Слова будут автоматически сохраняться после каждого завершённого разговора!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredVocab.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-base font-bold text-slate-900 font-display">{w.word}</span>
                      <button
                        onClick={() => speakText(w.word, profile.level)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Озвучить слово"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs font-semibold text-indigo-700 mt-0.5">{w.translation}</div>
                    {w.example && (
                      <p className="mt-2 text-xs italic text-slate-500 border-l-2 border-slate-200 pl-2">
                        "{w.example}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm font-medium">История разговоров пока пуста.</p>
              <p className="text-xs text-slate-400 mt-1">
                Нажмите «Начать разговор», чтобы провести свою первую беседу!
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const dateStr = new Date(sess.startedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              });
              const mins = Math.max(1, Math.round(sess.durationSeconds / 60));
              const score = sess.report?.scores.overall || 85;

              return (
                <div
                  key={sess.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{sess.situationTitle}</span>
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {sess.level}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{mins} мин</span>
                      <span>•</span>
                      <span>{sess.messages.filter((m) => m.role === 'user').length} ответов</span>
                    </div>
                  </div>

                  {sess.report && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Итог</div>
                        <div className="text-lg font-extrabold text-indigo-600 font-display">
                          {score}/100
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
