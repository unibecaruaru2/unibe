import React from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Smartphone, 
  Calendar, 
  GraduationCap, 
  ChevronRight,
  UserX,
  CreditCard
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10AcademicTableProps {
  matriculas: MatriculaAcademicaF10[];
  selectedStudentIds: string[];
  onToggleSelectStudent: (id: string) => void;
  onToggleSelectAll: () => void;
  density: 'confortavel' | 'compacto';
  onOpenStudentDrawer: (matricula: MatriculaAcademicaF10) => void;
  onOpenWhatsApp: (matricula: MatriculaAcademicaF10, mode?: 'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS') => void;
  onOpenRetentionModal: (matricula: MatriculaAcademicaF10) => void;
}

export const F10AcademicTable: React.FC<F10AcademicTableProps> = ({
  matriculas,
  selectedStudentIds,
  onToggleSelectStudent,
  onToggleSelectAll,
  density,
  onOpenStudentDrawer,
  onOpenWhatsApp,
  onOpenRetentionModal
}) => {
  if (matriculas.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 border border-slate-200/90 dark:border-slate-800/80 shadow-xs text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Nenhuma matrícula encontrada no filtro selecionado
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tente alterar o filtro de categoria, a turma selecionada ou o termo de busca na barra acima.
        </p>
      </div>
    );
  }

  const isAllSelected = matriculas.length > 0 && selectedStudentIds.length === matriculas.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 2)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'AL';
  };

  const isCompact = density === 'compacto';

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  title="Selecionar todos os alunos exibidos"
                />
              </th>
              <th className="py-3 px-4">Aluno & Turma</th>
              <th className="py-3 px-4">Classificação de Risco</th>
              <th className="py-3 px-4">Frequência & Presença</th>
              <th className="py-3 px-4">Situação Financeira</th>
              <th className="py-3 px-4">App Smart</th>
              <th className="py-3 px-4 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {matriculas.map((mat) => {
              const isSelected = selectedStudentIds.includes(mat.id);
              const isQ1Attending = mat.quadranteRisco === 'Q1_OVERDUE_ATTENDING';
              const isQ1Absent = mat.quadranteRisco === 'Q1_OVERDUE_ABSENT';
              const isQ2 = mat.quadranteRisco === 'Q2_ABSENT_CHURN';
              const isQ3 = mat.quadranteRisco === 'Q3_WAITING_CANCEL';
              const isQ4 = mat.quadranteRisco === 'Q4_REGULAR';

              return (
                <tr 
                  key={mat.id}
                  onClick={() => onOpenStudentDrawer(mat)}
                  className={`transition-colors cursor-pointer group select-none ${
                    isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-950/25'
                      : isQ3 && mat.isAguardandoQuitado
                      ? 'bg-purple-50/20 dark:bg-purple-950/15 hover:bg-purple-50/30'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Checkbox de Seleção */}
                  <td 
                    className="py-3 px-3.5 text-center align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectStudent(mat.id)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Aluno & Turma */}
                  <td className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top`}>
                    <div className="flex items-start gap-3">
                      {/* Avatar Inicial */}
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700/80 group-hover:border-slate-400 transition-colors">
                        {getInitials(mat.alunoNome)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {mat.alunoNome}
                          </span>
                          {mat.statusContrato === 'Aguardando' && (
                            <span className="text-[10px] bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold px-1.5 py-0.2 rounded border border-purple-200 dark:border-purple-800/60">
                              Aguardando
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded">
                            #{mat.contrato}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {mat.telefonePrincipal}
                          </span>
                          {mat.bairro && (
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              • {mat.bairro}
                            </span>
                          )}
                        </div>

                        {/* Turmas Canônicas */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {mat.turmasCanonicas.map((tc, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                              {tc}
                            </span>
                          ))}
                        </div>

                        {mat.tratativaTipo && (
                          <div className="mt-1 text-[10px] text-purple-700 dark:text-purple-300 font-medium bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.2 rounded w-fit border border-purple-200/60 dark:border-purple-800/60">
                            Tratativa: {mat.tratativaTipo.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Classificação de Risco */}
                  <td className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top`}>
                    <div className="flex flex-col gap-1">
                      {isQ1Attending && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-200/70 dark:border-emerald-800/60 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Inadimplente em Aula</span>
                        </span>
                      )}

                      {isQ1Absent && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium text-[11px] border border-rose-200/70 dark:border-rose-800/60 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Inadimplente Ausente</span>
                        </span>
                      )}

                      {isQ2 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium text-[11px] border border-amber-200/70 dark:border-amber-800/60 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Risco Evasão (≥3 Faltas)</span>
                        </span>
                      )}

                      {isQ3 && (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium text-[11px] border border-purple-200/70 dark:border-purple-800/60 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>Fila de Retenção</span>
                          </span>
                          {mat.isAguardandoQuitado && (
                            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 pl-1">
                              Quitado À Vista (Risco Estorno)
                            </span>
                          )}
                        </div>
                      )}

                      {isQ4 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] border border-slate-200 dark:border-slate-700/80 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Regular / Saudável</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Frequência & Presença */}
                  <td className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top`}>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Faltas:</span>
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-xs ${
                          mat.faltasTotais >= 3
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {mat.faltasTotais}
                        </span>
                        {mat.isNoShow && (
                          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-900/60">
                            No-Show
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500 dark:text-slate-400 space-y-0.5 text-[11px]">
                        {mat.ultimaPresenca ? (
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Presença: {mat.ultimaPresenca}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Nunca compareceu</span>
                        )}

                        {mat.ultimaFalta && (
                          <div className="text-slate-400">
                            Falta: {mat.ultimaFalta}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Situação Financeira */}
                  <td className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top`}>
                    <div className="flex flex-col gap-0.5">
                      {mat.valorVencidoNum > 0 ? (
                        <div>
                          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                            {mat.valorVencido}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {mat.parcelasVencidas} parcela(s) em atraso
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Em Dia ({mat.regime === 'QUITADO' ? 'Quitado' : 'Sem atrasos'})
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Total: {mat.valorTotal || 'R$ 0,00'}
                      </div>
                    </div>
                  </td>

                  {/* App Smart */}
                  <td className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top`}>
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-slate-400" />
                        <span className={mat.smartAluno.includes('Cadastrado') || mat.smartAluno.includes('Acesso') ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}>
                          {mat.smartAluno}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        Titular: {mat.smartTitular}
                      </div>
                    </div>
                  </td>

                  {/* Ações Rápidas */}
                  <td 
                    className={`${isCompact ? 'py-2.5 px-4' : 'py-3.5 px-4'} align-top text-right`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Cobrança WhatsApp F10 */}
                      {(isQ1Attending || isQ1Absent) && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'COBRANCA')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200/80 dark:border-rose-900/60 shadow-2xs"
                          title="Enviar cobrança via WhatsApp com fatura F10"
                        >
                          <MessageSquare className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>Cobrar F10</span>
                        </button>
                      )}

                      {/* Resgate Pedagógico */}
                      {isQ2 && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'RESGATE_PEDAGOGICO')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-200/80 dark:border-amber-900/60 shadow-2xs"
                          title="Enviar mensagem pedagógica para reposição de faltas"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Reposição</span>
                        </button>
                      )}

                      {/* Retenção */}
                      {isQ3 && (
                        <button
                          type="button"
                          onClick={() => onOpenRetentionModal(mat)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-purple-200/80 dark:border-purple-900/60 shadow-2xs"
                          title="Abrir tratativa de retenção do aluno"
                        >
                          <UserX className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span>Retenção</span>
                        </button>
                      )}

                      {/* Regular */}
                      {isQ4 && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(mat, 'BOAS_VINDAS')}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      {/* Links Secundários: Fatura F10 e Ficha */}
                      <div className="flex items-center gap-2 mt-0.5">
                        {mat.linkPagamentoF10 && (
                          <a
                            href={mat.linkPagamentoF10}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            title="Abrir fatura oficial do ERP F10"
                          >
                            <span>Fatura F10</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenStudentDrawer(mat)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium flex items-center gap-0.5 cursor-pointer"
                          title="Ver dossiê completo 360 do aluno"
                        >
                          <span>Ficha</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
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
