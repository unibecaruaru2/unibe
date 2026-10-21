import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Award,
  ChevronRight,
  Filter,
  Trash2,
  AlertTriangle,
  CreditCard,
  Shirt
} from 'lucide-react';
import { Student, ShiftType } from '../types';
import { formatPhoneNumber } from '../utils/dateUtils';

interface StudentsViewProps {
  students: Student[];
  onOpenEnrollment: () => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onOpenEnrollment,
  onOpenWhatsApp,
  onOpenCertificate,
  onDeleteStudent
}) => {
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'todos' | ShiftType>('todos');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filtered = students.filter(s => {
    if (shiftFilter !== 'todos' && s.shift !== shiftFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchReg = s.registrationNumber.toLowerCase().includes(q);
      const matchGuardian = s.guardian?.name.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchGuardian) return false;
    }
    return true;
  });

  const confirmDelete = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Alunos & Matrículas
            </h1>
            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              {students.length} Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestão cadastral completa • Polo Rua Silva Jardim, 99
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEnrollment}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, matrícula ou responsável..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 dark:text-slate-500 font-normal">Turno:</span>
          <button
            onClick={() => setShiftFilter('todos')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-xs ${
              shiftFilter === 'todos' 
                ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setShiftFilter('manha')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-xs ${
              shiftFilter === 'manha' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Manhã (08h-12h)
          </button>
          <button
            onClick={() => setShiftFilter('tarde')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-xs ${
              shiftFilter === 'tarde' 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tarde (13h-17h)
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Aluno & Matrícula</th>
                <th className="py-2.5 px-3">Responsável Legal</th>
                <th className="py-2.5 px-3">WhatsApp</th>
                <th className="py-2.5 px-3">Data Matrícula</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3">Pagamento</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-6 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Nenhum aluno encontrado</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {search 
                          ? 'Nenhum resultado corresponde à sua pesquisa.' 
                          : 'Cadastre o primeiro aluno usando o botão abaixo.'}
                      </p>
                      <button
                        onClick={onOpenEnrollment}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Nova Matrícula</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const isPaid = student.certificate?.feePaid;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Student */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs">
                            {student.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {student.name}
                              </span>
                              {student.isUnderage && (
                                <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/50 px-1 py-0.2 rounded">
                                  Menor
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Guardian */}
                      <td className="py-3 px-3">
                        {student.guardian ? (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">
                              {student.guardian.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {student.guardian.relationship}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Próprio Aluno</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {formatPhoneNumber(student.guardian ? student.guardian.phone : student.phone)}
                      </td>

                      {/* Enrollment Date */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {student.enrollmentDate ? student.enrollmentDate.split('-').reverse().join('/') : '21/10/2026'}
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          student.shift === 'manha' 
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50' 
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/50'
                        }`}>
                          {student.shift === 'manha' ? 'Manhã' : 'Tarde'}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {isPaid ? 'Pago' : 'Pendente'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenWhatsApp(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenCertificate(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Ver Certificado"
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
                  Confirmar Exclusão do Aluno
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Tem certeza que deseja excluir <strong>{studentToDelete.name}</strong> ({studentToDelete.registrationNumber})? Todos os dados vinculados serão cancelados.
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
