import React from 'react';
import { 
  Search, 
  Bell, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  MessageCircle,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenEnrollmentModal: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenEnrollmentModal,
  unreadNotificationsCount = 3
}) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por aluno, matrícula, turma ou responsável..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner/5"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Header Actions & Info */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* WhatsApp Service Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Disparador WhatsApp: <strong>Ativo</strong></span>
        </div>

        {/* Current Date Badge */}
        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs font-medium px-3 py-1.5 bg-slate-100/70 rounded-xl border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Sábado Letivo em <strong>3 dias</strong> (24/10)</span>
        </div>

        {/* Notifications */}
        <button 
          className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          title="Notificações do Sistema"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Action Button: Nova Matrícula */}
        <button
          onClick={onOpenEnrollmentModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Matrícula</span>
        </button>

        {/* User Mini Profile dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Usuário Coordenador"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200"
          />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
        </div>
      </div>
    </header>
  );
};
