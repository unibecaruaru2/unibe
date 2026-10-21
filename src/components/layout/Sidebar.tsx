import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare, 
  Award, 
  Settings, 
  GraduationCap, 
  Sparkles,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath = 'dashboard', 
  onNavigate,
  collapsed = false 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'attendance', label: 'Chamada de Sábado', icon: CalendarDays, badge: '4 Sábados' },
    { id: 'students', label: 'Alunos & Matrículas', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp & Contatos', icon: MessageSquare },
    { id: 'certificates', label: 'Certificação Oficial', icon: Award },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-[#0B192C] text-slate-300 flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none border-r border-slate-800/80 ${
        collapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5 font-sans">
              UNIBE
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                PRO
              </span>
            </span>
            <span className="text-xs text-slate-400 truncate">
              Treinamento Social
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Principal
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left relative cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} 
              />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Motivational Card & User Pill */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e213b] border border-slate-800/90 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              Ciclo de 4 Aulas
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Programa social com certificação condicionada a 100% de assiduidade.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Carga: <strong>16 horas</strong></span>
            <span className="text-blue-400 font-semibold">100% Presença</span>
          </div>
        </div>
      )}

      {/* Operator Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs ring-1 ring-white/10 shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                Coordenação Social
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                admin@unibe.edu.br
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
