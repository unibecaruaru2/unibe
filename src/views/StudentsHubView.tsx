import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Award, 
  MessageSquare, 
  Search, 
  Filter, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  CreditCard, 
  Sparkles, 
  ChevronRight, 
  Sun, 
  Moon, 
  Trash2, 
  SlidersHorizontal,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Student, ShiftType, AttendanceStatus, WhatsAppContactStatusType } from '../types';
import { formatPhoneNumber, formatFullPortugueseDate } from '../utils/dateUtils';
import { StudentDrawer360 } from '../components/students/StudentDrawer360';

export type StudentsHubTab = 'todos' | 'chamada' | 'certificados' | 'whatsapp';

interface StudentsHubViewProps {
  students: Student[];
  initialTab?: StudentsHubTab;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedSaturday: string;
  onSelectSaturday: (date: string) => void;
  availableSaturdays: string[];
  onToggleAttendance: (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => void;
  onToggleFeePayment: (studentId: string) => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onOpenEnrollment: () => void;
  onDeleteStudent?: (studentId: string) => void;
  onUpdateWhatsAppStatus?: (studentId: string, status: WhatsAppContactStatusType) => void;
}

export const StudentsHubView: React.FC<StudentsHubViewProps> = ({
  students,
  initialTab = 'todos',
  searchQuery = '',
  onSearchChange,
  selectedSaturday,
  onSelectSaturday,
  availableSaturdays,
  onToggleAttendance,
  onToggleFeePayment,
  onOpenWhatsApp,
  onOpenCertificate,
  onOpenEnrollment,
  onDeleteStudent,
  onUpdateWhatsAppStatus
}) => {
  const [activeTab, setActiveTab] = useState<StudentsHubTab>(initialTab);
  const [search, setSearch] = useState(searchQuery);

  // Sync with prop when parent search changes
  React.useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const handleLocalSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };
  const [shiftFilter, setShiftFilter] = useState<'todos' | ShiftType>('todos');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student | null>(null);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Shift filter
      if (shiftFilter !== 'todos' && s.shift !== shiftFilter) return false;

      // Tab specific filters
      if (activeTab === 'certificados') {
        const presences = s.attendance.filter(a => a.status === 'presente').length;
        // In cert tab, optionally show either all or filter by eligibility
      } else if (activeTab === 'whatsapp') {
        // Can filter or sort by uncontacted
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchReg = s.registrationNumber.toLowerCase().includes(q);
        const matchGuardian = s.guardian?.name.toLowerCase().includes(q);
        const matchPhone = s.guardian?.phone.includes(q) || s.phone.includes(q);
        if (!matchName && !matchReg && !matchGuardian && !matchPhone) return false;
      }

      return true;
    });
  }, [students, shiftFilter, activeTab, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const morning = students.filter(s => s.shift === 'manha').length;
    const afternoon = students.filter(s => s.shift === 'tarde').length;
    const eligibleCert = students.filter(s => s.attendance.filter(a => a.status === 'presente').length === 4).length;
    const paidCert = students.filter(s => s.certificate?.feePaid).length;
    const pendingWhatsApp = students.filter(s => s.whatsappStatus !== 'confirmado').length;

    return { total, morning, afternoon, eligibleCert, paidCert, pendingWhatsApp };
  }, [students]);

  // Saturday navigation for Chamada mode
  const currentSaturdayIndex = availableSaturdays.indexOf(selectedSaturday);
  const handlePrevSaturday = () => {
    if (currentSaturdayIndex > 0) onSelectSaturday(availableSaturdays[currentSaturdayIndex - 1]);
  };
  const handleNextSaturday = () => {
    if (currentSaturdayIndex < availableSaturdays.length - 1) onSelectSaturday(availableSaturdays[currentSaturdayIndex + 1]);
  };

  // Helper for attendance badge
  const renderAttendanceBtn = (status: AttendanceStatus, lessonNum: 1 | 2 | 3 | 4, studentId: string) => {
    switch (status) {
      case 'presente':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAttendance(studentId, lessonNum);
            }}
            title={`Aula ${lessonNum}: Presente (Clique para alterar)`}
            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            P
          </button>
        );
      case 'falta':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAttendance(studentId, lessonNum);
            }}
            title={`Aula ${lessonNum}: Falta (Clique para alterar)`}
            className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            F
          </button>
        );
      case 'pendente':
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleAttendance(studentId, lessonNum);
            }}
            title={`Aula ${lessonNum}: Pendente (Clique para marcar presença)`}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            -
          </button>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto animate-fadeIn">
      {/* 1. Header Bar: Ant Enterprise Executive Style */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestão de Alunos 360°
            </h1>
            <span className="text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/40">
              {students.length} Alunos no Ciclo
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Controle integrado de chamada dos 4 sábados, certificação de 16h e contato WhatsApp oficial.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenEnrollment}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* 2. Mode Tabs + Smart Filters Row */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('todos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'todos'
                ? 'bg-white dark:bg-[#1A2639] text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Todos os Alunos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chamada')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'chamada'
                ? 'bg-white dark:bg-[#1A2639] text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Chamada dos 4 Sábados</span>
          </button>

          <button
            onClick={() => setActiveTab('certificados')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'certificados'
                ? 'bg-white dark:bg-[#1A2639] text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certificação (16h)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {stats.eligibleCert} Aptos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-white dark:bg-[#1A2639] text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp & Contatos</span>
            {stats.pendingWhatsApp > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {stats.pendingWhatsApp}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls: Search & Shift */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por aluno, matrícula ou responsável..."
              value={search}
              onChange={(e) => handleLocalSearchChange(e.target.value)}
              className="w-full text-xs pl-9 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => handleLocalSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setShiftFilter('todos')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                shiftFilter === 'todos' ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setShiftFilter('manha')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                shiftFilter === 'manha' ? 'bg-white dark:bg-[#1E293B] text-amber-600 dark:text-amber-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Manhã</span>
            </button>
            <button
              onClick={() => setShiftFilter('tarde')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                shiftFilter === 'tarde' ? 'bg-white dark:bg-[#1E293B] text-indigo-500 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Tarde</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chamada Specific Sub-Bar: Saturday Cycle Selector */}
      {activeTab === 'chamada' && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Sábado em Foco para Registro:
            </span>
            <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              {formatFullPortugueseDate(selectedSaturday)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevSaturday}
              disabled={currentSaturdayIndex <= 0}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              onClick={handleNextSaturday}
              disabled={currentSaturdayIndex >= availableSaturdays.length - 1}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Próximo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main High-Precision Table */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Aluno & Matrícula</th>
                <th className="py-3 px-3">Turno</th>
                
                {activeTab === 'todos' && (
                  <>
                    <th className="py-3 px-3">Responsável</th>
                    <th className="py-3 px-3">Presenças</th>
                    <th className="py-3 px-3">Certificado</th>
                    <th className="py-3 px-3">WhatsApp</th>
                  </>
                )}

                {activeTab === 'chamada' && (
                  <>
                    <th className="py-3 px-2 text-center">Aula 1</th>
                    <th className="py-3 px-2 text-center">Aula 2</th>
                    <th className="py-3 px-2 text-center">Aula 3</th>
                    <th className="py-3 px-2 text-center">Aula 4</th>
                    <th className="py-3 px-3">Frequência</th>
                  </>
                )}

                {activeTab === 'certificados' && (
                  <>
                    <th className="py-3 px-3">Carga Horária</th>
                    <th className="py-3 px-3">Elegibilidade</th>
                    <th className="py-3 px-3">Taxa R$ 35</th>
                    <th className="py-3 px-3">Código</th>
                  </>
                )}

                {activeTab === 'whatsapp' && (
                  <>
                    <th className="py-3 px-3">Responsável Legal</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">Status do Contato</th>
                    <th className="py-3 px-3">Disparo Rápido</th>
                  </>
                )}

                <th className="py-3 px-4 text-right">Ação 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum aluno encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const presences = student.attendance.filter(a => a.status === 'presente').length;
                  const absences = student.attendance.filter(a => a.status === 'falta').length;
                  const is100 = presences === 4 && absences === 0;
                  const isFeePaid = Boolean(student.certificate?.feePaid);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentForDrawer(student)}
                      className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors cursor-pointer group"
                    >
                      {/* Name & Reg */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                              {student.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.shift === 'manha'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40'
                        }`}>
                          {student.shift === 'manha' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                          <span>{student.shift === 'manha' ? 'Manhã' : 'Tarde'}</span>
                        </span>
                      </td>

                      {/* TAB: TODOS */}
                      {activeTab === 'todos' && (
                        <>
                          <td className="py-3 px-3">
                            <span className="text-slate-700 dark:text-slate-300 block font-medium">
                              {student.guardian?.name || 'Não informado'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {student.guardian?.relationship || 'Aluno'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {presences}/4 Aulas
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              is100 && isFeePaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900'
                                : is100 && !isFeePaid
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {is100 && isFeePaid ? 'Liberado' : is100 ? 'Taxa Pendente' : `${presences * 25}%`}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              student.whatsappStatus === 'confirmado'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : student.whatsappStatus === 'mensagem_enviada'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {student.whatsappStatus === 'confirmado' ? 'Confirmado' : student.whatsappStatus === 'mensagem_enviada' ? 'Enviada' : 'Pendente'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* TAB: CHAMADA */}
                      {activeTab === 'chamada' && (
                        <>
                          <td className="py-3 px-2 text-center">
                            {renderAttendanceBtn(student.attendance[0]?.status || 'pendente', 1, student.id)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {renderAttendanceBtn(student.attendance[1]?.status || 'pendente', 2, student.id)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {renderAttendanceBtn(student.attendance[2]?.status || 'pendente', 3, student.id)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {renderAttendanceBtn(student.attendance[3]?.status || 'pendente', 4, student.id)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${
                              is100 ? 'text-emerald-600 dark:text-emerald-400' : absences > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {presences * 4}h de 16h
                            </span>
                          </td>
                        </>
                      )}

                      {/* TAB: CERTIFICADOS */}
                      {activeTab === 'certificados' && (
                        <>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {presences * 4}h / 16h
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {is100 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>100% Apto</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{absences > 0 ? 'Inapto (Falta)' : 'Em curso'}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFeePayment(student.id);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                isFeePaid
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {isFeePaid ? 'PAGO (R$ 35)' : 'COBRAR R$ 35'}
                            </button>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {student.certificate?.code || '—'}
                          </td>
                        </>
                      )}

                      {/* TAB: WHATSAPP */}
                      {activeTab === 'whatsapp' && (
                        <>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {student.guardian?.name || 'Não informado'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {formatPhoneNumber(student.guardian?.phone || student.phone)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              student.whatsappStatus === 'confirmado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                                : student.whatsappStatus === 'mensagem_enviada'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {student.whatsappStatus === 'confirmado' ? 'Confirmado' : student.whatsappStatus === 'mensagem_enviada' ? 'Enviada' : 'Não contatado'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenWhatsApp(student);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Enviar wa.me</span>
                            </button>
                          </td>
                        </>
                      )}

                      {/* Action 360° */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForDrawer(student);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ficha 360°</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive 360° Student Drawer */}
      <StudentDrawer360
        isOpen={Boolean(selectedStudentForDrawer)}
        onClose={() => setSelectedStudentForDrawer(null)}
        student={selectedStudentForDrawer}
        onToggleAttendance={onToggleAttendance}
        onToggleFeePayment={onToggleFeePayment}
        onOpenWhatsApp={onOpenWhatsApp}
        onOpenCertificate={onOpenCertificate}
        onDeleteStudent={onDeleteStudent}
      />
    </div>
  );
};
