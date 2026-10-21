import React from 'react';
import { Users, CheckCircle2, CreditCard, GraduationCap, DollarSign, Clock } from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

interface F10KpisProps {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia?: string;
}

export const F10Kpis: React.FC<F10KpisProps> = ({ matriculas, periodoReferencia }) => {
  const total = matriculas.length;
  const quitados = matriculas.filter(m => m.regime === 'QUITADO');
  const carne = matriculas.filter(m => m.regime === 'CARNE_MENSALISTA');

  // Coleta turmas e professores únicos
  const turmasSet = new Set<string>();
  const profsSet = new Set<string>();
  matriculas.forEach(m => {
    m.turmas.forEach(t => {
      if (t.codigoTurma) turmasSet.add(t.codigoTurma);
      if (t.professor && t.professor !== 'Não informado') profsSet.add(t.professor);
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Matrículas */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total de Matrículas
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {total}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {periodoReferencia || 'Mês de referência'}
          </p>
        </div>
      </div>

      {/* Alunos Quitados (AV / S.A.V) */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-emerald-200/70 dark:border-emerald-950/60 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Quitados (À Vista / SAV)
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
              {quitados.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ({total > 0 ? Math.round((quitados.length / total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 mt-1">
            Certificados liberados imediatamente
          </p>
        </div>
      </div>

      {/* Alunos em Carnê (Venda) */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-amber-200/70 dark:border-amber-950/60 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Carnê / Mensalistas
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800 dark:text-amber-300 tracking-tight">
              {carne.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              ({total > 0 ? Math.round((carne.length / total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-1">
            Com parcelas recorrentes ativas
          </p>
        </div>
      </div>

      {/* Turmas & Docentes */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Turmas Ativas
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {turmasSet.size}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              turmas
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {profsSet.size} instrutores atribuídos
          </p>
        </div>
      </div>
    </div>
  );
};
