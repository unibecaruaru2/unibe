import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  matricula: MatriculaAcademicaF10 | null;
}

export const F10WhatsAppModal: React.FC<F10WhatsAppModalProps> = ({
  isOpen,
  onClose,
  matricula
}) => {
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!matricula) return;

    const isQuitado = matricula.regime === 'QUITADO';
    const turmasStr = matricula.turmas.map(t => `${t.codigoTurma} (Prof. ${t.professor})`).join(' e ');
    const linkF10 = matricula.linkPagamentoF10 ? `\n\n📌 *Link de Acesso ao Carnê/Parcelas F10:*\n${matricula.linkPagamentoF10}` : '';

    let template = '';
    if (isQuitado) {
      template = `Olá, ${matricula.alunoNome}! Tudo bem?\n\nConfirmamos com sucesso a sua matrícula na UNIBE no curso/turma *${turmasStr}*.\n\nIdentificamos que seu curso encontra-se *Quitado (À Vista)*, garantindo sua liberação imediata para certificado e histórico após a conclusão das atividades pedagógicas.\n\nSeja muito bem-vindo(a)! Qualquer dúvida estamos à disposição por aqui.`;
    } else {
      template = `Olá, ${matricula.alunoNome}! Tudo bem?\n\nConfirmamos com sucesso a sua matrícula na UNIBE no curso/turma *${turmasStr}*.\n\nPara acompanhar seus vencimentos e parcelas do carnê escolar, você pode acessar seu portal diretamente pelo link oficial do F10:${linkF10}\n\nFicamos à disposição para qualquer suporte pedagógico ou financeiro!`;
    }

    setMessage(template);
    setCopied(false);
  }, [matricula]);

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
                Mensagem WhatsApp Contextual
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

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Texto da Mensagem:
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
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
                Link F10: {matricula.linkPagamentoF10}
              </span>
              <a
                href={matricula.linkPagamentoF10}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Testar Link</span>
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
            <span>Abrir no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
