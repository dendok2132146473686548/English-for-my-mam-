/**
 * Core conversational chat screen
 * Infinite AI conversation with real-time evaluation, audio synthesis & speech-to-text
 */
import React, { useState, useEffect, useRef } from 'react';
import type {
  ConversationSession,
  ChatMessage,
  EnglishLevel,
  FeedbackMode,
  EvaluationResult,
  UserProfile,
} from '../types.ts';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  StopCircle,
  Lightbulb,
  Check,
  ChevronDown,
  Info,
} from 'lucide-react';
import { EvaluationBadge } from './EvaluationBadge.tsx';
import { speakText, stopSpeaking, isSpeaking, startListening, stopListening, isSpeechRecognitionSupported } from '../services/speech.ts';
import { requestChatReply, requestEvaluation } from '../services/apiClient.ts';
import { addKnownFactToProfile } from '../services/storage.ts';

interface ChatScreenProps {
  session: ConversationSession;
  profile: UserProfile;
  onUpdateSession: (updated: ConversationSession) => void;
  onFinishConversation: () => void;
  onBackToHome: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  session,
  profile,
  onUpdateSession,
  onFinishConversation,
  onBackToHome,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [micStatusText, setMicStatusText] = useState('');
  const [showIdeas, setShowIdeas] = useState(false);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages, isAiReplying, isEvaluating]);

  // Initial prompt if session is new and has no messages
  useEffect(() => {
    if (session.messages.length === 0) {
      initiateDialogue();
    }
  }, []);

  const initiateDialogue = async () => {
    setIsAiReplying(true);
    try {
      const data = await requestChatReply({
        level: session.level,
        situationTitle: session.situationTitle,
        history: [],
        userFacts: profile.knownFacts,
        usedTopics: profile.usedTopics,
      });

      const initialMessage: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'ai',
        content: data.reply,
        timestamp: Date.now(),
        situationTitle: data.situationTitle,
      };

      const updatedSession: ConversationSession = {
        ...session,
        situationTitle: data.situationTitle || session.situationTitle,
        messages: [initialMessage],
      };

      onUpdateSession(updatedSession);

      // Speak AI greeting if voice enabled
      if (profile.voiceEnabled && profile.autoSpeakAI) {
        setActiveAudioMessageId(initialMessage.id);
        speakText(initialMessage.content, session.level, () => {
          setActiveAudioMessageId(null);
        });
      }
    } catch (e) {
      console.error('Failed to initiate dialogue:', e);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isAiReplying) return;

    setInputText('');
    setShowIdeas(false);
    stopSpeaking();
    stopListening();
    setIsRecording(false);

    const userMessageId = 'msg-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Find previous AI question
    const lastAiMsg = [...session.messages].reverse().find(m => m.role === 'ai');
    const questionAsked = lastAiMsg ? lastAiMsg.content : '';

    // Optimistically append user message
    let currentMessages = [...session.messages, newUserMessage];
    let updatedSession: ConversationSession = {
      ...session,
      messages: currentMessages,
    };
    onUpdateSession(updatedSession);

    // Run parallel evaluation and AI reply
    setIsEvaluating(true);
    setIsAiReplying(true);

    try {
      // 1. Evaluate user answer
      const evalPromise = requestEvaluation({
        userText: text,
        question: questionAsked,
        level: session.level,
        mode: session.mode,
      });

      // 2. Chat partner response
      const chatPromise = requestChatReply({
        level: session.level,
        situationTitle: session.situationTitle,
        history: currentMessages.map(m => ({ role: m.role, content: m.content })),
        userFacts: profile.knownFacts,
        usedTopics: profile.usedTopics,
      });

      const [evalResult, chatResult] = await Promise.all([evalPromise, chatPromise]);

      // If personal fact extracted, remember it
      if (chatResult.extractedFact) {
        addKnownFactToProfile(chatResult.extractedFact);
      }

      // Attach evaluation to user message
      currentMessages = currentMessages.map(m =>
        m.id === userMessageId ? { ...m, evaluation: evalResult } : m
      );

      // Create new AI reply message
      const newAiMessageId = 'msg-' + (Date.now() + 1);
      const newAiMessage: ChatMessage = {
        id: newAiMessageId,
        role: 'ai',
        content: chatResult.reply,
        timestamp: Date.now(),
        situationTitle: chatResult.situationTitle,
      };

      currentMessages.push(newAiMessage);

      updatedSession = {
        ...session,
        situationTitle: chatResult.situationTitle || session.situationTitle,
        messages: currentMessages,
      };
      onUpdateSession(updatedSession);

      // Voice playback if enabled
      if (profile.voiceEnabled && profile.autoSpeakAI) {
        setActiveAudioMessageId(newAiMessageId);
        speakText(newAiMessage.content, session.level, () => {
          setActiveAudioMessageId(null);
        });
      }
    } catch (err) {
      console.error('Error in chat exchange:', err);
    } finally {
      setIsEvaluating(false);
      setIsAiReplying(false);
    }
  };

  // Microphone toggle
  const handleToggleMic = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      setMicStatusText('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Голосовой ввод не поддерживается браузером. Пожалуйста, печатайте текст.');
      return;
    }

    stopSpeaking();
    setMicStatusText('Слушаю вас... Говорите по-английски');
    setIsRecording(true);

    const started = startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setMicStatusText('');
          setIsRecording(false);
        }
      },
      (err) => {
        setMicStatusText(err);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (!started) {
      setIsRecording(false);
    }
  };

  const handlePlayAudio = (msgId: string, content: string) => {
    if (activeAudioMessageId === msgId && isSpeaking()) {
      stopSpeaking();
      setActiveAudioMessageId(null);
      return;
    }
    setActiveAudioMessageId(msgId);
    speakText(content, session.level, () => {
      setActiveAudioMessageId(null);
    });
  };

  // Helpful idea hints based on situation
  const sampleHints = [
    'Yes, that sounds great! Could I get that with sugar, please?',
    'Could you please recommend something you like best?',
    'I would love to, but I have to catch my flight soon.',
    'Excuse me, could you tell me how to get to the museum?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-slate-50 border-x border-slate-200">
      {/* Scenario Header Banner */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
            💬
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm truncate font-display">
                {session.situationTitle || 'Разговор на английском'}
              </span>
              <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 text-[11px] font-bold text-indigo-700 shrink-0">
                {session.level}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Режим: {session.mode === 'gentle' ? '🌸 Мягкий' : session.mode === 'normal' ? '⚖️ Обычный' : '🎓 Учитель'}
            </p>
          </div>
        </div>

        {/* Action: Finish Conversation */}
        <button
          id="btn-finish-conversation"
          onClick={onFinishConversation}
          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <StopCircle className="h-4 w-4 text-rose-600" />
          <span>Закончить разговор</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {session.messages.map((msg) => {
          const isAi = msg.role === 'ai';
          const isPlayingThis = activeAudioMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                  isAi
                    ? 'bg-white border border-slate-200 text-slate-900'
                    : 'bg-indigo-600 text-white rounded-br-xs'
                }`}
              >
                {/* Message Header for AI */}
                {isAi && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 font-display">Alex (AI Friend)</span>
                    </div>
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.content)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        isPlayingThis
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                      }`}
                      title="Прослушать произношение"
                    >
                      <Volume2 className={`h-4 w-4 ${isPlayingThis ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                )}

                {/* English Content */}
                <p className={`text-base sm:text-lg leading-relaxed ${isAi ? 'text-slate-800' : 'text-white'}`}>
                  {msg.content}
                </p>
              </div>

              {/* Real-time Pedagogical Evaluation Card (for user message) */}
              {!isAi && msg.evaluation && (
                <div className="max-w-[90%] sm:max-w-[80%] w-full">
                  <EvaluationBadge evaluation={msg.evaluation} mode={session.mode} />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing / Thinking Indicator */}
        {isAiReplying && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Alex печатает ответ</span>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Mic Status Banner when active */}
      {isRecording && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2 shrink-0 animate-pulse">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>{micStatusText || 'Слушаю вас... Говорите по-английски'}</span>
          <button
            onClick={handleToggleMic}
            className="ml-2 text-xs text-rose-700 underline font-bold"
          >
            Остановить
          </button>
        </div>
      )}

      {/* Idea Hints Dropdown for Mom */}
      {showIdeas && (
        <div className="bg-indigo-50/90 border-t border-indigo-200 p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-indigo-600" />
              <span>Не знаете, что ответить? Выберите вариант:</span>
            </span>
            <button
              onClick={() => setShowIdeas(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleHints.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(hint);
                  setShowIdeas(false);
                  inputRef.current?.focus();
                }}
                className="text-xs bg-white text-slate-800 hover:border-indigo-400 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors text-left"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-end gap-2">
          {/* Help Idea Button */}
          <button
            id="btn-chat-ideas"
            type="button"
            onClick={() => setShowIdeas(!showIdeas)}
            title="Подсказать варианты ответа"
            className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors shrink-0 cursor-pointer"
          >
            <Lightbulb className="h-5 w-5" />
          </button>

          {/* Large Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              id="input-chat-message"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Напишите ответ по-английски..."
              className="w-full resize-none max-h-32 min-h-[48px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Voice Input Button */}
          <button
            id="btn-chat-mic"
            type="button"
            onClick={handleToggleMic}
            title={isRecording ? 'Остановить запись' : 'Сказать голосом в микрофон'}
            className={`p-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-4 ring-rose-200 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Send Button */}
          <button
            id="btn-chat-send"
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isAiReplying}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-200 transition-all shrink-0 cursor-pointer"
            title="Отправить сообщение"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
