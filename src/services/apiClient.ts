/**
 * Client service to communicate with backend API, with automatic fallback
 */
import type { EnglishLevel, EvaluationResult, FeedbackMode, ConversationReport, ChatMessage } from '../types.ts';
import {
  evaluateAnswerLocally,
  getFallbackDialogueReply,
  generateFallbackReport,
} from './aiFallback.ts';

export async function requestChatReply(params: {
  level: EnglishLevel;
  situationTitle?: string;
  history: Array<{ role: 'ai' | 'user'; content: string }>;
  userFacts?: string[];
  usedTopics?: string[];
}): Promise<{ reply: string; situationTitle: string; extractedFact?: string | null }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat error, using fallback:', err);
  }

  // Graceful fallback
  return getFallbackDialogueReply(params);
}

export async function requestEvaluation(params: {
  userText: string;
  question: string;
  level: EnglishLevel;
  mode: FeedbackMode;
}): Promise<EvaluationResult> {
  try {
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && typeof data.isGibberish === 'boolean') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/evaluate error, using local evaluation:', err);
  }

  // Graceful fallback
  return evaluateAnswerLocally(params);
}

export async function requestReport(params: {
  level: EnglishLevel;
  messages: ChatMessage[];
  situationTitle: string;
}): Promise<ConversationReport> {
  try {
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.scores) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend /api/report error, using fallback report:', err);
  }

  // Graceful fallback
  return generateFallbackReport(params);
}
