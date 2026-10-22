import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  MapPin,
  Shirt,
  MessageSquare,
  Trash2,
  AlertTriangle,
  CreditCard,
  X
} from 'lucide-react';
import { Student, DashboardKpis } from '../types';
import { KpiCards } from '../components/dashboard/KpiCards';
import { formatPhoneNumber } from '../utils/dateUtils';
import { StudentDrawer360 } from '../components/students/StudentDrawer360';

interface DashboardViewProps {
  students: Student[];
  kpis: DashboardKpis;
  onNavigate: (route: string, tab?: any) => void;
  onOpenEnrollment: () => void;
  selectedSaturday: string;
  onToggleAttendance?: (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => void;
  onToggleFeePayment?: (studentId: string) => void;
  onOpenWhatsApp?: (student: Student) => void;
  onOpenCertificate?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  kpis,
  onNavigate,
  onOpenEnrollment,
  selectedSaturday,
  onToggleAttendance,
  onToggleFeePayment,
  onOpenWhatsApp,
  onOpenCertificate,
  onDeleteStudent
}) => {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);

  const eligibleForCert = students.filter(
    s => s.attendance.filter(a => a.status === 'presente').length === 4
  );
  const paidCerts = students.filter(s => s.certificate?.feePaid);
  const pendingContact = students.filter(s => s.whatsappStatus !== 'confirmado');

  // Format Saturday display
  const saturdayDisplay = selectedSaturday
    ? selectedSaturday.split('-').reverse().join('/')
    : 'Próximo Sábado';

  const confirmDelete = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fadeIn">
      {/* 1. Header Bar: Compact & Informative */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Painel Geral
            </h1>
            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              Ciclo 4 Sábados
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Rua Silva Jardim, 99</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <Shirt className="w-3.5 h-3.5 text-rose-500" />
              <span>Uniforme: Calça, sapato fechado e blusa vermelha ou branca</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('students-hub', 'chamada')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Fazer Chamada</span>
          </button>
          <button
            onClick={onOpenEnrollment}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Metrics Row */}
      <KpiCards kpis={kpis} />

      {/* 3. Main Content: Empty State OR Optimized Bento Grid */}
      {students.length === 0 ? (
        <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Nenhum aluno cadastrado no momento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Cadastre os alunos do treinamento social. O sistema calcula automaticamente o ciclo oficial de 4 sábados consecutivos e a lista de chamada.
              </p>
            </div>
            <button
              onClick={onOpenEnrollment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Primeiro Aluno</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Row: Sábado Letivo & Certificação */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Card: Próximo Sábado Letivo */}
            <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">Sábado Letivo Ativo</h3>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{saturdayDisplay}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
                    Ciclo em Curso
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800/60">
                    <span className="block text-base font-black text-slate-900 dark:text-white">{students.length}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Matriculados</span>
                  </div>
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg p-2 border border-emerald-100/60 dark:border-emerald-800/30">
                    <span className="block text-base font-black text-emerald-700 dark:text-emerald-400">{eligibleForCert.length}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">100% Presença</span>
                  </div>
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-lg p-2 border border-amber-100/60 dark:border-amber-800/30">
                    <span className="block text-base font-black text-amber-700 dark:text-amber-400">{pendingContact.length}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendente Zap</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('students-hub', 'chamada')}
                className="w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Abrir Lista de Chamada</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Card: Certificação & Assiduidade */}
            <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">Certificação Oficial (16 Horas)</h3>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Regra: 100% de Presença Obrigatória</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                    Carga 16h
                  </span>
                </div>

                <div className="space-y-2 my-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-800/30">
                    <span className="text-emerald-900 dark:text-emerald-300 font-medium">Alunos com 4 Presenças (100%):</span>
                    <strong className="text-emerald-800 dark:text-emerald-400 font-bold">{eligibleForCert.length} alunos</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-800/30">
                    <span className="text-blue-900 dark:text-blue-300 font-medium">Taxa Quitada / Liberados:</span>
                    <strong className="text-blue-800 dark:text-blue-400 font-bold">{paidCerts.length} quitados</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('students-hub', 'certificados')}
                className="w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Gerenciar Certificados</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Students Summary & Direct Actions Table */}
          <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Alunos Matriculados no Ciclo
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {students.length}
                </span>
              </div>
              <button
                onClick={() => onNavigate('students-hub', 'todos')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Todos os Detalhes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Aluno / Matrícula</th>
                    <th className="py-2.5 px-3">Responsável</th>
                    <th className="py-2.5 px-3">Turno</th>
                    <th className="py-2.5 px-3">Pagamento Aula</th>
                    <th className="py-2.5 px-3 text-center">Frequência</th>
                    <th className="py-2.5 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {students.slice(0, 6).map((student) => {
                    const presences = student.attendance.filter(a => a.status === 'presente').length;
                    const isPaid = student.certificate?.feePaid;

                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => setSelectedStudentForDrawer(student)}
                        className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {student.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block truncate transition-colors">
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                {student.registrationNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          <span className="block truncate max-w-[140px]">
                            {student.guardian?.name || 'Próprio Aluno'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {formatPhoneNumber(student.guardian?.phone || student.phone)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            student.shift === 'manha' 
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50' 
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50'
                          }`}>
                            {student.shift === 'manha' ? 'Manhã' : 'Tarde'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isPaid ? 'Pago' : 'Pendente'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {presences}/4
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({Math.round((presences / 4) * 100)}%)
                          </span>
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudentForDrawer(student);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Ficha 360°</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            {onOpenWhatsApp && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenWhatsApp(student);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                title="Enviar Mensagem WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {onDeleteStudent && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentToDelete(student);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="Excluir Aluno"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Excluir Aluno do Sistema?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir <strong>{studentToDelete.name}</strong> ({studentToDelete.registrationNumber})? Esta ação removerá a matrícula e todos os registros de presença.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Aluno</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 360° Student Drawer */}
      <StudentDrawer360
        isOpen={Boolean(selectedStudentForDrawer)}
        onClose={() => setSelectedStudentForDrawer(null)}
        student={selectedStudentForDrawer}
        onToggleAttendance={onToggleAttendance || (() => {})}
        onToggleFeePayment={onToggleFeePayment || (() => {})}
        onOpenWhatsApp={onOpenWhatsApp || (() => {})}
        onOpenCertificate={onOpenCertificate || (() => {})}
        onDeleteStudent={onDeleteStudent}
      />
    </div>
  );
};
