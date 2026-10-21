import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  User, 
  Calendar, 
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Shirt
} from 'lucide-react';
import { Student, WhatsAppTemplate, WhatsAppContactStatusType } from '../../types';
import { whatsappTemplates } from '../../data/mockData';
import { generateWhatsAppUrl, sanitizePhoneNumber } from '../../lib/social-training';
import { formatPhoneNumber } from '../../utils/dateUtils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStatus: (studentId: string, status: WhatsAppContactStatusType) => void;
  selectedSaturdayDate?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStatus,
  selectedSaturdayDate = '2026-10-24'
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('lembrete_sabado');
  const [messageBody, setMessageBody] = useState<string>('');
  const [currentContactStatus, setCurrentContactStatus] = useState<WhatsAppContactStatusType>('nao_contatado');
  const [copied, setCopied] = useState<boolean>(false);
  const [targetPhoneType, setTargetPhoneType] = useState<'guardian' | 'student'>('guardian');

  useEffect(() => {
    if (!student) return;

    setCurrentContactStatus(student.whatsappStatus);

    // Default to guardian phone if underage or guardian exists
    if (student.guardian) {
      setTargetPhoneType('guardian');
    } else {
      setTargetPhoneType('student');
    }

    // Determine lesson number for the selected Saturday
    let lessonNum = student.currentLesson;
    if (student.saturdays && student.saturdays.length > 0) {
      const idx = student.saturdays.indexOf(selectedSaturdayDate);
      if (idx !== -1) {
        lessonNum = (idx + 1) as 1 | 2 | 3 | 4;
      }
    }

    const tpl = whatsappTemplates.find(t => t.id === selectedTemplateId) || whatsappTemplates[0];
    const guardianName = student.guardian ? student.guardian.name : student.name;
    const formattedShift = student.shift === 'manha' ? 'Manhã (08h às 12h)' : 'Tarde (13h às 17h)';
    const dateFormatted = selectedSaturdayDate.split('-').reverse().join('/');
    const certCode = student.certificate?.code || 'CERT-UNIBE-PENDENTE';

    // Pre-fill with dynamic variables including Rua Silva Jardim, 99
    let replaced = tpl.text
      .replace(/{nome_responsavel}/g, guardianName)
      .replace(/{nome_aluno}/g, student.name)
      .replace(/{numero_aula}/g, `Aula ${lessonNum} de 4`)
      .replace(/{data_aula}/g, dateFormatted)
      .replace(/{turno}/g, formattedShift)
      .replace(/{local}/g, 'Rua Silva Jardim, 99')
      .replace(/{sabado_1}/g, student.saturdays?.[0]?.split('-').reverse().join('/') || '03/10/2026')
      .replace(/{sabado_2}/g, student.saturdays?.[1]?.split('-').reverse().join('/') || '10/10/2026')
      .replace(/{sabado_3}/g, student.saturdays?.[2]?.split('-').reverse().join('/') || '17/10/2026')
      .replace(/{sabado_4}/g, student.saturdays?.[3]?.split('-').reverse().join('/') || '24/10/2026')
      .replace(/{codigo_certificado}/g, certCode);

    setMessageBody(replaced);
  }, [student, selectedTemplateId, selectedSaturdayDate]);

  if (!isOpen || !student) return null;

  const currentPhone = targetPhoneType === 'guardian' && student.guardian 
    ? student.guardian.phone 
    : student.phone;

  const guardianOrStudentName = targetPhoneType === 'guardian' && student.guardian
    ? `${student.guardian.name} (${student.guardian.relationship})`
    : student.name;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    try {
      const url = generateWhatsAppUrl(currentPhone, messageBody);
      window.open(url, '_blank', 'noopener,noreferrer');
      onUpdateStatus(student.id, 'mensagem_enviada');
      setCurrentContactStatus('mensagem_enviada');
    } catch (err) {
      alert('Número de telefone inválido para o WhatsApp.');
    }
  };

  const handleStatusChange = (newStatus: WhatsAppContactStatusType) => {
    setCurrentContactStatus(newStatus);
    onUpdateStatus(student.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white">
                  Comunicação WhatsApp Oficial
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  wa.me Link
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Disparo com edição prévia para o Responsável ou Aluno
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          {/* Target Student and Guardian Info */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{student.name}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    {student.registrationNumber}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Destinatário: <strong className="text-slate-700 dark:text-slate-200">{guardianOrStudentName}</strong>
                </span>
              </div>
            </div>

            {/* Target Selector */}
            {student.guardian && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTargetPhoneType('guardian')}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    targetPhoneType === 'guardian'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Responsável ({student.guardian.relationship})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPhoneType('student')}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    targetPhoneType === 'student'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Próprio Aluno
                </button>
              </div>
            )}
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-300">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span><strong>Endereço:</strong> Rua Silva Jardim, 99</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-300">
              <Shirt className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span><strong>Vestimenta:</strong> Calça, sapato fechado e blusa vermelha ou branca</span>
            </div>
          </div>

          {/* Template Select Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Modelo de Mensagem Pré-Formatado:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {whatsappTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-center truncate transition-colors cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={tpl.title}
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Conteúdo da Mensagem (Você pode editar antes de enviar):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 custom-scrollbar"
            />
          </div>

          {/* Update Contact Status */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Status do Contato:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStatusChange('nao_contatado')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  currentContactStatus === 'nao_contatado'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Não Contatado
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('mensagem_enviada')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  currentContactStatus === 'mensagem_enviada'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Enviada
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('confirmado')}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                  currentContactStatus === 'confirmado'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                ✓ Confirmado
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir no WhatsApp Oficial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
