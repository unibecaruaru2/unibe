import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { DashboardKpis } from '../../types';

interface KpiCardsProps {
  kpis: DashboardKpis;
  activeSaturdayDate?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, activeSaturdayDate = '24/10/2026' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
      {/* Card 1: Alunos Escalados no Sábado */}
      <div className="bg-[#F4F1FD] rounded-2xl p-5 border border-purple-100/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-700 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <Users className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <TrendingUp className="w-3 h-3 text-purple-600" />
            +{kpis.studentsScheduledThisSaturday.trendPercentage}%
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.studentsScheduledThisSaturday.total}
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            Alunos Escalados no Sábado
          </div>
          <p className="text-xs text-purple-900/70 mt-1 flex items-center gap-2">
            <span>Manhã: <strong>{kpis.studentsScheduledThisSaturday.shiftMorning}</strong></span>
            <span>•</span>
            <span>Tarde: <strong>{kpis.studentsScheduledThisSaturday.shiftAfternoon}</strong></span>
          </p>
        </div>
      </div>

      {/* Card 2: Frequência & Presença Geral */}
      <div className="bg-[#EDFAF3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            +{kpis.overallAttendanceRate.trendPercentage}%
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.overallAttendanceRate.percentage}%
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            Taxa Média de Presença
          </div>
          <p className="text-xs text-emerald-900/70 mt-1 flex items-center gap-1.5">
            <span><strong>{kpis.overallAttendanceRate.presentCount}</strong> de <strong>{kpis.overallAttendanceRate.totalExpected}</strong> presenças validadas</span>
          </p>
        </div>
      </div>

      {/* Card 3: Confirmações WhatsApp */}
      <div className="bg-[#FEF7EC] rounded-2xl p-5 border border-amber-100/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <TrendingUp className="w-3 h-3 text-amber-600" />
            +{kpis.whatsappConfirmations.trendPercentage}%
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.whatsappConfirmations.confirmedRate}%
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            Confirmações via WhatsApp
          </div>
          <p className="text-xs text-amber-900/70 mt-1 flex items-center gap-1.5">
            <span><strong>{kpis.whatsappConfirmations.confirmedCount}</strong> confirmados</span>
            <span>•</span>
            <span className="text-amber-800 font-medium">{kpis.whatsappConfirmations.pendingCount} aguardando</span>
          </p>
        </div>
      </div>

      {/* Card 4: Certificados Concluídos / Aptos */}
      <div className="bg-[#EFF6FF] rounded-2xl p-5 border border-blue-100/80 shadow-xs hover:shadow-md transition-all duration-200 group relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
            <Award className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <ArrowUpRight className="w-3 h-3 text-blue-600" />
            +{kpis.completedCertificates.trendPercentage}%
          </span>
        </div>

        <div className="mt-4">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {kpis.completedCertificates.totalReadyOrIssued}
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">
            Certificados Aptos / Emitidos
          </div>
          <p className="text-xs text-blue-900/70 mt-1 flex items-center gap-1.5">
            <span><strong>{kpis.completedCertificates.issuedThisMonth}</strong> aptos neste ciclo de 4 aulas</span>
          </p>
        </div>
      </div>
    </div>
  );
};
