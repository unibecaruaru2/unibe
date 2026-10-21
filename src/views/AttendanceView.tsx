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
  Filter
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
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  selectedSaturday,
  onSelectSaturday,
  availableSaturdays,
  onToggleAttendance,
  onOpenWhatsApp,
  onOpenCertificate
}) => {
  const [shiftFilter, setShiftFilter] = useState<'todos' | ShiftType>('todos');
  const [search, setSearch] = useState('');

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

  // Calculate current Saturday lesson index
  const lessonNumberForSaturday = (student: Student): 1 | 2 | 3 | 4 => {
    const idx = student.saturdays.indexOf(selectedSaturday);
    return idx !== -1 ? ((idx + 1) as 1 | 2 | 3 | 4) : student.currentLesson;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn">
      {/* 1. Clean Saturday Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        {/* Date Selector Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Sábado Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= availableSaturdays.length - 1}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Próximo Sábado"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 uppercase">
                Aula {currentIndex + 1} de 4
              </span>
              <h2 className="text-base font-bold text-slate-900 capitalize">
                {formatFullPortugueseDate(selectedSaturday)}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Selecione o sábado para registrar as presenças da chamada
            </span>
          </div>
        </div>

        {/* Filters: Shift + Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Shift selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setShiftFilter('todos')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                shiftFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setShiftFilter('manha')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                shiftFilter === 'manha' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Manhã</span>
            </button>
            <button
              onClick={() => setShiftFilter('tarde')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                shiftFilter === 'tarde' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tarde</span>
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar aluno na chamada..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white w-48"
            />
          </div>
        </div>
      </div>

      {/* 2. Spacious, Clean Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Aluno & Matrícula</th>
                <th className="py-3.5 px-4">Turno & Sala</th>
                <th className="py-3.5 px-4 text-center">Estágio</th>
                <th className="py-3.5 px-4 text-center">Chamada Deste Sábado</th>
                <th className="py-3.5 px-4 text-center">Ciclo Completo (A1..A4)</th>
                <th className="py-3.5 px-4 text-center">Status Certificado</th>
                <th className="py-3.5 px-5 text-right">Ação WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.map((student) => {
                const lessonNum = lessonNumberForSaturday(student);
                const currentRec = student.attendance.find(a => a.lessonNumber === lessonNum);
                const currentStatus = currentRec ? currentRec.status : 'pendente';
                const absences = student.attendance.filter(a => a.status === 'falta').length;
                const presences = student.attendance.filter(a => a.status === 'presente').length;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {student.registrationNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Shift & Classroom */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        student.shift === 'manha' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                      }`}>
                        {student.shift === 'manha' ? 'Manhã (08h-12h)' : 'Tarde (13h-17h)'}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">
                        {student.classroom}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Aula {lessonNum} de 4
                      </span>
                    </td>

                    {/* Main Roll Call Action for Today's Saturday */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (currentStatus !== 'presente') onToggleAttendance(student.id, lessonNum);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'presente'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-white hover:text-emerald-700'
                          }`}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentStatus !== 'falta') onToggleAttendance(student.id, lessonNum);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'falta'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-white hover:text-rose-700'
                          }`}
                        >
                          Falta
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentStatus !== 'pendente') onToggleAttendance(student.id, lessonNum);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'pendente'
                              ? 'bg-slate-300 text-slate-800 shadow-xs'
                              : 'text-slate-400 hover:bg-white'
                          }`}
                        >
                          -
                        </button>
                      </div>
                    </td>

                    {/* Full Cycle A1..A4 History */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {([1, 2, 3, 4] as const).map((lNum) => {
                          const r = student.attendance.find(a => a.lessonNumber === lNum);
                          const st = r ? r.status : 'pendente';
                          let bg = 'bg-slate-100 text-slate-400 border-slate-200';
                          if (st === 'presente') bg = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                          if (st === 'falta') bg = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';

                          return (
                            <span 
                              key={lNum}
                              title={`Aula ${lNum}: ${st.toUpperCase()}`}
                              className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center border ${bg}`}
                            >
                              A{lNum}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Certificate Status */}
                    <td className="py-4 px-4 text-center">
                      {absences > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-500" />
                          <span>Não Elegível</span>
                        </span>
                      ) : presences === 4 ? (
                        <button
                          onClick={() => onOpenCertificate(student)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            student.certificate.feePaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{student.certificate.feePaid ? 'Pago / Liberado' : 'Taxa Pendente'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {presences}/4 presenças
                        </span>
                      )}
                    </td>

                    {/* WhatsApp Quick Trigger */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => onOpenWhatsApp(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                        title="Enviar mensagem personalizada pelo WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
