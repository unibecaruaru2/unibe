import React from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  CalendarCheck2, 
  Smartphone, 
  AlertTriangle, 
  ShieldAlert, 
  UserMinus, 
  CheckCircle2,
  ArrowUpRight,
  Sparkles
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
    <div className="space-y-3">
      {/* Grade de 4 Índices Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* ÍNDICE 1: Risco Global de Evasão */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'Q2_ABSENT_CHURN' ? 'TODOS' : 'Q2_ABSENT_CHURN')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#0B1524] ${
            activeFilter === 'Q2_ABSENT_CHURN'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10'
              : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
              Índice de Evasão (Churn)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
              indices.classificacaoEvasao === 'CRÍTICO'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                : indices.classificacaoEvasao === 'ATENÇÃO'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
            }`}>
              {indices.classificacaoEvasao}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {indices.taxaRiscoEvasao}%
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">da base em perigo</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {indices.distribuicaoQuadrantes.q2Churn} alunos
              </span>
              <div className="text-[10px] text-slate-400">≥3 faltas sem dívida</div>
            </div>
          </div>

          {/* Barra de Progresso Visual de Evasão */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                indices.taxaRiscoEvasao > 35 ? 'bg-rose-500' : indices.taxaRiscoEvasao > 18 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(indices.taxaRiscoEvasao, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{indices.distribuicaoQuadrantes.q3Cancel} em cancelamento</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 hover:underline">Ver detalhes →</span>
          </div>
        </div>

        {/* ÍNDICE 2: Recuperação Financeira */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'INADIMPLENTES_TODOS' ? 'TODOS' : 'INADIMPLENTES_TODOS')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#0B1524] ${
            activeFilter === 'INADIMPLENTES_TODOS' || activeFilter === 'Q1_OVERDUE_ATTENDING' || activeFilter === 'Q1_OVERDUE_ABSENT'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10'
              : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-rose-500" />
              Inadimplência Geral
            </span>
            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
              {indices.distribuicaoQuadrantes.q1Attending + indices.distribuicaoQuadrantes.q1Absent} inadimplentes
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {formatBRL(totalVencido)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(indices.capitalEmAulaRecuperavel)}
              </span>
              <div className="text-[10px] text-slate-400">em aula presencial</div>
            </div>
          </div>

          {/* Subdivisão em 2 colunas: Em Aula vs Ausente */}
          <div className="mt-3 grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFilter('Q1_OVERDUE_ATTENDING');
              }}
              className="text-left p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <CalendarCheck2 className="w-3 h-3 text-emerald-600" />
                {indices.distribuicaoQuadrantes.q1Attending} em aula
              </div>
              <div className="text-slate-400 text-[9px]">Fácil recuperação</div>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFilter('Q1_OVERDUE_ABSENT');
              }}
              className="text-left p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <UserMinus className="w-3 h-3 text-rose-600" />
                {indices.distribuicaoQuadrantes.q1Absent} ausentes
              </div>
              <div className="text-slate-400 text-[9px]">{formatBRL(indices.capitalAusenteRiscoPerda)}</div>
            </button>
          </div>
        </div>

        {/* ÍNDICE 3: Assiduidade & No-Show */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'Q4_REGULAR' ? 'TODOS' : 'Q4_REGULAR')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#0B1524] ${
            activeFilter === 'Q4_REGULAR'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
              : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-500" />
              Assiduidade Presencial
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              {indices.taxaAssiduidade}% assíduos
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {indices.distribuicaoQuadrantes.q4Regular}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">alunos saudáveis</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {indices.alunosNuncaCompareceram} No-Show
              </span>
              <div className="text-[10px] text-slate-400">sem presença reg.</div>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(indices.taxaAssiduidade, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Taxa No-Show: <strong>{indices.taxaNoShow}%</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Regularidade Alta</span>
          </div>
        </div>

        {/* ÍNDICE 4: Engajamento Digital & Retenção */}
        <div 
          onClick={() => onSelectFilter(activeFilter === 'SEM_APP' ? 'TODOS' : 'SEM_APP')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#0B1524] ${
            activeFilter === 'SEM_APP'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
              : 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              Engajamento App Smart
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
              {indices.taxaAdocaoApp}% adesão
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {indices.totalSemApp}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">sem aplicativo</span>
            </div>
            <div className="text-right">
              {indices.capitalQuitadoRiscoEstorno > 0 && (
                <div>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {formatBRL(indices.capitalQuitadoRiscoEstorno)}
                  </span>
                  <div className="text-[10px] text-slate-400">risco de estorno</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(indices.taxaAdocaoApp, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Quitados: <strong>{indices.distribuicaoRegime.quitadosPercent}%</strong> | Carnê: <strong>{indices.distribuicaoRegime.carnePercent}%</strong></span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Fosso digital</span>
          </div>
        </div>

      </div>
    </div>
  );
};