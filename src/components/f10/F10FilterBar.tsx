import React from 'react';
import { Search, Filter, X, GraduationCap, DollarSign } from 'lucide-react';
import { RegimeFinanceiro } from '../../types/f10';

interface F10FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTurmaOrProf: string;
  setSelectedTurmaOrProf: (val: string) => void;
  selectedRegime: 'TODOS' | RegimeFinanceiro;
  setSelectedRegime: (val: 'TODOS' | RegimeFinanceiro) => void;
  availableOptions: {
    turmas: string[];
    professores: string[];
  };
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export const F10FilterBar: React.FC<F10FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTurmaOrProf,
  setSelectedTurmaOrProf,
  selectedRegime,
  setSelectedRegime,
  availableOptions,
  totalCount,
  filteredCount,
  onClearFilters
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedTurmaOrProf !== 'TODOS' || selectedRegime !== 'TODOS';

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdowns de Filtro */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filtro por Turma ou Professor */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTurmaOrProf}
            onChange={(e) => setSelectedTurmaOrProf(e.target.value)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="TODOS">Todas as Turmas / Instrutores</option>
            <optgroup label="Instrutores">
              {availableOptions.professores.map(p => (
                <option key={`prof-${p}`} value={`prof:${p}`}>{p}</option>
              ))}
            </optgroup>
            <optgroup label="Turmas">
              {availableOptions.turmas.map(t => (
                <option key={`turma-${t}`} value={`turma:${t}`}>{t}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Filtro por Regime Financeiro */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
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

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
            title="Limpar todos os filtros"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}

        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">
          {filteredCount} de {totalCount} alunos
        </span>
      </div>
    </div>
  );
};
