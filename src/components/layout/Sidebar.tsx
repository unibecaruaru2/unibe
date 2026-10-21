import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare, 
  Award, 
  Settings, 
  GraduationCap, 
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath = 'dashboard', 
  onNavigate,
  collapsed = false,
  onToggleCollapse
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'attendance', label: 'Chamada de Sábado', icon: CalendarDays, badge: '4 Aulas' },
    { id: 'students', label: 'Alunos & Matrículas', icon: Users },
    { id: 'f10-academic', label: 'Ingestão F10 / Acadêmico', icon: FileSpreadsheet, badge: 'ERP' },
    { id: 'whatsapp', label: 'WhatsApp & Contatos', icon: MessageSquare },
    { id: 'certificates', label: 'Certificação Oficial', icon: Award },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-[#0B192C] text-slate-300 flex flex-col h-screen select-none border-r border-slate-800/80 shrink-0 transition-all duration-300 ease-in-out ${
        collapsed 
          ? 'hidden lg:flex lg:sticky lg:top-0 lg:w-[72px] lg:z-30' 
          : 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl lg:sticky lg:top-0 lg:z-30 lg:shadow-none'
      }`}
    >
      {/* Brand Header + Collapse Toggle Button */}
      <div className={`p-4 flex items-center border-b border-slate-800/60 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-wider text-white flex items-center gap-1.5 font-sans leading-none">
                UNIBE
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-slate-400 truncate mt-1">
                Treinamento Social
              </span>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button in Header */}
        {!collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Recolher barra lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 group text-left relative cursor-pointer ${
                collapsed 
                  ? 'justify-center py-3 px-0' 
                  : 'gap-3 px-3 py-2.5'
              } ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} 
              />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
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

      {/* Bottom Footer: Operator Profile & Collapsed Toggle Button */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs ring-1 ring-white/10 shrink-0">
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

        {/* Expand Button when collapsed */}
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden"
            title="Expandir menu"
          />
        )}
      </div>

      {/* Dedicated Expand/Collapse bar at the very bottom */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/70">
        <button
          onClick={onToggleCollapse}
          className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer`}
          title={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-400" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-medium">Recolher menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
