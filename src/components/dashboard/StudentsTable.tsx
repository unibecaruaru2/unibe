import React from 'react';
import { 
  Student, 
  AttendanceStatus, 
  WhatsAppContactStatusType 
} from '../../types';
import { 
  MessageSquare, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  ChevronRight,
  ShieldAlert,
  CreditCard,
  Check
} from 'lucide-react';
import { formatPhoneNumber } from '../../utils/dateUtils';

interface StudentsTableProps {
  students: Student[];
  selectedSaturday: string;
  onToggleAttendance: (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onConfirmFeePayment?: (studentId: string) => void;
  onUpdateWhatsAppStatus?: (studentId: string, status: WhatsAppContactStatusType) => void;
  onSelectStudentDetails?: (student: Student) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  selectedSaturday,
  onToggleAttendance,
  onOpenWhatsApp,
  onOpenCertificate,
  onConfirmFeePayment,
  onUpdateWhatsAppStatus,
  onSelectStudentDetails
}) => {
  // Helper for attendance badge styling (P = Presente, F = Falta, - = Pendente)
  const renderAttendanceBadge = (status: AttendanceStatus, lessonNum: 1 | 2 | 3 | 4, studentId: string) => {
    switch (status) {
      case 'presente':
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Presente (Clique para alterar para Falta)`}
            className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            P
          </button>
        );
      case 'falta':
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Falta (Clique para alterar para Pendente)`}
            className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-300 dark:border-rose-800 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            F
          </button>
        );
      case 'pendente':
      default:
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Pendente (Clique para registrar Presença)`}
            className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            -
          </button>
        );
    }
  };

  // Helper for WhatsApp status badge (Não Contatado, Mensagem Enviada, Confirmado)
  const renderWhatsAppBadge = (status: WhatsAppContactStatusType, student: Student) => {
    switch (status) {
      case 'confirmado':
        return (
          <button
            onClick={() => onOpenWhatsApp(student)}
            title="Presença confirmada pelo responsável. Clique para abrir detalhes do WhatsApp."
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Confirmado</span>
          </button>
        );
      case 'mensagem_enviada':
        return (
          <button
            onClick={() => onOpenWhatsApp(student)}
            title="Mensagem enviada pelo operador, aguardando resposta. Clique para abrir."
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/90 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Mensagem Enviada</span>
          </button>
        );
      case 'nao_contatado':
      default:
        return (
          <button
            onClick={() => onOpenWhatsApp(student)}
            title="Contato ainda não iniciado. Clique para disparar mensagem."
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Não Contatado</span>
          </button>
        );
    }
  };

  // Helper for Certificate badge with strict 100% presence & payment rules:
  // - "Não Elegível" (se tiver faltas)
  // - "Pendente Pagamento" (se tiver 100% de presença, mas ainda não pagou a taxa)
  // - "Pago / Liberado" (status confirmando recebimento da taxa para emissão)
  // - "Em Andamento" (aulas futuras em aberto sem faltas)
  const renderCertificateBadge = (student: Student) => {
    const cert = student.certificate;
    const absences = student.attendance.filter(a => a.status === 'falta').length;
    const presentCount = student.attendance.filter(a => a.status === 'presente').length;

    if (absences > 0 || cert.status === 'nao_elegivel') {
      return (
        <span 
          title="Não elegível ao certificado. O Treinamento Social exige rigorosamente 100% de frequência."
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/90"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          <span>Não Elegível</span>
        </span>
      );
    }

    if (cert.status === 'pago_liberado' || (presentCount === 4 && cert.feePaid)) {
      return (
        <button
          onClick={() => onOpenCertificate(student)}
          title="100% Concluído e Taxa Paga. Clique para visualizar e imprimir Certificado Oficial."
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pago / Liberado</span>
        </button>
      );
    }

    if (cert.status === 'pendente_pagamento' || (presentCount === 4 && !cert.feePaid)) {
      return (
        <button
          onClick={() => {
            if (onConfirmFeePayment) {
              onConfirmFeePayment(student.id);
            } else {
              onOpenCertificate(student);
            }
          }}
          title="100% de Presença atingida! Taxa de emissão pendente (R$ 35,00). Clique para liquidar."
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all shadow-xs cursor-pointer animate-pulse"
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          <span>Pendente Pagamento</span>
        </button>
      );
    }

    return (
      <span 
        title={`${presentCount} presenças em 4 aulas. Em andamento sem faltas.`}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
      >
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Em Andamento ({presentCount}/4)</span>
      </span>
    );
  };

  // Determine which lesson number corresponds to the currently selected Saturday
  const getLessonNumberForSaturday = (student: Student, dateIso: string): number => {
    const idx = student.saturdays.indexOf(dateIso);
    if (idx !== -1) {
      return idx + 1;
    }
    return student.currentLesson;
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum aluno encontrado</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Não há alunos cadastrados correspondentes aos filtros de busca ou turno selecionado para este sábado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Aluno & Matrícula</th>
              <th className="py-3.5 px-4">Responsável & Contato</th>
              <th className="py-3.5 px-4">Turno & Sala</th>
              <th className="py-3.5 px-4 text-center">Estágio no Ciclo</th>
              <th className="py-3.5 px-4 text-center">Frequência (A1..A4)</th>
              <th className="py-3.5 px-4 text-center">Confirmação WhatsApp</th>
              <th className="py-3.5 px-4 text-center">Status Certificado</th>
              <th className="py-3.5 px-4 text-right">Ação WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const presentCount = student.attendance.filter(a => a.status === 'presente').length;
              const lessonForThisSaturday = getLessonNumberForSaturday(student, selectedSaturday);

              return (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Student Name & Avatar */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {student.name}
                          </span>
                          {student.isUnderage && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.5 rounded-md">
                              Menor
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {student.registrationNumber}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Guardian & Phone */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col text-xs">
                      {student.guardian ? (
                        <>
                          <span className="font-medium text-slate-800">
                            {student.guardian.name}
                            <span className="text-slate-400 font-normal ml-1">
                              ({student.guardian.relationship})
                            </span>
                          </span>
                          <span className="text-slate-500 font-mono mt-0.5">
                            {formatPhoneNumber(student.guardian.phone)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-slate-800">Próprio Aluno</span>
                          <span className="text-slate-500 font-mono mt-0.5">
                            {formatPhoneNumber(student.phone)}
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Shift & Classroom */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold w-fit ${
                        student.shift === 'manha' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/70' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                      }`}>
                        {student.shift === 'manha' ? 'Manhã (08h-12h)' : 'Tarde (13h-17h)'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 truncate max-w-[130px]">
                        {student.classroom}
                      </span>
                    </div>
                  </td>

                  {/* Training Stage ("Aula X de 4") */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                        Aula {lessonForThisSaturday} de 4
                      </span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            lessonForThisSaturday === 4 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(lessonForThisSaturday / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Attendance Toggle Grid A1..A4 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {([1, 2, 3, 4] as const).map((lessonNum) => {
                        const rec = student.attendance.find(a => a.lessonNumber === lessonNum);
                        const status = rec ? rec.status : 'pendente';
                        return (
                          <div key={lessonNum} className="flex flex-col items-center gap-0.5">
                            <span className={`text-[9px] font-bold uppercase ${
                              lessonNum === lessonForThisSaturday ? 'text-blue-600' : 'text-slate-400'
                            }`}>
                              A{lessonNum}
                            </span>
                            {renderAttendanceBadge(status, lessonNum, student.id)}
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* WhatsApp Status */}
                  <td className="py-4 px-4 text-center">
                    {renderWhatsAppBadge(student.whatsappStatus, student)}
                  </td>

                  {/* Certificate Status */}
                  <td className="py-4 px-4 text-center">
                    {renderCertificateBadge(student)}
                  </td>

                  {/* Quick Action Button WhatsApp */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenWhatsApp(student)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Abrir WhatsApp e editar mensagem personalizada"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => onSelectStudentDetails?.(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver prontuário do aluno"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
