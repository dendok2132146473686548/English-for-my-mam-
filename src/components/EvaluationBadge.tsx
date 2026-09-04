/**
 * Evaluation badge displayed under user's message
 * Strictly adheres to pedagogical rules:
 * - Real errors only
 * - Clear separation of Grammar vs Vocabulary
 * - Gibberish alert for senseless input (bjnkj, asdfgh)
 * - Concise fragment corrections + Better sentence
 */
import React from 'react';
import type { EvaluationResult, FeedbackMode } from '../types.ts';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

interface EvaluationBadgeProps {
  evaluation: EvaluationResult;
  mode?: FeedbackMode;
}

export const EvaluationBadge: React.FC<EvaluationBadgeProps> = ({ evaluation, mode = 'normal' }) => {
  const {
    isGibberish,
    corrections,
    betterSentence,
    grammarStatus,
    vocabularyStatus,
    naturalnessStatus,
    contextStatus,
    teacherExplanationRu,
  } = evaluation;

  // 1. Senseless / Gibberish text
  if (isGibberish) {
    return (
      <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-amber-900 shadow-xs">
        <div className="flex items-center gap-2 font-medium text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>⚠️ I couldn't understand your answer. Please try again.</span>
        </div>
        <p className="mt-1 text-xs text-amber-800">
          Похоже на опечатку или случайный набор букв. Напишите ответ по-английски ещё раз!
        </p>
      </div>
    );
  }

  const hasCorrections = corrections && corrections.length > 0;
  const isOffTopic = contextStatus === 'off_topic';
  const isUnnatural = naturalnessStatus === 'unnatural';
  const hasGrammarIssues = grammarStatus === 'error' || grammarStatus === 'minor';
  const hasVocabIssues = vocabularyStatus === 'error' || vocabularyStatus === 'minor';

  // 2. Completely correct with no errors and natural phrasing
  if (!hasCorrections && !isOffTopic && !isUnnatural && !hasGrammarIssues && !hasVocabIssues) {
    return (
      <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-950 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-xs tracking-wide uppercase text-emerald-700">Correct</span>
            <span className="text-xs text-emerald-800">Отличный ответ без ошибок!</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <span>Grammar ✅</span>
            <span className="mx-1">•</span>
            <span>Vocab ✅</span>
          </div>
        </div>

        {betterSentence && (
          <div className="mt-2 pt-2 border-t border-emerald-100 flex items-start gap-1.5 text-xs text-emerald-900">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-emerald-700">Более естественно: </span>
              <span className="italic">{betterSentence}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2b. Understandable but unnatural or off-topic (no hard grammar/vocab corrections)
  if (!hasCorrections && (isUnnatural || isOffTopic || hasGrammarIssues || hasVocabIssues)) {
    return (
      <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-950 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-xs tracking-wide uppercase text-amber-800">
            {isOffTopic ? 'Не по теме' : 'Совет по фразе'}
          </span>
          <span className="text-xs text-amber-900">
            {isOffTopic
              ? 'Ответ понятен, но не совсем соответствует вопросу собеседника'
              : 'Ответ понятен, но звучит не совсем полно или естественно'}
          </span>
        </div>

        {betterSentence && (
          <div className="pt-2 border-t border-amber-200/70 flex items-start gap-1.5 text-xs text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-amber-800">Лучше сказать так: </span>
              <span className="italic font-semibold text-amber-950">{betterSentence}</span>
            </div>
          </div>
        )}

        {teacherExplanationRu && (
          <div className="pt-1.5 border-t border-amber-200/50 flex items-start gap-1.5 text-xs text-amber-900">
            <BookOpen className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-900">{teacherExplanationRu}</p>
          </div>
        )}
      </div>
    );
  }

  const grammarCorrections = corrections.filter(c => c.type === 'grammar');
  const vocabCorrections = corrections.filter(c => c.type === 'vocabulary');

  return (
    <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-xs space-y-2.5">
      {/* Off-topic notice if English is correct but context didn't match */}
      {isOffTopic && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
          <AlertCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>Context: Ответ правильный, но немного не по теме вопроса.</span>
        </div>
      )}

      {/* Grammar Corrections */}
      {grammarCorrections.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Grammar • Грамматика</span>
          </div>
          {grammarCorrections.map((c, i) => (
            <div key={i} className="flex flex-col text-xs bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/80">
              <div className="flex items-center gap-2 flex-wrap font-mono text-[13px]">
                <span className="text-rose-700 font-medium line-through">❌ {c.original}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded">✅ {c.correction}</span>
              </div>
              {c.explanationRu && (
                <span className="mt-1.5 text-[12px] text-slate-700 font-sans leading-snug">{c.explanationRu}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vocabulary Corrections */}
      {vocabCorrections.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Vocabulary • Слова и фразы</span>
          </div>
          {vocabCorrections.map((c, i) => (
            <div key={i} className="flex flex-col text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
              <div className="flex items-center gap-2 flex-wrap font-mono text-[13px]">
                <span className="text-amber-800 font-medium line-through">❌ {c.original}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded">✅ {c.correction}</span>
              </div>
              {c.explanationRu && (
                <span className="mt-1.5 text-[12px] text-slate-700 font-sans leading-snug">{c.explanationRu}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Better Sentence */}
      {betterSentence && (
        <div className="flex items-start gap-1.5 text-xs text-slate-800 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
          <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-900">Better: </span>
            <span className="italic font-medium text-slate-800">{betterSentence}</span>
          </div>
        </div>
      )}

      {/* Teacher Mode Explanation */}
      {(mode === 'teacher' || teacherExplanationRu) && teacherExplanationRu && (
        <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/70">
          <BookOpen className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-700">{teacherExplanationRu}</p>
        </div>
      )}
    </div>
  );
};
