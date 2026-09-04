/**
 * Data types for English Friend AI tutor
 */

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type FeedbackMode = 'gentle' | 'normal' | 'teacher';

export interface CorrectionItem {
  original: string;
  correction: string;
  type: 'grammar' | 'vocabulary';
  explanationRu?: string;
}

export interface EvaluationResult {
  isGibberish: boolean;
  grammarStatus: 'correct' | 'error' | 'minor';
  vocabularyStatus: 'correct' | 'error' | 'minor';
  naturalnessStatus: 'natural' | 'unnatural';
  contextStatus: 'relevant' | 'off_topic';
  corrections: CorrectionItem[];
  betterSentence: string | null;
  scores: {
    grammar: number; // 0-100
    vocabulary: number; // 0-100
    naturalness: number; // 0-100
    context: number; // 0-100
  };
  teacherExplanationRu?: string;
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  evaluation?: EvaluationResult;
  situationTitle?: string;
}

export interface NewWordItem {
  word: string;
  translation: string;
  example: string;
}

export interface ConversationReport {
  scores: {
    grammar: number;
    vocabulary: number;
    naturalness: number;
    comprehension: number;
    overall: number;
  };
  whatWentWell: string[];
  whatToImprove: string[];
  newWords: NewWordItem[];
  recommendedPractice: string;
  totalTurns: number;
}

export interface ConversationSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  level: EnglishLevel;
  mode: FeedbackMode;
  situationTitle: string;
  situationPrompt: string;
  messages: ChatMessage[];
  report?: ConversationReport;
  durationSeconds: number;
}

export interface UserProfile {
  level: EnglishLevel;
  mode: FeedbackMode;
  voiceEnabled: boolean;
  autoSpeakAI: boolean;
  knownFacts: string[];
  usedTopics: string[];
  savedVocabulary: NewWordItem[];
  totalConversations: number;
  totalMinutes: number;
}
