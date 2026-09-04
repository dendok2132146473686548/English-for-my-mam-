/**
 * Main application coordinator for English Friend AI tutor
 */
import React, { useState, useEffect } from 'react';
import type {
  UserProfile,
  ConversationSession,
  EnglishLevel,
  FeedbackMode,
  ConversationReport,
} from './types.ts';
import {
  loadUserProfile,
  saveUserProfile,
  loadActiveSession,
  saveActiveSession,
  loadSessionsHistory,
  recordCompletedSession,
} from './services/storage.ts';
import { Navbar } from './components/Navbar.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { ChatScreen } from './components/ChatScreen.tsx';
import { ProgressScreen } from './components/ProgressScreen.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { requestReport } from './services/apiClient.ts';
import { stopSpeaking } from './services/speech.ts';

export function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [sessions, setSessions] = useState<ConversationSession[]>(() => loadSessionsHistory());
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(() => loadActiveSession());
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'progress'>('home');
  const [activeReport, setActiveReport] = useState<{
    report: ConversationReport;
    session: ConversationSession;
  } | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Sync profile changes to localStorage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  // Sync activeSession changes to localStorage
  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  const handleStartNewConversation = () => {
    stopSpeaking();
    const newSession: ConversationSession = {
      id: 'session-' + Date.now(),
      startedAt: Date.now(),
      level: profile.level,
      mode: profile.mode,
      situationTitle: 'Новый разговор',
      situationPrompt: '',
      messages: [],
      durationSeconds: 0,
    };
    setActiveSession(newSession);
    setCurrentView('chat');
  };

  const handleResumeConversation = () => {
    if (activeSession) {
      setCurrentView('chat');
    } else {
      handleStartNewConversation();
    }
  };

  const handleUpdateSession = (updated: ConversationSession) => {
    setActiveSession(updated);
  };

  const handleFinishConversation = async () => {
    if (!activeSession || isFinishing) return;
    setIsFinishing(true);
    stopSpeaking();

    const elapsedSeconds = Math.max(30, Math.round((Date.now() - activeSession.startedAt) / 1000));
    const finalSession: ConversationSession = {
      ...activeSession,
      endedAt: Date.now(),
      durationSeconds: elapsedSeconds,
    };

    try {
      const report = await requestReport({
        level: finalSession.level,
        messages: finalSession.messages,
        situationTitle: finalSession.situationTitle,
      });

      finalSession.report = report;

      // Save into historical storage
      recordCompletedSession(finalSession);

      // Refresh state
      setSessions(loadSessionsHistory());
      setProfile(loadUserProfile());
      setActiveSession(null);

      // Display report modal
      setActiveReport({
        report,
        session: finalSession,
      });
    } catch (e) {
      console.error('Error generating report:', e);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleSelectLevel = (newLevel: EnglishLevel) => {
    setProfile(prev => ({ ...prev, level: newLevel }));
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, level: newLevel } : null);
    }
  };

  const handleSelectMode = (newMode: FeedbackMode) => {
    setProfile(prev => ({ ...prev, mode: newMode }));
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, mode: newMode } : null);
    }
  };

  const handleToggleVoice = () => {
    setProfile(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
    if (profile.voiceEnabled) {
      stopSpeaking();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={(v) => {
          stopSpeaking();
          setCurrentView(v);
        }}
        level={profile.level}
        mode={profile.mode}
        onSelectLevel={handleSelectLevel}
        onSelectMode={handleSelectMode}
        voiceEnabled={profile.voiceEnabled}
        onToggleVoice={handleToggleVoice}
        hasActiveSession={!!activeSession}
      />

      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeScreen
            profile={profile}
            hasActiveSession={!!activeSession}
            onStartNewConversation={handleStartNewConversation}
            onResumeConversation={handleResumeConversation}
            onSelectLevel={handleSelectLevel}
            onSelectMode={handleSelectMode}
            onNavigateToProgress={() => setCurrentView('progress')}
          />
        )}

        {currentView === 'chat' && (
          activeSession ? (
            <ChatScreen
              session={activeSession}
              profile={profile}
              onUpdateSession={handleUpdateSession}
              onFinishConversation={handleFinishConversation}
              onBackToHome={() => setCurrentView('home')}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-slate-600 mb-4 font-medium">Нет активного разговора.</p>
              <button
                onClick={handleStartNewConversation}
                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-md cursor-pointer"
              >
                Начать разговор
              </button>
            </div>
          )
        )}

        {currentView === 'progress' && (
          <ProgressScreen
            profile={profile}
            sessions={sessions}
            onStartConversation={handleStartNewConversation}
          />
        )}
      </main>

      {/* End of conversation report modal */}
      {activeReport && (
        <ReportModal
          report={activeReport.report}
          situationTitle={activeReport.session.situationTitle}
          level={activeReport.session.level}
          durationSeconds={activeReport.session.durationSeconds}
          onNewConversation={() => {
            setActiveReport(null);
            handleStartNewConversation();
          }}
          onGoToProgress={() => {
            setActiveReport(null);
            setCurrentView('progress');
          }}
        />
      )}

      {/* Finishing loading overlay */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl flex items-center gap-3 border border-slate-200">
            <div className="h-6 w-6 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm font-bold text-slate-800 font-display">
              Alex готовит отчёт о ваших успехах...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
