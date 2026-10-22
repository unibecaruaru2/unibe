import React from 'react';
import { 
  GraduationCap, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  CalendarCheck2, 
  UserMinus, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';
import { calculateExecutiveIndices, calculateF10Kpis } from '../../utils/f10Analytics';
import { FilterQuadrantOption } from './F10FilterBar';

interface F10AnalyticsViewProps {
  matriculas: MatriculaAcademicaF10[];
  onSelectTurma: (turma: string) => void;
  onSelectFilter: (filter: FilterQuadrantOption) => void;
  onGoToStudentsTable: () => void;
}

export const F10AnalyticsView: React.FC<F10AnalyticsViewProps> = ({
  matriculas,
  onSelectTurma,
  onSelectFilter,
  onGoToStudentsTable
}) => {
  const kpis = calculateF10Kpis(matriculas);
  const indices = calculateExecutiveIndices(matriculas);

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-4">
      {/* 1. Visão Geral Financeira & Balanço de Contratos */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Raio-X de Contratos & Exposição Financeira F10
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Consolidação de contratos do ERP F10, receita realizada e débitos vencidos
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {kpis.totalMatriculas} Matrículas Totais
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Contratado
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {formatBRL(kpis.receitaTotalContratada)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Valor global das matrículas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Receita Realizada (Paga)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatBRL(kpis.receitaTotalPaga)}
            </div>
            <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
              {kpis.receitaTotalContratada > 0 ? Math.round((kpis.receitaTotalPaga / kpis.receitaTotalContratada) * 100) : 0}% liquidado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              A Vencer (Futuro)
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {formatBRL(kpis.receitaTotalAberto)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Parcelas em dia a vencer</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Inadimplência Vencida
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatBRL(kpis.receitaTotalVencida)}
            </div>
            <span className="text-[10px] text-rose-600/80 mt-0.5 block">
              {kpis.totalAlunosInadimplentes} alunos com atraso
            </span>
          </div>
        </div>
      </div>

      {/* 2. Comparativo Estratégico por Turma Canônica */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Desempenho & Risco por Turma Canônica
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unificação das turmas do F10 (PM.7 / PM.707 e Mirim) com taxa de frequência e débitos
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {indices.turmas.length} turmas mapeadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Turma Unificada</th>
                <th className="py-2.5 px-3 text-center">Matrículas</th>
                <th className="py-2.5 px-3">Assiduidade</th>
                <th className="py-2.5 px-3">Inadimplência</th>
                <th className="py-2.5 px-3 text-right">Valor Vencido</th>
                <th className="py-2.5 px-3 text-center">Média Faltas</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {indices.turmas.map((item) => (
                <tr 
                  key={item.turma}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => {
                    onSelectTurma(item.turma);
                    onGoToStudentsTable();
                  }}
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{item.turma}</span>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {item.totalAlunos}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${item.taxaPresenca}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        {item.taxaPresenca}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.taxaInadimplencia > 40
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60'
                        : item.taxaInadimplencia > 20
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.alunosInadimplentes} alunos ({item.taxaInadimplencia}%)
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                    {formatBRL(item.valorVencido)}
                  </td>

                  <td className="py-3 px-3 text-center font-medium text-slate-600 dark:text-slate-400 font-mono">
                    {item.mediaFaltas}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1 justify-end ml-auto cursor-pointer"
                    >
                      <span>Ver Alunos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Matriz de Decisão & Quadrantes de Risco Operacional */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Matriz de Decisão & Quadrantes de Risco
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Segmentação estratégica para priorizar cobranças, resgates pedagógicos e retenção de matrículas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Q1 Frequentando */}
          <div 
            onClick={() => {
              onSelectFilter('Q1_OVERDUE_ATTENDING');
              onGoToStudentsTable();
            }}
            className="p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                Q1: Inadimplente em Aula (Alto Potencial)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-200 font-mono">
                {indices.distribuicaoQuadrantes.q1Attending} alunos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Alunos com parcelas atrasadas, mas que <strong>continuam frequentando a escola</strong>. Excelente taxa de recuperação com abordagem presencial ou lembrete gentil via WhatsApp com link F10.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-900/40 text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                {formatBRL(indices.capitalEmAulaRecuperavel)} a recuperar
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                Cobrar no intervalo →
              </span>
            </div>
          </div>

          {/* Q1 Ausente */}
          <div 
            onClick={() => {
              onSelectFilter('Q1_OVERDUE_ABSENT');
              onGoToStudentsTable();
            }}
            className="p-4 rounded-xl border border-rose-200/70 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <UserMinus className="w-4 h-4 text-rose-600" />
                Q1: Inadimplente Ausente (Risco Duplo)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 font-mono">
                {indices.distribuicaoQuadrantes.q1Absent} alunos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Alunos com débito vencido e <strong>sem presença recente</strong> registrada. Risco crítico de abandono definitivo caso a escola não atue de imediato com renegociação e acolhimento.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-rose-100 dark:border-rose-900/40 text-xs">
              <span className="font-bold text-rose-700 dark:text-rose-300 font-mono">
                {formatBRL(indices.capitalAusenteRiscoPerda)} sob risco
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold group-hover:underline flex items-center gap-1">
                Cobrança de resgate →
              </span>
            </div>
          </div>

          {/* Q2 Risco de Evasão */}
          <div 
            onClick={() => {
              onSelectFilter('Q2_ABSENT_CHURN');
              onGoToStudentsTable();
            }}
            className="p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Q2: Risco Crítico de Evasão (Faltas ≥ 3)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-200 font-mono">
                {indices.distribuicaoQuadrantes.q2Churn} alunos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Alunos financeiramente em dia ou quitados, mas que acumularam <strong>3 ou mais faltas consecutivas</strong>. Exigem intervenção pedagógica com oferta de reposição para não desistirem do curso.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-100 dark:border-amber-900/40 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300">
                Pedagogia Ativa
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                Agendar reposições →
              </span>
            </div>
          </div>

          {/* Q3 Retenção */}
          <div 
            onClick={() => {
              onSelectFilter('Q3_WAITING_CANCEL');
              onGoToStudentsTable();
            }}
            className="p-4 rounded-xl border border-purple-200/70 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/20 hover:border-purple-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                Q3: Fila de Retenção (Cancelamentos)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-200 font-mono">
                {indices.distribuicaoQuadrantes.q3Cancel} alunos
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Alunos com status "Aguardando" no ERP F10. Contém{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-bold">{kpis.cancelamentosQuitadosRiscoEstorno} alunos com contrato quitado à vista</strong>{' '}
              que podem exigir devolução de valores se não forem retidos.
            </p>
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-900/40 text-xs">
              <span className="font-bold text-purple-700 dark:text-purple-300 font-mono">
                {formatBRL(indices.capitalQuitadoRiscoEstorno)} risco de estorno
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                Abrir retenções →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
