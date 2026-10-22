import React from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  UserCheck, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { MatriculaAcademicaF10, ExecutiveIndices } from '../../types/f10';
import { calculateExecutiveIndices } from '../../utils/f10Analytics';
import { FilterQuadrantOption } from './F10FilterBar';

interface F10ExecutiveIndicesProps {
  matriculas: MatriculaAcademicaF10[];
  activeFilter: FilterQuadrantOption;
  onSelectFilter: (filter: FilterQuadrantOption) => void;
}

export const F10ExecutiveIndices: React.FC<F10ExecutiveIndicesProps> = ({
  matriculas,
  activeFilter,
  onSelectFilter
}) => {
  const indices: ExecutiveIndices = calculateExecutiveIndices(matriculas);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };

  const totalVencido = indices.capitalEmAulaRecuperavel + indices.capitalAusenteRiscoPerda;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      
      {/* 1. RISCO DE EVASÃO (CHURN) */}
      <div 
        onClick={() => onSelectFilter(activeFilter === 'Q2_ABSENT_CHURN' ? 'TODOS' : 'Q2_ABSENT_CHURN')}
        className={`group p-4 rounded-xl border bg-white dark:bg-[#0F172A] transition-all cursor-pointer relative ${
          activeFilter === 'Q2_ABSENT_CHURN'
            ? 'border-amber-500/80 ring-1 ring-amber-500/30 bg-amber-500/[0.03]'
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            Risco de Evasão
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            indices.classificacaoEvasao === 'CRÍTICO'
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60'
              : indices.classificacaoEvasao === 'ATENÇÃO'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60'
              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60'
          }`}>
            {indices.classificacaoEvasao}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {indices.taxaRiscoEvasao}%
            </span>
            <span className="text-xs text-slate-400">da base</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {indices.distribuicaoQuadrantes.q2Churn} alunos
            </span>
            <div className="text-[10px] text-slate-400">≥3 faltas sem dívida</div>
          </div>
        </div>

        {/* Barra de Risco */}
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${
              indices.taxaRiscoEvasao > 35 ? 'bg-rose-500' : indices.taxaRiscoEvasao > 18 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(indices.taxaRiscoEvasao, 100)}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{indices.distribuicaoQuadrantes.q3Cancel} em cancelamento</span>
          <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center text-[11px]">
            Filtrar <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. INADIMPLÊNCIA GERAL & RECUPERÁVEL */}
      <div 
        onClick={() => onSelectFilter(activeFilter === 'INADIMPLENTES_TODOS' ? 'TODOS' : 'INADIMPLENTES_TODOS')}
        className={`group p-4 rounded-xl border bg-white dark:bg-[#0F172A] transition-all cursor-pointer relative ${
          activeFilter === 'INADIMPLENTES_TODOS' || activeFilter === 'Q1_OVERDUE_ATTENDING' || activeFilter === 'Q1_OVERDUE_ABSENT'
            ? 'border-rose-500/80 ring-1 ring-rose-500/30 bg-rose-500/[0.03]'
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
            Inadimplência Geral
          </span>
          <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200/60 dark:border-rose-900/60">
            {indices.distribuicaoQuadrantes.q1Attending + indices.distribuicaoQuadrantes.q1Absent} débitos
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formatBRL(totalVencido)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatBRL(indices.capitalEmAulaRecuperavel)}
            </span>
            <div className="text-[10px] text-slate-400">em aula presencial</div>
          </div>
        </div>

        {/* Divisão Rápida: Em Aula vs Ausente */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(activeFilter === 'Q1_OVERDUE_ATTENDING' ? 'TODOS' : 'Q1_OVERDUE_ATTENDING');
            }}
            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
          >
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {indices.distribuicaoQuadrantes.q1Attending} em aula
            </div>
            <div className="text-[10px] text-slate-400">Fácil recuperação</div>
          </div>

          <div 
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(activeFilter === 'Q1_OVERDUE_ABSENT' ? 'TODOS' : 'Q1_OVERDUE_ABSENT');
            }}
            className="text-right hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
          >
            <div className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
              {formatBRL(indices.capitalAusenteRiscoPerda)}
            </div>
            <div className="text-[10px] text-slate-400">{indices.distribuicaoQuadrantes.q1Absent} ausentes (risco)</div>
          </div>
        </div>
      </div>

      {/* 3. ASSIDUIDADE PRESENCIAL */}
      <div 
        onClick={() => onSelectFilter(activeFilter === 'Q4_REGULAR' ? 'TODOS' : 'Q4_REGULAR')}
        className={`group p-4 rounded-xl border bg-white dark:bg-[#0F172A] transition-all cursor-pointer relative ${
          activeFilter === 'Q4_REGULAR'
            ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-emerald-500/[0.03]'
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            Assiduidade Presencial
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/60">
            {indices.taxaAssiduidade}% assíduos
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {indices.distribuicaoQuadrantes.q4Regular}
            </span>
            <span className="text-xs text-slate-400">alunos saudáveis</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {indices.alunosNuncaCompareceram} No-Show
            </span>
            <div className="text-[10px] text-slate-400">sem presença reg.</div>
          </div>
        </div>

        {/* Barra de Assiduidade */}
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(indices.taxaAssiduidade, 100)}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Taxa No-Show: {indices.taxaNoShow}%</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Regularidade Alta</span>
        </div>
      </div>

      {/* 4. ADOÇÃO APP SMART ALUNO */}
      <div 
        onClick={() => onSelectFilter(activeFilter === 'SEM_APP' ? 'TODOS' : 'SEM_APP')}
        className={`group p-4 rounded-xl border bg-white dark:bg-[#0F172A] transition-all cursor-pointer relative ${
          activeFilter === 'SEM_APP'
            ? 'border-blue-500/80 ring-1 ring-blue-500/30 bg-blue-500/[0.03]'
            : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            Engajamento App Smart
          </span>
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/60">
            {indices.taxaAdocaoApp}% adesão
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {indices.totalSemApp}
            </span>
            <span className="text-xs text-slate-400">sem aplicativo</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono">
              {formatBRL(indices.capitalQuitadoRiscoEstorno)}
            </span>
            <div className="text-[10px] text-slate-400">risco de estorno</div>
          </div>
        </div>

        {/* Indicadores complementares */}
        <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Quitados: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{indices.distribuicaoRegime.quitadosPercent}%</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400">Carnê: </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{indices.distribuicaoRegime.carnePercent}%</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{indices.totalSemApp === 0 ? 'Base 100% conectada' : `${indices.totalSemApp} pendentes de ativação`}</span>
          <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center text-[11px]">
            Filtrar <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>

    </div>
  );
};
