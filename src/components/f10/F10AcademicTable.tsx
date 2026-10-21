import React from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  CreditCard, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10AcademicTableProps {
  matriculas: MatriculaAcademicaF10[];
  onOpenWhatsApp: (matricula: MatriculaAcademicaF10) => void;
}

export const F10AcademicTable: React.FC<F10AcademicTableProps> = ({
  matriculas,
  onOpenWhatsApp
}) => {
  if (matriculas.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-12 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Nenhuma matrícula encontrada
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tente ajustar os termos de busca ou carregue um novo arquivo PDF do ERP F10 acima.
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
              <th className="py-3.5 px-4">Aluno & Contrato</th>
              <th className="py-3.5 px-4">Contato & Bairro</th>
              <th className="py-3.5 px-4">Turma(s) & Instrutor</th>
              <th className="py-3.5 px-4">Data Matrícula</th>
              <th className="py-3.5 px-4">Regime Financeiro</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {matriculas.map((mat) => {
              const isQuitado = mat.regime === 'QUITADO';

              return (
                <tr 
                  key={mat.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Aluno & Contrato */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {mat.alunoNome}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          Contrato #{mat.contrato}
                        </span>
                        {mat.idade && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {mat.idade} anos {mat.sexo ? `(${mat.sexo})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contato & Bairro */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{mat.telefonePrincipal}</span>
                      </div>
                      {mat.bairro && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{mat.bairro}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Turma(s) & Instrutores */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {mat.turmas.map((t, idx) => (
                        <div 
                          key={`${mat.id}-turma-${idx}`}
                          className="inline-flex flex-col bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] max-w-fit"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                            <span>{t.codigoTurma}</span>
                            {t.turno && (
                              <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                {t.turno}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-3">
                            Instrutor: {t.professor}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Data Matrícula */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mat.dataMatricula}</span>
                      </div>
                      {mat.dataInicio && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-5">
                          Início: {mat.dataInicio}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Regime Financeiro */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      {isQuitado ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Quitado ({mat.origemContratoF10})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 font-semibold text-[11px] w-fit">
                          <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Carnê Mensalista</span>
                        </div>
                      )}

                      {/* Detalhes de parcelas e valores */}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1">
                        {isQuitado ? (
                          <span>Integral: {mat.valorTotal || 'Pago'}</span>
                        ) : (
                          <span>
                            {mat.parcelasAberto ? `${mat.parcelasAberto}x parc.` : ''} 
                            {mat.valorAberto ? ` (${mat.valorAberto} em aberto)` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Botão de WhatsApp com mensagem contextual */}
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(mat)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        title="Enviar mensagem contextualizada no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Link F10 Oficial */}
                      {mat.linkPagamentoF10 && (
                        <a
                          href={mat.linkPagamentoF10}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Abrir fatura / contrato no F10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
