import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, RefreshCw, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10RetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matricula: MatriculaAcademicaF10 | null;
  onSaveFeedback?: (contrato: string, actionType: string, notes: string) => void;
}

export const F10RetentionModal: React.FC<F10RetentionModalProps> = ({
  isOpen,
  onClose,
  matricula,
  onSaveFeedback
}) => {
  const [selectedOffer, setSelectedOffer] = useState<string>('troca_turma');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !matricula) return null;

  const handleSave = () => {
    if (onSaveFeedback) {
      onSaveFeedback(matricula.contrato, selectedOffer, notes);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleSendRetentionWhatsApp = () => {
    const template = `Olá! Tudo bem? Recebemos a manifestação referente à matrícula de ${matricula.alunoNome} na UNIBE.\n\nAntes de formalizarmos qualquer baixa, gostaríamos de entender o motivo e propor uma solução personalizada (como mudança de turno, trancamento temporário de 30 dias ou revisão da parcela).\n\nPodemos agendar uma conversa rápida hoje para alinharmos?`;
    const cleanDigits = matricula.whatsappUrl.split('wa.me/')[1] || '';
    window.open(`https://wa.me/${cleanDigits}?text=${encodeURIComponent(template)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Plano de Retenção & Tratativa de Cancelamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {matricula.alunoNome} • Contrato #{matricula.contrato}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de Contrato Quitado */}
        {matricula.isAguardandoQuitado && (
          <div className="p-3 mx-4 mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <strong>Atenção: Contrato Quitado À Vista ({matricula.valorTotal})!</strong>
              <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 mt-0.5">
                O cancelamento deste aluno acarreta risco imediato de estorno financeiro. Prioridade máxima de retenção!
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Proposta de Retenção a ser Negociada:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'troca_turma', label: 'Mudança de Turno / Turma' },
                { id: 'trancamento', label: 'Pausa / Trancamento (30d)' },
                { id: 'bolsa_desconto', label: 'Revisão / Bolsa Temporária' },
                { id: 'reposicao_vip', label: 'Aulas de Reforço VIP' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOffer(opt.id)}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    selectedOffer === opt.id
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Registro de Motivo e Feedback do Aluno:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Aluno relatou choque de horário com novo emprego; aceitou avaliar turma da tarde..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Disparar Proposta no WhatsApp
              </span>
              <span className="text-[11px] text-slate-400">
                Abre mensagem amigável com a coordenação de retenção
              </span>
            </div>
            <button
              type="button"
              onClick={handleSendRetentionWhatsApp}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Retenção</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : null}
            <span>{isSaved ? 'Registrado com Sucesso!' : 'Salvar Tratativa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
