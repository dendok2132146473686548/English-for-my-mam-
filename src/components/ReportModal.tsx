/**
 * Post-conversation report modal / screen
 */
import React from 'react';
import type { ConversationReport, EnglishLevel } from '../types.ts';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BarChart2,
  Volume2,
} from 'lucide-react';
import { speakText } from '../services/speech.ts';

interface ReportModalProps {
  report: ConversationReport;
  situationTitle: string;
  level: EnglishLevel;
  durationSeconds: number;
  onNewConversation: () => void;
  onGoToProgress: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  report,
  situationTitle,
  level,
  durationSeconds,
  onNewConversation,
  onGoToProgress,
}) => {
  const { scores, whatWentWell, whatToImprove, newWords, recommendedPractice, totalTurns } = report;
  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  const scoreItems = [
    { label: 'Grammar', value: scores.grammar, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Vocabulary', value: scores.vocabulary, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Naturalness', value: scores.naturalness, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Comprehension', value: scores.comprehension, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-indigo-800 px-4 py-4 sm:px-6 sm:py-5 text-white text-center shrink-0">
          <div className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-white mb-1.5 sm:mb-2">
            <Award className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold font-display">Результаты разговора</h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-0.5">
            Тема: «{situationTitle}» • Уровень {level} • {minutes} мин ({totalTurns} ответов)
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-5 sm:space-y-6 text-slate-900 text-sm overscroll-contain">
          {/* Scores Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Оценки за разговор</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {scoreItems.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-3 text-center ${item.bg}`}
                >
                  <div className={`text-2xl sm:text-3xl font-extrabold font-display ${item.color}`}>
                    {item.value}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What went well */}
          {whatWentWell && whatWentWell.length > 0 && (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Что получилось отлично</span>
              </h3>
              <ul className="space-y-1.5">
                {whatWentWell.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to improve */}
          {whatToImprove && whatToImprove.length > 0 && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span>Над чем поработать</span>
              </h3>
              <ul className="space-y-1.5">
                {whatToImprove.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-amber-950">
                    <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New Useful Words */}
          {newWords && newWords.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Полезные слова и выражения из диалога</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {newWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-sm">{item.word}</span>
                      <button
                        onClick={() => speakText(item.word, level)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Послушать произношение"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-indigo-700 font-medium">{item.translation}</div>
                    {item.example && (
                      <div className="mt-1 text-[11px] italic text-slate-500 line-clamp-2">
                        "{item.example}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Next Practice */}
          {recommendedPractice && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Что дальше?</h4>
                <p className="mt-0.5 text-xs sm:text-sm text-indigo-950">{recommendedPractice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 pb-safe">
          <button
            id="btn-report-progress"
            onClick={onGoToProgress}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Мой прогресс</span>
          </button>

          <button
            id="btn-report-new-conversation"
            onClick={onNewConversation}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Новый разговор</span>
          </button>
        </div>
      </div>
    </div>
  );
};
