import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Award
} from 'lucide-react';
import { DashboardKpis } from '../../types';

interface KpiCardsProps {
  kpis: DashboardKpis;
  activeSaturdayDate?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Metric 1: Alunos no Ciclo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Alunos no Ciclo
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.studentsScheduledThisSaturday.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Manhã: <strong className="text-slate-700">{kpis.studentsScheduledThisSaturday.shiftMorning}</strong> • Tarde: <strong className="text-slate-700">{kpis.studentsScheduledThisSaturday.shiftAfternoon}</strong>
          </p>
        </div>
      </div>

      {/* Metric 2: Frequência Geral */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Frequência Média
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.overallAttendanceRate.percentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-slate-700">{kpis.overallAttendanceRate.presentCount}</strong> de <strong className="text-slate-700">{kpis.overallAttendanceRate.totalExpected}</strong> presenças registradas
          </p>
        </div>
      </div>

      {/* Metric 3: Confirmações WhatsApp */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            WhatsApp
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.whatsappConfirmations.confirmedRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-emerald-600">{kpis.whatsappConfirmations.confirmedCount} confirmados</strong> • {kpis.whatsappConfirmations.pendingCount} pendentes
          </p>
        </div>
      </div>

      {/* Metric 4: Certificados Aptos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Certificados 100%
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.completedCertificates.totalReadyOrIssued}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-blue-600">{kpis.completedCertificates.issuedThisMonth} emitidos</strong> • 100% assiduidade
          </p>
        </div>
      </div>
    </div>
  );
};
