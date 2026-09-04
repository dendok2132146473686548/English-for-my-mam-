/**
 * Top navigation bar with level, mode, and view switcher
 */
import React from 'react';
import type { EnglishLevel, FeedbackMode } from '../types.ts';
import { MessageSquare, BarChart3, Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'chat' | 'progress';
  onNavigate: (view: 'home' | 'chat' | 'progress') => void;
  level: EnglishLevel;
  mode: FeedbackMode;
  onSelectLevel: (lvl: EnglishLevel) => void;
  onSelectMode: (mode: FeedbackMode) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  level,
  onSelectLevel,
  voiceEnabled,
  onToggleVoice,
  hasActiveSession,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0">
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo & Brand or Back button in Chat */}
          <div className="flex items-center gap-2">
            {currentView === 'chat' && (
              <button
                id="nav-back-to-home-btn"
                onClick={() => onNavigate('home')}
                className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-700 active:bg-slate-200 transition-colors md:hidden"
                aria-label="Вернуться на главную"
                title="На главную"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            <button
              id="nav-brand-btn"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 font-display">
                    English Friend
                  </span>
                  <span className="hidden sm:inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    AI собеседник
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Для приятной практики разговора</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-btn-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Главная
            </button>

            <button
              id="nav-btn-chat"
              onClick={() => onNavigate('chat')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Разговор</span>
              {hasActiveSession && currentView !== 'chat' && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Есть активный разговор" />
              )}
            </button>

            <button
              id="nav-btn-progress"
              onClick={() => onNavigate('progress')}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'progress'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Прогресс</span>
            </button>
          </nav>

          {/* Quick Settings: Level & Voice */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Level Selector */}
            <div className="relative">
              <select
                id="select-navbar-level"
                value={level}
                onChange={(e) => onSelectLevel(e.target.value as EnglishLevel)}
                aria-label="Уровень английского"
                className="appearance-none cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2 sm:px-2.5 py-1.5 pr-6 sm:pr-7 text-xs font-bold text-indigo-700 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Voice Toggle */}
            <button
              id="btn-navbar-voice"
              onClick={onToggleVoice}
              title={voiceEnabled ? 'Озвучка AI включена' : 'Озвучка AI выключена'}
              className={`p-2 rounded-xl border transition-colors ${
                voiceEnabled
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'border-slate-200 bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

