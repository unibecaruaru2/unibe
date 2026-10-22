import React from 'react';
import { 
  Search, 
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
  ArrowUpDown,
  TableProperties,
  Copy,
  Check,
  MessageSquare,
  SlidersHorizontal,
  RotateCcw
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

  const filterTabs: Array<{ 
    id: FilterQuadrantOption; 
    label: string; 
    count: number; 
    dotColor: string;
  }> = [
    { id: 'TODOS', label: 'Todos', count: countsByQuadrant.todos, dotColor: 'bg-slate-400' },
    { id: 'INADIMPLENTES_TODOS', label: 'Inadimplentes (Geral)', count: countsByQuadrant.inadimplentesGeral, dotColor: 'bg-rose-500' },
    { id: 'Q1_OVERDUE_ATTENDING', label: 'Em Aula (Recuperação)', count: countsByQuadrant.q1Attending, dotColor: 'bg-emerald-500' },
    { id: 'Q1_OVERDUE_ABSENT', label: 'Ausente (Risco Duplo)', count: countsByQuadrant.q1Absent, dotColor: 'bg-rose-600' },
    { id: 'Q2_ABSENT_CHURN', label: 'Risco Evasão (≥3 Faltas)', count: countsByQuadrant.q2Churn, dotColor: 'bg-amber-500' },
    { id: 'Q3_WAITING_CANCEL', label: 'Fila de Retenção', count: countsByQuadrant.q3Cancel, dotColor: 'bg-purple-500' },
    { id: 'Q4_REGULAR', label: 'Regular / Saudável', count: countsByQuadrant.q4Regular, dotColor: 'bg-emerald-600' },
    { id: 'SEM_APP', label: 'Sem App', count: countsByQuadrant.semApp, dotColor: 'bg-blue-500' }
  ];

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
      
      {/* 1. Barra de Navegação de Modos e Ações Globais */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Segmented Control de Abas */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('TABELA')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'TABELA'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Gestão de Alunos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {filteredCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Análise & Índices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RELATORIO_WHATSAPP')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'RELATORIO_WHATSAPP'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Relatórios WhatsApp</span>
          </button>
        </div>

        {/* Ação Primária Contextual: Copiar Relatório desta Aba */}
        {onQuickCopyWhatsApp && activeTab === 'TABELA' && (
          <button
            type="button"
            onClick={onQuickCopyWhatsApp}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              isQuickCopiedWhatsApp
                ? 'bg-emerald-600 text-white border-emerald-600 scale-102'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/80'
            }`}
            title="Copiar relatório estruturado dos alunos filtrados para WhatsApp"
          >
            {isQuickCopiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isQuickCopiedWhatsApp ? 'Copiado para WhatsApp!' : 'Copiar Relatório da Aba'}</span>
          </button>
        )}

      </div>

      {/* 2. Barra de Busca e Filtros Dropdown Compactos (visível na Tabela) */}
      {activeTab === 'TABELA' && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar aluno, telefone, contrato ou bairro..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filtros Dropdowns Enxutos */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Turma */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="TODOS">Todas as Turmas</option>
                {availableTurmas.map(t => (
                  <option key={`turma-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Regime Financeiro */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <select
                value={selectedRegime}
                onChange={(e) => setSelectedRegime(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="TODOS">Todos os Regimes</option>
                <option value="QUITADO">À Vista / SAV</option>
                <option value="CARNE_MENSALISTA">Carnê Mensalista</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="DEBITO_DESC">Maior Débito</option>
                <option value="FALTAS_DESC">Mais Faltas</option>
                <option value="NOME_ASC">Nome (A – Z)</option>
                <option value="RECENTE_DESC">Mais Recentes</option>
              </select>
            </div>

            {/* Densidade */}
            <button
              type="button"
              onClick={() => setDensity(density === 'confortavel' ? 'compacto' : 'confortavel')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
              title="Alternar densidade das linhas da tabela"
            >
              {density === 'confortavel' ? 'Compacto' : 'Confortável'}
            </button>

            {/* Limpar Filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-2 py-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-medium ml-1"
                title="Limpar todos os filtros aplicados"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <span className="text-[11px] text-slate-400 font-medium ml-auto pl-2">
              Mostrando <strong className="text-slate-700 dark:text-slate-200">{filteredCount}</strong> de {totalCount}
            </span>
          </div>

        </div>
      )}

      {/* 3. Chips de Status / Categorias de Risco (Régua Limpa) */}
      {activeTab === 'TABELA' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 custom-scrollbar">
          {filterTabs.map((tab) => {
            const isSelected = selectedQuadrant === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedQuadrant(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${tab.dotColor} shrink-0`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isSelected 
                    ? 'bg-white/20 dark:bg-black/10' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};
