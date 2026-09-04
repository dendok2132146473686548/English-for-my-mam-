/**
 * Storage service for user profile, conversations history, and learning progress
 */
import type { UserProfile, ConversationSession, NewWordItem, EnglishLevel, FeedbackMode } from '../types.ts';

const PROFILE_KEY = 'ef_user_profile_v2';
const SESSIONS_KEY = 'ef_sessions_history_v2';
const ACTIVE_SESSION_KEY = 'ef_active_session_v2';

export const DEFAULT_PROFILE: UserProfile = {
  level: 'A1',
  mode: 'normal',
  voiceEnabled: true,
  autoSpeakAI: true,
  knownFacts: [],
  usedTopics: [],
  savedVocabulary: [],
  totalConversations: 0,
  totalMinutes: 0,
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (e) {
    console.error('Failed to load user profile:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function loadActiveSession(): ConversationSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load active session:', e);
    return null;
  }
}

export function saveActiveSession(session: ConversationSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } else {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

export function loadSessionsHistory(): ConversationSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sessions history:', e);
    return [];
  }
}

export function recordCompletedSession(session: ConversationSession): void {
  try {
    const history = loadSessionsHistory();
    // Add to history
    history.unshift(session);
    // Keep max 50 sessions
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(trimmedHistory));

    // Clear active session
    saveActiveSession(null);

    // Update profile stats
    const profile = loadUserProfile();
    profile.totalConversations += 1;
    profile.totalMinutes += Math.max(1, Math.round(session.durationSeconds / 60));

    // Add topic to usedTopics
    if (session.situationTitle && !profile.usedTopics.includes(session.situationTitle)) {
      profile.usedTopics.push(session.situationTitle);
    }

    // Add new words
    if (session.report?.newWords && session.report.newWords.length > 0) {
      const existingWords = new Set(profile.savedVocabulary.map(w => w.word.toLowerCase()));
      for (const nw of session.report.newWords) {
        if (!existingWords.has(nw.word.toLowerCase())) {
          profile.savedVocabulary.push(nw);
          existingWords.add(nw.word.toLowerCase());
        }
      }
    }

    saveUserProfile(profile);
  } catch (e) {
    console.error('Failed to record completed session:', e);
  }
}

export function addKnownFactToProfile(fact: string): void {
  if (!fact || fact.trim().length === 0) return;
  const profile = loadUserProfile();
  if (!profile.knownFacts.includes(fact)) {
    profile.knownFacts.push(fact);
    saveUserProfile(profile);
  }
}
