import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  GraduationCap, 
  Smartphone, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  UserX, 
  Save
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10StudentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  matricula: MatriculaAcademicaF10 | null;
  onOpenWhatsApp: (mat: MatriculaAcademicaF10, mode?: 'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS') => void;
  onSaveRetention: (contrato: string, actionType: string, notes: string) => Promise<void>;
}

export const F10StudentDrawer: React.FC<F10StudentDrawerProps> = ({
  isOpen,
  onClose,
  matricula,
  onOpenWhatsApp,
  onSaveRetention
}) => {
  if (!isOpen || !matricula) return null;

  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'FINANCEIRO' | 'PEDAGOGICO' | 'TRATATIVAS'>('VISAO_GERAL');
  const [selectedTratativa, setSelectedTratativa] = useState<string>(matricula.tratativaTipo || 'CONTATO_REALIZADO');
  const [tratativaNotes, setTratativaNotes] = useState<string>(matricula.tratativaNotas || '');
  const [isSavingTratativa, setIsSavingTratativa] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveNotes = async () => {
    setIsSavingTratativa(true);
    try {
      await onSaveRetention(matricula.contrato, selectedTratativa, tratativaNotes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSavingTratativa(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 2)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'UN';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-[#0F172A] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-3 duration-200">
          
          {/* Header do Drawer */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                {getInitials(matricula.alunoNome)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {matricula.alunoNome}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[11px] font-medium">
                    Contrato #{matricula.contrato}
                  </span>
                  <span>•</span>
                  <span>{matricula.statusContrato}</span>
                  {matricula.bairro && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {matricula.bairro}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ações Rápidas de Contato */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenWhatsApp(matricula, 'COBRANCA')}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold transition-colors flex items-center gap-1.5 border border-rose-200/80 dark:border-rose-900/60 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Cobrança F10</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenWhatsApp(matricula, 'RESGATE_PEDAGOGICO')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold transition-colors flex items-center gap-1.5 border border-amber-200/80 dark:border-amber-900/60 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Resgate de Aula</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenWhatsApp(matricula, 'RETENCAO')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold transition-colors flex items-center gap-1.5 border border-purple-200/80 dark:border-purple-900/60 cursor-pointer shadow-2xs"
              >
                <UserX className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Retenção</span>
              </button>
            </div>

            {matricula.linkPagamentoF10 && (
              <a
                href={matricula.linkPagamentoF10}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                <span>Fatura F10</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Abas Internas do Dossiê */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('VISAO_GERAL')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'VISAO_GERAL'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FINANCEIRO')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'FINANCEIRO'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Financeiro ({matricula.valorVencidoNum > 0 ? 'Débito' : 'Em Dia'})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PEDAGOGICO')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'PEDAGOGICO'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Presença ({matricula.faltasTotais} faltas)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TRATATIVAS')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'TRATATIVAS'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Tratativas & Histórico
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'VISAO_GERAL' && (
              <div className="space-y-4">
                {/* Status de Risco Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Classificação de Risco Atual
                  </span>
                  <div className="flex items-center gap-2">
                    {matricula.quadranteRisco === 'Q1_OVERDUE_ATTENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200/80 dark:border-emerald-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Inadimplente em Aula (Presença Recente)
                      </span>
                    )}
                    {matricula.quadranteRisco === 'Q1_OVERDUE_ABSENT' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200/80 dark:border-rose-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Inadimplente Ausente (Risco Duplo)
                      </span>
                    )}
                    {matricula.quadranteRisco === 'Q2_ABSENT_CHURN' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold text-xs border border-amber-200/80 dark:border-amber-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Risco Crítico de Evasão (≥3 Faltas)
                      </span>
                    )}
                    {matricula.quadranteRisco === 'Q3_WAITING_CANCEL' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200/80 dark:border-purple-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Fila de Retenção (Aguardando Cancelamento)
                      </span>
                    )}
                    {matricula.quadranteRisco === 'Q4_REGULAR' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Aluno Regular & Saudável
                      </span>
                    )}
                  </div>
                </div>

                {/* Canais de Contato */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Canais de Contato
                  </span>
                  
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Telefone Principal:</span>
                    <a 
                      href={`tel:${matricula.telefonePrincipal.replace(/\D/g, '')}`} 
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {matricula.telefonePrincipal}
                    </a>
                  </div>

                  {matricula.telefoneSecundario && (
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Telefone Secundário:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {matricula.telefoneSecundario}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Bairro:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {matricula.bairro || 'Não informado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-slate-500">Data de Matrícula:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {matricula.dataMatricula || 'N/D'}
                    </span>
                  </div>
                </div>

                {/* Status do App Smart */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Acesso ao Aplicativo Smart F10
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Smart Aluno:</span>
                    <span className={`font-semibold ${matricula.smartAluno.includes('Cadastrado') || matricula.smartAluno.includes('Acesso') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {matricula.smartAluno}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Smart Titular (Responsável):</span>
                    <span className={`font-semibold ${matricula.smartTitular.includes('Cadastrado') || matricula.smartTitular.includes('Acesso') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {matricula.smartTitular}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'FINANCEIRO' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Regime</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {matricula.regime === 'QUITADO' ? 'À Vista / SAV (Quitado)' : 'Carnê Mensalista'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60">
                    <span className="text-[10px] text-rose-600 font-semibold uppercase">Valor Vencido</span>
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                      {matricula.valorVencido || 'R$ 0,00'}
                    </div>
                    {matricula.parcelasVencidas > 0 && (
                      <span className="text-[10px] text-rose-500 font-medium">
                        {matricula.parcelasVencidas} parcela(s) em atraso
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Total do Contrato</span>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                      {matricula.valorTotal || 'R$ 0,00'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Valor Pago</span>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      {matricula.valorPago || 'R$ 0,00'}
                    </div>
                  </div>
                </div>

                {matricula.linkPagamentoF10 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                        Link de Cobrança Online F10
                      </span>
                      <span className="text-[11px] text-slate-500">
                        O aluno ou responsável pode pagar via Pix ou Cartão diretamente.
                      </span>
                    </div>
                    <a
                      href={matricula.linkPagamentoF10}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Abrir Fatura</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'PEDAGOGICO' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Histórico de Assiduidade
                  </span>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total de Faltas:</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      matricula.faltasTotais >= 3
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {matricula.faltasTotais} faltas
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Última Presença em Sala:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {matricula.ultimaPresenca || 'Nunca compareceu (No-Show)'}
                    </span>
                  </div>

                  {matricula.ultimaFalta && (
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Última Falta Registrada:</span>
                      <span className="font-semibold text-slate-500">
                        {matricula.ultimaFalta}
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                      Turmas Vinculadas:
                    </span>
                    <div className="space-y-1.5">
                      {matricula.turmas.map((t, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.codigoCanonico}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Código ERP: {t.codigoTurma} • Instrutor: {t.professor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'TRATATIVAS' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Registrar Tratativa & Histórico
                  </span>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Tipo de Ação Realizada:
                    </label>
                    <select
                      value={selectedTratativa}
                      onChange={(e) => setSelectedTratativa(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="COBRANCA_WHATSAPP">Cobrança enviada via WhatsApp</option>
                      <option value="LIGACAO_EFETUADA">Ligação telefônica efetuada</option>
                      <option value="PROMESSA_PAGAMENTO">Promessa de pagamento registrada</option>
                      <option value="RESGATE_AGENDADO">Reposição de aula agendada</option>
                      <option value="PROPOSTA_DESCONTO">Proposta de desconto oferecida</option>
                      <option value="CANCELAMENTO_CONFIRMADO">Cancelamento definitivo confirmado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Notas do Atendimento:
                    </label>
                    <textarea
                      rows={4}
                      value={tratativaNotes}
                      onChange={(e) => setTratativaNotes(e.target.value)}
                      placeholder="Ex: Conversei com a mãe do aluno, ela pediu prorrogação da parcela até o dia 28/10 devido a problema pessoal. Prometeu que o aluno vem na aula do sábado..."
                      className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {saveSuccess && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Salvo com sucesso!
                      </span>
                    )}
                    {!saveSuccess && <span></span>}

                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSavingTratativa}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer ml-auto"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingTratativa ? 'Salvando...' : 'Salvar Tratativa'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
