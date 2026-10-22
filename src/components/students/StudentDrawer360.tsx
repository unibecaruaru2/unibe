import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Award, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Shirt, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  ExternalLink,
  Copy,
  Check,
  Send,
  FileCheck,
  Sun,
  Moon
} from 'lucide-react';
import { Student, AttendanceStatus, WhatsAppContactStatusType } from '../../types';
import { formatPhoneNumber, formatFullPortugueseDate } from '../../utils/dateUtils';
import { whatsappTemplates } from '../../data/mockData';

interface StudentDrawer360Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onToggleAttendance: (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => void;
  onToggleFeePayment: (studentId: string) => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const StudentDrawer360: React.FC<StudentDrawer360Props> = ({
  isOpen,
  onClose,
  student,
  onToggleAttendance,
  onToggleFeePayment,
  onOpenWhatsApp,
  onOpenCertificate,
  onDeleteStudent
}) => {
  if (!isOpen || !student) return null;

  const [activeTab, setActiveTab] = useState<'FREQUENCIA' | 'CERTIFICADO' | 'RESPONSAVEL' | 'POLO'>('FREQUENCIA');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(whatsappTemplates[0]?.id || 'lembrete_sabado');
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const presences = student.attendance.filter(a => a.status === 'presente').length;
  const absences = student.attendance.filter(a => a.status === 'falta').length;
  const isEligible = presences === 4 && absences === 0;
  const isPaid = Boolean(student.certificate?.feePaid);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 2)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'AL';
  };

  const handleCopyPhone = () => {
    const rawPhone = student.guardian?.phone || student.phone;
    navigator.clipboard.writeText(rawPhone);
    setIsCopiedPhone(true);
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  const getShiftLabel = (shift: string) => {
    return shift === 'manha' ? 'Manhã (09h às 13h)' : 'Tarde (14h às 18h)';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-xl bg-white dark:bg-[#0E1726] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col pointer-events-auto text-slate-800 dark:text-slate-100">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                {getInitials(student.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {student.name}
                  </h2>
                  {student.isUnderage && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      Menor de Idade
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {student.registrationNumber}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    {student.shift === 'manha' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                    {getShiftLabel(student.shift)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Ribbon */}
          <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenWhatsApp(student)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Oficial</span>
              </button>

              <button
                onClick={() => onOpenCertificate(student)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificado</span>
              </button>
            </div>

            {onDeleteStudent && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Excluir Aluno"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-[#0E1726] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('FREQUENCIA')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'FREQUENCIA'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>4 Sábados ({presences}/4)</span>
            </button>

            <button
              onClick={() => setActiveTab('CERTIFICADO')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'CERTIFICADO'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificação {isEligible ? '✅' : '⏳'}</span>
            </button>

            <button
              onClick={() => setActiveTab('RESPONSAVEL')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'RESPONSAVEL'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Responsável</span>
            </button>

            <button
              onClick={() => setActiveTab('POLO')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'POLO'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Polo & Regras</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* TAB 1: FREQUÊNCIA 4 SÁBADOS */}
            {activeTab === 'FREQUENCIA' && (
              <div className="space-y-4">
                {/* Attendance Summary Banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isEligible 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                    : absences > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60'
                }`}>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Status da Carga Horária (16 Horas)
                    </h3>
                    <p className={`text-base font-black mt-0.5 ${
                      isEligible 
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : absences > 0
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {isEligible 
                        ? '100% Concluído (4 de 4 Aulas)' 
                        : absences > 0 
                        ? `Atenção: ${absences} Falta registrada`
                        : `${presences} de 4 Aulas Concluídas (${presences * 25}%)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                      {presences * 4}h
                    </span>
                    <span className="block text-[10px] text-slate-500">de 16 horas</span>
                  </div>
                </div>

                {/* Interactive 4 Saturdays Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>AULAS DO CICLO</span>
                    <span className="text-[11px] font-normal text-slate-400">Clique no botão para alternar (Presente / Falta / Pendente)</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {student.attendance.map((rec) => {
                      const isPres = rec.status === 'presente';
                      const isFalta = rec.status === 'falta';

                      return (
                        <div 
                          key={rec.lessonNumber}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                              #{rec.lessonNumber}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                Aula {rec.lessonNumber} • 4 Horas
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {formatFullPortugueseDate(rec.date)}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Button */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onToggleAttendance(student.id, rec.lessonNumber)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                                isPres
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : isFalta
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isPres && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {isFalta && <XCircle className="w-3.5 h-3.5" />}
                              <span>
                                {isPres ? 'PRESENTE' : isFalta ? 'FALTA' : 'PENDENTE'}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rule notice */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Regra Institucional:</strong> A certificação de 16 horas exige 100% de presença (4 sábados cumpridos). Faltas bloqueiam a emissão automática do certificado.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: CERTIFICAÇÃO & TAXA */}
            {activeTab === 'CERTIFICADO' && (
              <div className="space-y-4">
                {/* Certificate Status Box */}
                <div className={`p-5 rounded-2xl border ${
                  isEligible && isPaid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : isEligible && !isPaid
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Certificado de Conclusão (16h)
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isEligible && isPaid
                        ? 'bg-emerald-600 text-white'
                        : isEligible && !isPaid
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {isEligible && isPaid ? 'LIBERADO' : isEligible && !isPaid ? 'AGUARDANDO TAXA' : 'EM ANDAMENTO'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Treinamento Social de Qualificação Profissional
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Emitido pela UNIBE com validade curricular em conformidade com as diretrizes de cursos livres.
                    </p>
                  </div>

                  {student.certificate?.code && (
                    <div className="mt-4 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">CÓDIGO DE REGISTRO:</span>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {student.certificate.code}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fee Payment Control */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Taxa de Emissão e Registro
                      </span>
                      <span className="text-xs text-slate-500">
                        Valor único: R$ 35,00
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFeePayment(student.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isPaid ? 'TAXA PAGA (R$ 35)' : 'MARCAR COMO PAGO'}</span>
                    </button>
                  </div>
                </div>

                {/* Print/View Certificate Button */}
                <button
                  onClick={() => onOpenCertificate(student)}
                  disabled={!isEligible}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isEligible 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{isEligible ? 'Visualizar / Imprimir Certificado Oficial' : 'Bloqueado (Exige 4 Presenças)'}</span>
                </button>
              </div>
            )}

            {/* TAB 3: RESPONSÁVEL & WHATSAPP */}
            {activeTab === 'RESPONSAVEL' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Contato do Responsável Legal
                    </span>
                    {student.guardian?.relationship && (
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                        {student.guardian.relationship}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {student.guardian?.name || 'Não informado'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatPhoneNumber(student.guardian?.phone || student.phone)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleCopyPhone}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isCopiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopiedPhone ? 'Copiado!' : 'Copiar Telefone'}</span>
                    </button>

                    <a
                      href={`tel:${student.guardian?.phone || student.phone}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </a>
                  </div>
                </div>

                {/* Quick WhatsApp Dispatch */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] space-y-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Disparo de Mensagem no WhatsApp
                  </span>

                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {whatsappTemplates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => onOpenWhatsApp(student)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir Conversa Formatada no WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: POLO & REGRAS */}
            {activeTab === 'POLO' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Endereço do Polo Oficial</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Rua Silva Jardim, 99
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Local fixo de realização das aulas de sábado do Treinamento Social.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121D2F] space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Shirt className="w-4 h-4 text-rose-500" />
                    <span>Código de Vestimenta (Uniforme Obrigatório)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Calça comprida (jeans ou tecido escuro)</li>
                    <li>Sapato ou tênis totalmente fechado</li>
                    <li>Camiseta / blusa nas cores vermelha ou branca</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Delete Confirmation Modal Overlay */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border-t border-rose-300 dark:border-rose-900 space-y-2">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                Tem certeza que deseja excluir o aluno {student.name}?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteStudent?.(student.id);
                    onClose();
                  }}
                  className="px-3 py-1 rounded bg-rose-600 text-xs text-white font-bold"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
