import React from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  UserX, 
  Phone, 
  Smartphone,
  Calendar,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10AcademicTableProps {
  matriculas: MatriculaAcademicaF10[];
  onOpenWhatsApp: (matricula: MatriculaAcademicaF10, mode?: 'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS') => void;
  onOpenRetentionModal: (matricula: MatriculaAcademicaF10) => void;
}

export const F10AcademicTable: React.FC<F10AcademicTableProps> = ({
  matriculas,
  onOpenWhatsApp,
  onOpenRetentionModal
}) => {
  if (matriculas.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-12 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Nenhuma matrícula encontrada no filtro selecionado
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tente alterar o quadrante de risco ou limpar a busca textual acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Aluno & Turma</th>
              <th className="py-3.5 px-4">Classificação de Risco</th>
              <th className="py-3.5 px-4">Frequência & Faltas</th>
              <th className="py-3.5 px-4">Situação Financeira</th>
              <th className="py-3.5 px-4">App Smart</th>
              <th className="py-3.5 px-4 text-right">Ações Operacionais</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {matriculas.map((mat) => {
              const isQ1 = mat.quadranteRisco === 'Q1_OVERDUE_ATTENDING';
              const isQ2 = mat.quadranteRisco === 'Q2_ABSENT_CHURN';
              const isQ3 = mat.quadranteRisco === 'Q3_WAITING_CANCEL';
              const isQ4 = mat.quadranteRisco === 'Q4_REGULAR';

              return (
                <tr 
                  key={mat.id}
                  className={`transition-colors group ${
                    isQ3 && mat.isAguardandoQuitado
                      ? 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50'
                      : isQ1
                      ? 'hover:bg-rose-50/20 dark:hover:bg-rose-950/20'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Aluno & Turma Canônica */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 transition-colors">
                          {mat.alunoNome}
                        </span>
                        {mat.statusContrato === 'Aguardando' && (
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                            Aguardando
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          #{mat.contrato}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{mat.telefonePrincipal}</span>
                        </div>
                      </div>

                      {/* Turmas Canônicas Unificadas */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {mat.turmasCanonicas.map((tc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {tc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Classificação de Risco (Matriz de Quadrantes) */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      {isQ1 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200/80 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Q1: Inadimplente Frequente</span>
                        </span>
                      )}

                      {isQ2 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-200/80 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Q2: Risco Crítico de Evasão</span>
                        </span>
                      )}

                      {isQ3 && (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200/80 w-fit">
                            <UserX className="w-3.5 h-3.5 text-purple-600" />
                            <span>Q3: Fila de Retenção</span>
                          </span>
                          {mat.isAguardandoQuitado && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 pl-1">
                              ⚠️ Contrato Quitado (Risco Estorno!)
                            </span>
                          )}
                        </div>
                      )}

                      {isQ4 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200/80 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Q4: Regular / Saudável</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Frequência & Faltas */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Faltas:
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          mat.faltasTotais >= 3
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {mat.faltasTotais}
                        </span>
                        {mat.isNoShow && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                            No-Show
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        {mat.ultimaPresenca ? (
                          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>Última presença: {mat.ultimaPresenca}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Nunca compareceu</span>
                        )}

                        {mat.ultimaFalta && (
                          <div className="text-rose-600/80">
                            Última falta: {mat.ultimaFalta}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Situação Financeira */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-0.5">
                      {mat.valorVencidoNum > 0 ? (
                        <div>
                          <div className="text-xs font-black text-rose-600 dark:text-rose-400">
                            Vencido: {mat.valorVencido}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {mat.parcelasVencidas} parcela(s) em atraso
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-600">
                          Em Dia ({mat.regime === 'QUITADO' ? 'Quitado' : 'Sem atrasos'})
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Total Contrato: {mat.valorTotal || 'R$ 0,00'}
                      </div>
                    </div>
                  </td>

                  {/* App Smart */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span className={mat.smartAluno.includes('Cadastrado') ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                          Aluno: {mat.smartAluno}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">
                        Titular: {mat.smartTitular}
                      </div>
                    </div>
                  </td>

                  {/* Ações Operacionais */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Gatilho Q1: WhatsApp Cobrança com Link F10 */}
                      {isQ1 && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'COBRANCA')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                          title="Cobrança amigável com link da fatura F10"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Cobrar F10</span>
                        </button>
                      )}

                      {/* Gatilho Q2: Resgate Pedagógico / Reposição */}
                      {isQ2 && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'RESGATE_PEDAGOGICO')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                          title="Resgate pedagógico para reposição de aulas"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Reposição</span>
                        </button>
                      )}

                      {/* Gatilho Q3: Tratativa de Retenção */}
                      {isQ3 && (
                        <button
                          type="button"
                          onClick={() => onOpenRetentionModal(mat)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                          title="Abrir tratativa de retenção e proposta"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Retenção</span>
                        </button>
                      )}

                      {/* Regular / Outros */}
                      {isQ4 && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'BOAS_VINDAS')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      {/* Link F10 Oficial */}
                      {mat.linkPagamentoF10 && (
                        <a
                          href={mat.linkPagamentoF10}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          title="Abrir fatura oficial do F10"
                        >
                          <span>Ver F10</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
