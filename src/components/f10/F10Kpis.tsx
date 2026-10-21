import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  TrendingDown, 
  Smartphone, 
  DollarSign, 
  UserX,
  ShieldAlert,
  Award
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';
import { calculateF10Kpis } from '../../utils/f10Analytics';

interface F10KpisProps {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia?: string;
  activeQuadrantFilter?: string;
  onSelectQuadrant?: (quadrant: string) => void;
}

export const F10Kpis: React.FC<F10KpisProps> = ({ 
  matriculas, 
  periodoReferencia,
  activeQuadrantFilter,
  onSelectQuadrant 
}) => {
  const kpis = calculateF10Kpis(matriculas);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1 - Receita Vencida Recuperável (Q1) */}
      <div 
        onClick={() => onSelectQuadrant && onSelectQuadrant(activeQuadrantFilter === 'Q1_OVERDUE_ATTENDING' ? 'TODOS' : 'Q1_OVERDUE_ATTENDING')}
        className={`bg-white dark:bg-[#0E1726] rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
          activeQuadrantFilter === 'Q1_OVERDUE_ATTENDING'
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
            : 'border-rose-200/80 dark:border-rose-950/60 hover:border-rose-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Receita Vencida Recuperável
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-rose-800 dark:text-rose-200 tracking-tight">
            {formatBRL(kpis.receitaVencidaFrequentando)}
          </div>
          <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 mt-1">
            Alunos em atraso que <strong>continuam frequentando</strong> as aulas
          </p>
        </div>
      </div>

      {/* KPI 2 - Risco Crítico de Evasão (Q2) */}
      <div 
        onClick={() => onSelectQuadrant && onSelectQuadrant(activeQuadrantFilter === 'Q2_ABSENT_CHURN' ? 'TODOS' : 'Q2_ABSENT_CHURN')}
        className={`bg-white dark:bg-[#0E1726] rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
          activeQuadrantFilter === 'Q2_ABSENT_CHURN'
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
            : 'border-amber-200/80 dark:border-amber-950/60 hover:border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Risco de Evasão (Churn)
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800 dark:text-amber-200 tracking-tight">
              {kpis.alunosRiscoEvasao} alunos
            </span>
            {kpis.alunosNoShow > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                {kpis.alunosNoShow} No-Show
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-1">
            Ativos com <strong>3 ou mais faltas acumuladas</strong>
          </p>
        </div>
      </div>

      {/* KPI 3 - Solicitações de Cancelamento (Q3) */}
      <div 
        onClick={() => onSelectQuadrant && onSelectQuadrant(activeQuadrantFilter === 'Q3_WAITING_CANCEL' ? 'TODOS' : 'Q3_WAITING_CANCEL')}
        className={`bg-white dark:bg-[#0E1726] rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
          activeQuadrantFilter === 'Q3_WAITING_CANCEL'
            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20 dark:bg-purple-950/20'
            : 'border-purple-200/80 dark:border-purple-950/60 hover:border-purple-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5" />
            Fila de Retenção
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-800 dark:text-purple-200 tracking-tight">
              {kpis.solicitacoesCancelamento}
            </span>
            {kpis.cancelamentosQuitadosRiscoEstorno > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-300" title="Alunos com contrato Quitado À Vista em risco de estorno!">
                ⚠️ {kpis.cancelamentosQuitadosRiscoEstorno} Quitados!
              </span>
            )}
          </div>
          <p className="text-[11px] text-purple-600/90 dark:text-purple-400/90 mt-1">
            Status "Aguardando" com intenção de cancelamento
          </p>
        </div>
      </div>

      {/* KPI 4 - Sem App Ativo (Fosso Digital) */}
      <div 
        onClick={() => onSelectQuadrant && onSelectQuadrant(activeQuadrantFilter === 'SEM_APP' ? 'TODOS' : 'SEM_APP')}
        className={`bg-white dark:bg-[#0E1726] rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
          activeQuadrantFilter === 'SEM_APP'
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            Sem App Smart Ativo
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.alunosSemApp}
            </span>
            <span className="text-xs text-slate-400">
              de {kpis.totalMatriculas}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Famílias sem aplicativo Smart Aluno/Titular
          </p>
        </div>
      </div>
    </div>
  );
};
