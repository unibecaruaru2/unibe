import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Copy, Check, ExternalLink, ShieldAlert, AlertTriangle, UserX, HeartHandshake } from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  matricula: MatriculaAcademicaF10 | null;
  defaultMode?: 'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS';
}

export const F10WhatsAppModal: React.FC<F10WhatsAppModalProps> = ({
  isOpen,
  onClose,
  matricula,
  defaultMode
}) => {
  const [activeTemplate, setActiveTemplate] = useState<'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS'>('COBRANCA');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!matricula) return;

    // Define template inicial baseado no quadrante ou no defaultMode
    if (defaultMode) {
      setActiveTemplate(defaultMode);
    } else if (matricula.quadranteRisco === 'Q1_OVERDUE_ATTENDING') {
      setActiveTemplate('COBRANCA');
    } else if (matricula.quadranteRisco === 'Q2_ABSENT_CHURN') {
      setActiveTemplate('RESGATE_PEDAGOGICO');
    } else if (matricula.quadranteRisco === 'Q3_WAITING_CANCEL') {
      setActiveTemplate('RETENCAO');
    } else {
      setActiveTemplate('BOAS_VINDAS');
    }
  }, [matricula, defaultMode]);

  useEffect(() => {
    if (!matricula) return;

    const turmasStr = matricula.turmasCanonicas.join(' e ') || matricula.turmas.map(t => t.codigoTurma).join(' e ');
    const linkF10 = matricula.linkPagamentoF10 ? `\n\n📌 *Link Seguro da Fatura/Parcela F10:*\n${matricula.linkPagamentoF10}` : '';

    let template = '';

    switch (activeTemplate) {
      case 'COBRANCA':
        // Template A: Inadimplente Frequente (Discreto e Facilitador)
        template = `Olá! Tudo bem? Vimos que ${matricula.alunoNome} está participando das aulas na turma *${turmasStr}* na UNIBE.\n\nPara facilitar o fechamento do mês e manter o acesso regular, segue o link seguro para regularizar a parcela em aberto:${linkF10}\n\nQualquer dúvida sobre a fatura ou comprovante, estamos à inteira disposição!`;
        break;

      case 'RESGATE_PEDAGOGICO':
        // Template B: Risco de Abandono (Faltoso Recorrente)
        template = `Olá! Sentimos a falta de ${matricula.alunoNome} nas últimas aulas da turma *${turmasStr}* na UNIBE.\n\nAconteceu algum imprevisto? Queremos agendar uma reposição gratuita de conteúdo para que ele(a) não perca o ritmo da turma.\n\nPodemos conversar sobre o melhor dia para a reposição?`;
        break;

      case 'RETENCAO':
        // Template C: Aguardando Cancelamento (Retenção / Negociação)
        template = `Olá! Recebemos a manifestação referente à matrícula de ${matricula.alunoNome} na UNIBE.\n\nAntes de formalizarmos qualquer baixa, gostaríamos de entender o motivo e propor uma solução (mudança de turno, trancamento temporário por 30 dias ou revisão de parcela).\n\nVamos agendar uma conversa rápida hoje para não interromper a trajetória acadêmica?`;
        break;

      case 'BOAS_VINDAS':
      default:
        template = `Olá, ${matricula.alunoNome}! Tudo bem?\n\nConfirmamos com sucesso a sua matrícula na UNIBE na turma *${turmasStr}*.\n\nSeja muito bem-vindo(a)! Qualquer dúvida sobre horários e material, estamos à disposição por aqui.`;
        break;
    }

    setMessage(template);
    setCopied(false);
  }, [matricula, activeTemplate]);

  if (!isOpen || !matricula) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const cleanDigits = matricula.whatsappUrl.split('wa.me/')[1] || '';
    const finalUrl = `https://wa.me/${cleanDigits}?text=${encoded}`;
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Disparador WhatsApp Estratégico
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {matricula.alunoNome} • {matricula.telefonePrincipal}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seletor de Templates Dinâmicos */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
          {[
            { id: 'COBRANCA', label: 'Cobrança c/ Link F10', icon: ShieldAlert, color: 'text-rose-600' },
            { id: 'RESGATE_PEDAGOGICO', label: 'Resgate / Reposição', icon: AlertTriangle, color: 'text-amber-600' },
            { id: 'RETENCAO', label: 'Retenção / Cancelamento', icon: UserX, color: 'text-purple-600' },
            { id: 'BOAS_VINDAS', label: 'Boas-Vindas Padrão', icon: HeartHandshake, color: 'text-blue-600' }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTemplate === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTemplate(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : t.color}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Texto da Mensagem Contextualizada:
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed font-sans"
          />

          {matricula.linkPagamentoF10 && (
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-300 truncate max-w-[280px]">
                Fatura F10: {matricula.linkPagamentoF10}
              </span>
              <a
                href={matricula.linkPagamentoF10}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Abrir F10</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparar WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
