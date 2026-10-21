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
  AlertCircle
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

    // Pre-fill with dynamic variables as requested by business rules
    let replaced = tpl.text
      .replace(/{nome_responsavel}/g, guardianName)
      .replace(/{nome_aluno}/g, student.name)
      .replace(/{numero_aula}/g, `Aula ${lessonNum} de 4`)
      .replace(/{data_aula}/g, dateFormatted)
      .replace(/{turno}/g, formattedShift)
      .replace(/{local}/g, student.classroom)
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
      // Update contact status to "mensagem_enviada" upon sending
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">
                  Comunicação WhatsApp Oficial
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  wa.me Integration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Disparo personalizado com edição prévia para o Responsável ou Aluno
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
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Target Student and Guardian Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                {student.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {student.name}
                  {student.isUnderage && (
                    <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Menor de Idade
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500">
                  Responsável: <strong>{student.guardian ? student.guardian.name : 'Próprio Aluno'}</strong> • Tel: {formatPhoneNumber(currentPhone)}
                </span>
              </div>
            </div>

            {/* Recipient Selector */}
            {student.guardian && (
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetPhoneType('guardian')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    targetPhoneType === 'guardian' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Responsável
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPhoneType('student')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    targetPhoneType === 'student' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Aluno
                </button>
              </div>
            )}
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Modelo de Mensagem (Templates Oficiais):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {whatsappTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 font-semibold text-emerald-950'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tpl.title}</span>
                    {selectedTemplateId === tpl.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea with Dynamic Variable Tags Info */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Texto da Mensagem (Edição Prévia Livre):</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {messageBody.length} caracteres
              </span>
            </div>

            <textarea
              rows={7}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full text-xs font-mono leading-relaxed p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 shadow-inner resize-y"
              placeholder="Digite ou edite a mensagem antes de disparar..."
            />
            
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Variáveis dinâmicas preenchidas: <strong>{'{nome_responsavel}'}</strong>, <strong>{'{nome_aluno}'}</strong>, <strong>{'{numero_aula}'}</strong>, <strong>{'{data_aula}'}</strong>.</span>
            </p>
          </div>

          {/* Contact Status Tracker */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Status de Contato do Aluno:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('nao_contatado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  currentContactStatus === 'nao_contatado'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Não Contatado
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('mensagem_enviada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  currentContactStatus === 'mensagem_enviada'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                Mensagem Enviada
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('confirmado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  currentContactStatus === 'confirmado'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Confirmado
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Abrir WhatsApp (wa.me)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
