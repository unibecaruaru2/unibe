import React from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Clock, 
  Sparkles,
  ChevronRight,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { Student, DashboardKpis } from '../types';
import { KpiCards } from '../components/dashboard/KpiCards';

interface DashboardViewProps {
  students: Student[];
  kpis: DashboardKpis;
  onNavigate: (route: string) => void;
  onOpenEnrollment: () => void;
  selectedSaturday: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  kpis,
  onNavigate,
  onOpenEnrollment,
  selectedSaturday
}) => {
  const eligibleForCert = students.filter(
    s => s.attendance.filter(a => a.status === 'presente').length === 4
  );
  const paidCerts = students.filter(s => s.certificate.status === 'pago_liberado');
  const pendingContact = students.filter(s => s.whatsappStatus === 'nao_contatado');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Welcome & Quick Action Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ciclo Ativo • 4 Sábados Consecutivos
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestão Escolar do Treinamento Social
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visão consolidada de frequência, confirmações via WhatsApp e elegibilidade de certificados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Fazer Chamada de Sábado</span>
          </button>
          <button
            onClick={onOpenEnrollment}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>+ Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* 4 Pastel KPI Cards */}
      <KpiCards kpis={kpis} />

      {/* 2-Column Clean Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Saturday Focus Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Próximo Sábado Letivo</h3>
                  <span className="text-xs text-slate-400">24 de Outubro de 2026 • 4ª e Última Aula do Ciclo</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200/60">
                Aula 4 de 4
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Os alunos que comparecerem a este sábado e completarem as 4 presenças consecutivas atingirão 100% de aproveitamento e ficarão aptos à emissão do Certificado Oficial de 16 horas.
            </p>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 text-center border border-slate-200/70 mb-4">
              <div>
                <span className="block text-lg font-black text-slate-900">{students.length}</span>
                <span className="text-[11px] text-slate-500">Alunos no Total</span>
              </div>
              <div>
                <span className="block text-lg font-black text-emerald-600">{eligibleForCert.length}</span>
                <span className="text-[11px] text-slate-500">100% Frequência</span>
              </div>
              <div>
                <span className="block text-lg font-black text-amber-600">{pendingContact.length}</span>
                <span className="text-[11px] text-slate-500">Pendente WhatsApp</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('attendance')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ir para a Lista de Chamada</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Certificates & Progression Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quadro de Certificação</h3>
                  <span className="text-xs text-slate-400">Regra Estrita: 100% de Presença Obrigatória</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60">
                16 Horas
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">Alunos com 100% de Presença (4 de 4)</span>
                </div>
                <span className="font-bold text-emerald-800">{eligibleForCert.length} alunos</span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/60">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Taxa Quitada / Certificado Liberado</span>
                </div>
                <span className="font-bold text-blue-800">{paidCerts.length} emitidos</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('certificates')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Gerenciar Certificados</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
