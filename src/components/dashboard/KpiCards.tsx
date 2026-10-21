import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DashboardKpis } from '../../types';

interface KpiCardsProps {
  kpis: DashboardKpis;
  activeSaturdayDate?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* Metric 1: Alunos no Ciclo */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-900/60 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Alunos no Ciclo
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.studentsScheduledThisSaturday.total}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              matriculados
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Manhã: <strong className="text-slate-800 dark:text-slate-200">{kpis.studentsScheduledThisSaturday.shiftMorning}</strong></span>
            <span>•</span>
            <span>Tarde: <strong className="text-slate-800 dark:text-slate-200">{kpis.studentsScheduledThisSaturday.shiftAfternoon}</strong></span>
          </div>
        </div>
      </div>

      {/* Metric 2: Frequência Média */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Frequência Média
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.overallAttendanceRate.percentage}%
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/50">
              Meta 100%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <strong className="text-slate-800 dark:text-slate-200">{kpis.overallAttendanceRate.presentCount}</strong> de <strong className="text-slate-800 dark:text-slate-200">{kpis.overallAttendanceRate.totalExpected}</strong> presenças registradas
          </div>
        </div>
      </div>

      {/* Metric 3: Confirmações WhatsApp */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-900/60 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Confirmações Zap
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/50">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.whatsappConfirmations.confirmedRate}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              confirmados
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <strong className="text-emerald-600 dark:text-emerald-400">{kpis.whatsappConfirmations.confirmedCount} confirmados</strong> • {kpis.whatsappConfirmations.pendingCount} pendentes
          </div>
        </div>
      </div>

      {/* Metric 4: Certificados Aptos */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-900/60 transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Certificados 100%
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {kpis.completedCertificates.totalReadyOrIssued}
            </span>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/50">
              16 Horas
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <strong className="text-blue-600 dark:text-blue-400">{kpis.completedCertificates.issuedThisMonth} emitidos</strong> • 100% assiduidade
          </div>
        </div>
      </div>
    </div>
  );
};
