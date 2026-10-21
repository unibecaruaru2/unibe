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
  Filter
} from 'lucide-react';
import { Student, ShiftType } from '../types';
import { formatPhoneNumber, formatFullPortugueseDate } from '../utils/dateUtils';

interface StudentsViewProps {
  students: Student[];
  onOpenEnrollment: () => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onOpenEnrollment,
  onOpenWhatsApp,
  onOpenCertificate
}) => {
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'todos' | ShiftType>('todos');

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

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Alunos & Matrículas
            </h1>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {students.length} Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão cadastral completa, responsáveis legais e controle dos ciclos de 4 sábados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEnrollment}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, matrícula ou responsável..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
          />
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400 font-normal">Turno:</span>
          <button
            onClick={() => setShiftFilter('todos')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              shiftFilter === 'todos' ? 'bg-[#0B192C] text-white border-[#0B192C]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setShiftFilter('manha')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              shiftFilter === 'manha' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Manhã (08h-12h)
          </button>
          <button
            onClick={() => setShiftFilter('tarde')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              shiftFilter === 'tarde' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tarde (13h-17h)
          </button>
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Aluno & Matrícula</th>
                <th className="py-3.5 px-4">Responsável Legal</th>
                <th className="py-3.5 px-4">WhatsApp do Contato</th>
                <th className="py-3.5 px-4">Data Matrícula</th>
                <th className="py-3.5 px-4">1º Sábado (Aula 1)</th>
                <th className="py-3.5 px-4">Turno & Sala</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Student */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {student.name}
                          </span>
                          {student.isUnderage && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.5 rounded">
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

                  {/* Guardian */}
                  <td className="py-4 px-4 text-xs">
                    {student.guardian ? (
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {student.guardian.name}
                        </span>
                        <span className="text-slate-400">
                          {student.guardian.relationship}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Próprio Aluno (Maior)</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 text-xs font-mono">
                    <span className="text-slate-700">
                      {formatPhoneNumber(student.guardian ? student.guardian.phone : student.phone)}
                    </span>
                  </td>

                  {/* Enrollment Date */}
                  <td className="py-4 px-4 text-xs text-slate-600">
                    {student.enrollmentDate ? student.enrollmentDate.split('-').reverse().join('/') : '21/10/2026'}
                  </td>

                  {/* 1st Saturday */}
                  <td className="py-4 px-4 text-xs font-semibold text-blue-700">
                    {student.saturdays?.[0] ? student.saturdays[0].split('-').reverse().join('/') : '24/10/2026'}
                  </td>

                  {/* Shift & Room */}
                  <td className="py-4 px-4 text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-semibold ${
                      student.shift === 'manha' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {student.shift === 'manha' ? 'Manhã' : 'Tarde'}
                    </span>
                    <span className="block text-slate-400 text-[11px] mt-0.5">
                      {student.classroom}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenWhatsApp(student)}
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Enviar WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenCertificate(student)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Ver Certificado"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
