import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  Award,
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Shirt,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Student, ShiftType, AttendanceStatus, WhatsAppContactStatusType } from '../types';
import { formatFullPortugueseDate, formatPhoneNumber } from '../utils/dateUtils';

interface AttendanceViewProps {
  students: Student[];
  selectedSaturday: string;
  onSelectSaturday: (date: string) => void;
  availableSaturdays: string[];
  onToggleAttendance: (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  selectedSaturday,
  onSelectSaturday,
  availableSaturdays,
  onToggleAttendance,
  onOpenWhatsApp,
  onOpenCertificate,
  onDeleteStudent
}) => {
  const [shiftFilter, setShiftFilter] = useState<'todos' | ShiftType>('todos');
  const [search, setSearch] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const currentIndex = availableSaturdays.indexOf(selectedSaturday);

  const handlePrev = () => {
    if (currentIndex > 0) onSelectSaturday(availableSaturdays[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < availableSaturdays.length - 1) onSelectSaturday(availableSaturdays[currentIndex + 1]);
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    if (shiftFilter !== 'todos' && s.shift !== shiftFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchReg = s.registrationNumber.toLowerCase().includes(q);
      if (!matchName && !matchReg) return false;
    }
    return true;
  });

  const confirmDelete = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const renderBadge = (status: AttendanceStatus, lessonNum: 1 | 2 | 3 | 4, studentId: string) => {
    switch (status) {
      case 'presente':
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Presente (Clique para alterar para Falta)`}
            className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-800 shadow-2xs transition-transform active:scale-95 cursor-pointer"
          >
            P
          </button>
        );
      case 'falta':
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Falta (Clique para alterar para Pendente)`}
            className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-300 dark:border-rose-800 shadow-2xs transition-transform active:scale-95 cursor-pointer"
          >
            F
          </button>
        );
      default:
        return (
          <button
            onClick={() => onToggleAttendance(studentId, lessonNum)}
            title={`Aula ${lessonNum}: Pendente (Clique para registrar Presença)`}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
          >
            -
          </button>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Chamada Oficial do Sábado Letivo
            </h1>
            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              100% de Presença Obrigatória
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Rua Silva Jardim, 99</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 font-medium">
              <Shirt className="w-3.5 h-3.5 text-rose-500" />
              <span>Uniforme: Calça, sapato fechado e blusa vermelha ou branca</span>
            </span>
          </div>
        </div>

        {/* Saturday Navigator */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sábado Selecionado
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
              {selectedSaturday ? selectedSaturday.split('-').reverse().join('/') : 'Próximo'}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex >= availableSaturdays.length - 1}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno na chamada..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShiftFilter('todos')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
              shiftFilter === 'todos' ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setShiftFilter('manha')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
              shiftFilter === 'manha' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            Manhã
          </button>
          <button
            onClick={() => setShiftFilter('tarde')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
              shiftFilter === 'tarde' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            Tarde
          </button>
        </div>

        {/* Attendance Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">P</span>
            <span>Presente</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center justify-center text-[10px]">F</span>
            <span>Falta</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">-</span>
            <span>Pendente</span>
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Aluno / Matrícula</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3 text-center">Aula 1</th>
                <th className="py-2.5 px-3 text-center">Aula 2</th>
                <th className="py-2.5 px-3 text-center">Aula 3</th>
                <th className="py-2.5 px-3 text-center">Aula 4</th>
                <th className="py-2.5 px-3 text-center">Certificado</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Nenhum aluno encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const presences = student.attendance.filter(a => a.status === 'presente').length;
                  const absences = student.attendance.filter(a => a.status === 'falta').length;
                  const is100 = presences === 4 && absences === 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                            {student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          student.shift === 'manha' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' 
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {student.shift === 'manha' ? 'Manhã' : 'Tarde'}
                        </span>
                      </td>

                      {/* 4 Lessons */}
                      {[1, 2, 3, 4].map((num) => {
                        const rec = student.attendance.find(a => a.lessonNumber === num);
                        return (
                          <td key={num} className="py-2.5 px-3 text-center">
                            <div className="flex justify-center">
                              {renderBadge(rec?.status || 'pendente', num as any, student.id)}
                            </div>
                          </td>
                        );
                      })}

                      {/* Certificate Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          is100
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                            : absences > 0
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {is100 ? 'Apto 100%' : absences > 0 ? 'Inapto (Falta)' : `${presences}/4`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenWhatsApp(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenCertificate(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Certificado"
                          >
                            <Award className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteStudent && (
                            <button
                              onClick={() => setStudentToDelete(student)}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  Confirmar Exclusão de Aluno
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir <strong>{studentToDelete.name}</strong> ({studentToDelete.registrationNumber}) da lista de chamada?
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
    </div>
  );
};
