import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sun, 
  Moon, 
  MapPin, 
  CalendarCheck,
  CreditCard,
  DollarSign,
  Shirt,
  ShieldCheck
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
  // Required fields:
  // 1. Nome do Aluno
  // 2. Nome do Responsável
  // 3. WhatsApp do Responsável
  // 4. Data de Inscrição
  // 5. Pagamento da Aula / Taxa (NOVO)
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  // Payment status
  const [isFeePaid, setIsFeePaid] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix');

  // Auxiliary fields
  const [shift, setShift] = useState<ShiftType>('manha');
  const [guardianRelationship, setGuardianRelationship] = useState<'Mae' | 'Pai' | 'Avo' | 'Tutor' | 'Outro'>('Mae');
  const [studentPhone, setStudentPhone] = useState('');
  const [birthDate, setBirthDate] = useState('2009-01-15');
  const [classroom, setClassroom] = useState('Rua Silva Jardim, 99');

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
      classroom: 'Rua Silva Jardim, 99',
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
        status: isFeePaid ? 'pendente_pagamento' : 'em_andamento',
        feeAmount: 35.00,
        feePaid: isFeePaid
      }
    };

    onEnrollStudent(newStudent);
    onClose();

    // Reset form
    setStudentName('');
    setGuardianName('');
    setGuardianPhone('');
    setIsFeePaid(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                Nova Matrícula • Treinamento Social
              </h2>
              <p className="text-[11px] text-slate-400">
                Cadastro de aluno, controle de pagamento e geração do ciclo de 4 sábados
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Institutional Alert: Address and Uniform */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>Endereço:</strong> Rua Silva Jardim, 99</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Shirt className="w-4 h-4 text-rose-500 shrink-0" />
              <span><strong>Uniforme:</strong> Calça, sapato fechado e blusa vermelha ou branca</span>
            </div>
          </div>

          {/* 1. Nome do Aluno */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nome Completo do Aluno *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ex: Gabriel Henrique de Souza"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* 2 & 3. Responsável & WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nome do Responsável *
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Ex: Patrícia Helena de Souza"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                WhatsApp do Responsável *
              </label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Parentesco e Turno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Vínculo / Parentesco
              </label>
              <select
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="Mae">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Avo">Avô / Avó</option>
                <option value="Tutor">Tutor Legal</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Turno de Estudo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('manha')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    shift === 'manha'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Manhã (08h-12h)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShift('tarde')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    shift === 'tarde'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tarde (13h-17h)</span>
                </button>
              </div>
            </div>
          </div>

          {/* NOVO REQUISITO: Opção de Pagamento da Aula / Matrícula */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Status do Pagamento da Aula / Taxa (R$ 35,00)</span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isFeePaid 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isFeePaid ? '✓ Quitado' : 'Aguardando Pagamento'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsFeePaid(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  isFeePaid
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Aluno Já Pagou</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFeePaid(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  !isFeePaid
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Pagar Posteriormente</span>
              </button>
            </div>

            {isFeePaid && (
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-500 dark:text-slate-400">Forma de Pagamento:</span>
                <div className="flex items-center gap-1.5">
                  {(['pix', 'dinheiro', 'cartao'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold cursor-pointer transition-colors ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Data de Inscrição */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Data de Inscrição *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              O sistema calcula automaticamente o 1º sábado seguinte como a data da <strong>Aula 1</strong>.
            </p>
          </div>

          {/* Dynamic Box: Cálculo em Tempo Real do Ciclo de 4 Sábados */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/90 dark:border-blue-800/60 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <CalendarCheck className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                Ciclo Oficial Calculado (4 Sábados Consecutivos)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {computedSaturdays.map((sat) => (
                <div 
                  key={sat.lessonNumber}
                  className="bg-white/90 dark:bg-slate-900/90 border border-blue-100 dark:border-blue-900/50 rounded-lg p-2 flex items-center gap-2 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                    A{sat.lessonNumber}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      Aula {sat.lessonNumber} • {sat.dateShort}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">
                      {sat.dateFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[10px] text-blue-900 dark:text-blue-300">
              <span>Carga Horária: <strong>16h presenciais</strong></span>
              <span>Regra: <strong>100% de Presença</strong></span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
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
