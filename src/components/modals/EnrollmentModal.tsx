import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Sun, 
  Moon, 
  MessageSquare,
  Sparkles,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { Student, ShiftType, Guardian } from '../../types';
import { 
  calculateFourSaturdays, 
  formatDatePtBR, 
  formatDateIso 
} from '../../lib/social-training';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollStudent: (student: Partial<Student>) => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  onEnrollStudent
}) => {
  // Required fields according to business rules:
  // 1. Nome do Aluno
  // 2. Nome do Responsável
  // 3. WhatsApp do Responsável
  // 4. Data de Inscrição
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  // Auxiliary fields
  const [shift, setShift] = useState<ShiftType>('manha');
  const [guardianRelationship, setGuardianRelationship] = useState<'Mae' | 'Pai' | 'Avo' | 'Tutor' | 'Outro'>('Mae');
  const [studentPhone, setStudentPhone] = useState('');
  const [birthDate, setBirthDate] = useState('2009-01-15');
  const [classroom, setClassroom] = useState('Laboratório Inovação Social - Sala 102');

  // Dynamic automatic calculation of the 4 consecutive Saturdays from Enrollment Date
  const computedSaturdays = useMemo(() => {
    try {
      if (!enrollmentDate) return [];
      const saturdays = calculateFourSaturdays(enrollmentDate, { includeSameDaySaturday: false });
      return saturdays.map((d, index) => ({
        lessonNumber: index + 1,
        dateObj: d,
        dateIso: formatDateIso(d),
        dateFormatted: formatDatePtBR(d, 'long'),
        dateShort: formatDatePtBR(d, 'short')
      }));
    } catch (err) {
      return [];
    }
  }, [enrollmentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !guardianName.trim() || !guardianPhone.trim() || !enrollmentDate) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome do Aluno, Nome do Responsável, WhatsApp e Data de Inscrição).');
      return;
    }

    const guardianData: Guardian = {
      id: `grd-${Date.now()}`,
      name: guardianName.trim(),
      relationship: guardianRelationship,
      phone: guardianPhone.trim()
    };

    const saturdayDates = computedSaturdays.map(s => s.dateIso);

    const newStudent: Partial<Student> = {
      name: studentName.trim(),
      phone: studentPhone.trim() || guardianPhone.trim(),
      birthDate,
      isUnderage: true,
      guardian: guardianData,
      shift,
      classroom,
      currentLesson: 1,
      enrollmentDate,
      saturdays: saturdayDates,
      attendance: computedSaturdays.map((item) => ({
        lessonNumber: item.lessonNumber as 1 | 2 | 3 | 4,
        date: item.dateIso,
        status: 'pendente'
      })),
      whatsappStatus: 'nao_contatado',
      certificate: {
        id: `cert-${Date.now()}`,
        studentId: '',
        status: 'em_andamento',
        feeAmount: 35.00,
        feePaid: false
      }
    };

    onEnrollStudent(newStudent);
    onClose();
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
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Nova Matrícula • Treinamento Social
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro de aluno e geração automática do ciclo de 4 sábados consecutivos
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* 1. Nome do Aluno */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Aluno *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex: Gabriel Henrique de Souza"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* 2 & 3. Responsável & WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Responsável *
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Ex: Patrícia Helena de Souza"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                WhatsApp do Responsável *
              </label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Parentesco e Turno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vínculo / Parentesco
              </label>
              <select
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
              >
                <option value="Mae">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Avo">Avô / Avó</option>
                <option value="Tutor">Tutor Legal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Turno de Estudo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('manha')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    shift === 'manha'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Manhã (08h-12h)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShift('tarde')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                    shift === 'tarde'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Tarde (13h-17h)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Data de Inscrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Data de Inscrição *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              O sistema calcula automaticamente o 1º sábado seguinte como a data da <strong>Aula 1</strong>.
            </p>
          </div>

          {/* Dynamic Box: Cálculo em Tempo Real do Ciclo de 4 Sábados */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                Ciclo Oficial Calculado (4 Sábados Consecutivos)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {computedSaturdays.map((sat) => (
                <div 
                  key={sat.lessonNumber}
                  className="bg-white/90 border border-blue-100 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                    A{sat.lessonNumber}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Aula {sat.lessonNumber} • {sat.dateShort}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate capitalize">
                      {sat.dateFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-900">
              <span>Carga Horária Total: <strong>16 horas presenciais</strong></span>
              <span>Exigência: <strong>100% de Presença (4 de 4)</strong></span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Confirmar Matrícula e Gerar Ciclo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
