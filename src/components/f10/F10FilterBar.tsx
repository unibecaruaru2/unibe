import React from 'react';
import { Search, Filter, X, GraduationCap, AlertTriangle, ShieldAlert, UserX, CheckCircle, Smartphone, UserMinus, CalendarCheck2 } from 'lucide-react';
import { QuadranteRisco, RegimeFinanceiro } from '../../types/f10';

export type FilterQuadrantOption = 'TODOS' | 'INADIMPLENTES_TODOS' | QuadranteRisco | 'SEM_APP' | 'NUNCA_COMPARECEU';

interface F10FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTurma: string;
  setSelectedTurma: (val: string) => void;
  selectedQuadrant: FilterQuadrantOption;
  setSelectedQuadrant: (val: FilterQuadrantOption) => void;
  selectedRegime: 'TODOS' | RegimeFinanceiro;
  setSelectedRegime: (val: 'TODOS' | RegimeFinanceiro) => void;
  availableTurmas: string[];
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
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
  availableTurmas,
  totalCount,
  filteredCount,
  onClearFilters
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedTurma !== 'TODOS' || selectedQuadrant !== 'TODOS' || selectedRegime !== 'TODOS';

  const quadrantPills: Array<{ id: FilterQuadrantOption; label: string; icon: any; color: string }> = [
    { id: 'TODOS', label: 'Todos', icon: Filter, color: 'text-slate-600' },
    { id: 'INADIMPLENTES_TODOS', label: '🚨 Todos Inadimplentes (Geral)', icon: ShieldAlert, color: 'text-rose-600' },
    { id: 'Q1_OVERDUE_ATTENDING', label: 'Inadimplente em Aula', icon: CalendarCheck2, color: 'text-emerald-600' },
    { id: 'Q1_OVERDUE_ABSENT', label: 'Inadimplente Ausente', icon: UserMinus, color: 'text-rose-600' },
    { id: 'NUNCA_COMPARECEU', label: '⚠️ Nunca Compareceu (Zero Presenças)', icon: AlertTriangle, color: 'text-amber-600' },
    { id: 'Q2_ABSENT_CHURN', label: 'Risco Evasão (≥3 Faltas)', icon: AlertTriangle, color: 'text-amber-600' },
    { id: 'Q3_WAITING_CANCEL', label: 'Aguardando Cancelamento', icon: UserX, color: 'text-purple-600' },
    { id: 'Q4_REGULAR', label: 'Regular / Saudável', icon: CheckCircle, color: 'text-emerald-600' },
    { id: 'SEM_APP', label: 'Sem App Ativo', icon: Smartphone, color: 'text-blue-600' }
  ];

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
      {/* Linha Superior: Busca Textual + Seletor de Turmas Canônicas + Regime */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Busca Textual */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do aluno, bairro ou contrato..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns de Filtro */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Turmas Canônicas (Unificação PM.7/PM.707 e Mirim 7/707) */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTurma}
              onChange={(e) => setSelectedTurma(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
            >
              <option value="TODOS">Todas as Turmas (Unificadas)</option>
              {availableTurmas.map(t => (
                <option key={`turma-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Regime Financeiro */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value as any)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="TODOS">Todos os Regimes</option>
              <option value="QUITADO">Apenas Quitados (À Vista / SAV)</option>
              <option value="CARNE_MENSALISTA">Apenas Carnê (Mensalistas)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          <span className="text-xs text-slate-400 font-medium ml-1">
            {filteredCount} de {totalCount} alunos
          </span>
        </div>
      </div>

      {/* Linha Inferior: Pílulas Rápidas da Matriz de Quadrantes & Inadimplência */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filtros Rápidos:
        </span>
        {quadrantPills.map(p => {
          const Icon = p.icon;
          const isSelected = selectedQuadrant === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedQuadrant(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
