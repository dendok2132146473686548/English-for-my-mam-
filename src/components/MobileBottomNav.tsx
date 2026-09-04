import React from 'react';
import { Home, MessageSquare, BarChart3 } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'home' | 'chat' | 'progress';
  onNavigate: (view: 'home' | 'chat' | 'progress') => void;
  hasActiveSession: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  hasActiveSession,
}) => {
  // During active conversation, keep the full screen available for chat input
  if (currentView === 'chat') {
    return null;
  }

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Нижняя навигация"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg"
    >
      <div className="grid grid-cols-3 h-14 max-w-md mx-auto">
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'home'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[11px] leading-none">Главная</span>
        </button>

        {/* Chat / Conversation */}
        <button
          id="mobile-nav-chat"
          onClick={() => onNavigate('chat')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            currentView === 'chat'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            {hasActiveSession && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className="text-[11px] leading-none">Разговор</span>
        </button>

        {/* Progress */}
        <button
          id="mobile-nav-progress"
          onClick={() => onNavigate('progress')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'progress'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-[11px] leading-none">Прогресс</span>
        </button>
      </div>
    </nav>
  );
};
