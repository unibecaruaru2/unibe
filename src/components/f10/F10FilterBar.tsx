import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  GraduationCap, 
  AlertTriangle, 
  ShieldAlert, 
  UserX, 
  CheckCircle, 
  Smartphone, 
  UserMinus, 
  CalendarCheck2, 
  BarChart2, 
  ListFilter,
  ArrowUpDown,
  SlidersHorizontal,
  TableProperties,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { QuadranteRisco, RegimeFinanceiro } from '../../types/f10';

export type FilterQuadrantOption = 'TODOS' | 'INADIMPLENTES_TODOS' | QuadranteRisco | 'SEM_APP';
export type SortOption = 'DEBITO_DESC' | 'FALTAS_DESC' | 'NOME_ASC' | 'RECENTE_DESC';
export type ViewTab = 'TABELA' | 'ANALYTICS' | 'RELATORIO_WHATSAPP';

interface F10FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTurma: string;
  setSelectedTurma: (val: string) => void;
  selectedQuadrant: FilterQuadrantOption;
  setSelectedQuadrant: (val: FilterQuadrantOption) => void;
  selectedRegime: 'TODOS' | RegimeFinanceiro;
  setSelectedRegime: (val: 'TODOS' | RegimeFinanceiro) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  density: 'confortavel' | 'compacto';
  setDensity: (val: 'confortavel' | 'compacto') => void;
  activeTab: ViewTab;
  setActiveTab: (val: ViewTab) => void;
  availableTurmas: string[];
  totalCount: number;
  filteredCount: number;
  countsByQuadrant: {
    todos: number;
    inadimplentesGeral: number;
    q1Attending: number;
    q1Absent: number;
    q2Churn: number;
    q3Cancel: number;
    q4Regular: number;
    semApp: number;
  };
  onClearFilters: () => void;
  onQuickCopyWhatsApp?: () => void;
  isQuickCopiedWhatsApp?: boolean;
}

export const F10FilterBar: React.FC<F10FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTurma,
  setSelectedTurma,
  selectedQuadrant,
  setSelectedQuadrant,
  selectedRegime,
  setSelectedRegime,
  sortBy,
  setSortBy,
  density,
  setDensity,
  activeTab,
  setActiveTab,
  availableTurmas,
  totalCount,
  filteredCount,
  countsByQuadrant,
  onClearFilters,
  onQuickCopyWhatsApp,
  isQuickCopiedWhatsApp
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedTurma !== 'TODOS' || selectedQuadrant !== 'TODOS' || selectedRegime !== 'TODOS';

  const filterTabs: Array<{ id: FilterQuadrantOption; label: string; count: number; icon: any }> = [
    { id: 'TODOS', label: 'Todos', count: countsByQuadrant.todos, icon: Filter },
    { id: 'INADIMPLENTES_TODOS', label: 'Inadimplentes (Geral)', count: countsByQuadrant.inadimplentesGeral, icon: ShieldAlert },
    { id: 'Q1_OVERDUE_ATTENDING', label: 'Em Aula (Recuperação)', count: countsByQuadrant.q1Attending, icon: CalendarCheck2 },
    { id: 'Q1_OVERDUE_ABSENT', label: 'Ausente (Risco Duplo)', count: countsByQuadrant.q1Absent, icon: UserMinus },
    { id: 'Q2_ABSENT_CHURN', label: 'Risco Evasão (≥3 Faltas)', count: countsByQuadrant.q2Churn, icon: AlertTriangle },
    { id: 'Q3_WAITING_CANCEL', label: 'Fila de Retenção', count: countsByQuadrant.q3Cancel, icon: UserX },
    { id: 'Q4_REGULAR', label: 'Regular / Saudável', count: countsByQuadrant.q4Regular, icon: CheckCircle },
    { id: 'SEM_APP', label: 'Sem App', count: countsByQuadrant.semApp, icon: Smartphone }
  ];

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
      
      {/* Linha 1: Alternador de Modo (Tabela vs Analytics) + Busca + Seletores + Ordenação */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Toggle de Visualização: Tabela vs Analytics */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('TABELA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'TABELA'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Gestão de Alunos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Análise & Índices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RELATORIO_WHATSAPP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'RELATORIO_WHATSAPP'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
            title="Aba de Relatórios para copiar e colar no WhatsApp dos seus superiores"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Copiar Relatório WhatsApp</span>
          </button>
        </div>

        {/* Busca Textual */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, bairro, telefone ou contrato..."
            className="w-full pl-9 pr-7 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros Dropdowns & Controles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Turma Unificada */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
            >
              <option value="TODOS">Todas as Turmas</option>
              {availableTurmas.map(t => (
                <option key={`turma-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Seletor de Regime */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value as any)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
            >
              <option value="TODOS">Todos Regimes</option>
              <option value="QUITADO">À Vista / SAV</option>
              <option value="CARNE_MENSALISTA">Carnê Mensalista</option>
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
            >
              <option value="DEBITO_DESC">Maior Débito</option>
              <option value="FALTAS_DESC">Mais Faltas</option>
              <option value="NOME_ASC">Nome (A - Z)</option>
              <option value="RECENTE_DESC">Mais Recentes</option>
            </select>
          </div>

          {/* Densidade da Tabela */}
          <button
            type="button"
            onClick={() => setDensity(density === 'confortavel' ? 'compacto' : 'confortavel')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            title={density === 'confortavel' ? 'Alternar para modo compacto' : 'Alternar para modo confortável'}
          >
            {density === 'confortavel' ? 'Compacto' : 'Confortável'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Limpar todos os filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          <span className="text-xs text-slate-400 font-semibold ml-1">
            {filteredCount} de {totalCount}
          </span>
        </div>
      </div>

      {/* Linha 2: Pílulas de Filtro por Categoria com Contador em Tempo Real */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedQuadrant === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedQuadrant(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}

        {onQuickCopyWhatsApp && (
          <button
            type="button"
            onClick={onQuickCopyWhatsApp}
            className={`sm:ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
              isQuickCopiedWhatsApp
                ? 'bg-emerald-600 text-white border-emerald-600 scale-102'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            }`}
            title="Copiar relatório formatado da aba ativa para colar no WhatsApp dos superiores"
          >
            {isQuickCopiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isQuickCopiedWhatsApp ? 'Copiado para WhatsApp!' : 'Copiar Relatório desta Aba'}</span>
          </button>
        )}
      </div>

    </div>
  );
};