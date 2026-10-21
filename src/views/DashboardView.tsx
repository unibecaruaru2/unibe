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
  ShieldCheck,
  UserPlus
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

  // Format Saturday display
  const saturdayDisplay = selectedSaturday
    ? selectedSaturday.split('-').reverse().join('/')
    : 'Próximo Sábado';

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto animate-fadeIn">
      {/* 1. Quiet Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Painel Geral
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão do Treinamento Social • Ciclo de 4 sábados consecutivos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Fazer Chamada</span>
          </button>
          <button
            onClick={onOpenEnrollment}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Nova Matrícula</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Metrics Row */}
      <KpiCards kpis={kpis} />

      {/* 3. Empty State OR Action Cards */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Pronto para cadastrar os alunos reais
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                O banco de dados Supabase está sincronizado e pronto. Clique no botão abaixo para cadastrar a primeira matrícula (o sistema calcula as 4 datas de sábado automaticamente).
              </p>
            </div>
            <button
              onClick={onOpenEnrollment}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Primeiro Aluno</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card: Próximo Sábado Letivo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Sábado Letivo Ativo</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{saturdayDisplay}</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  Ciclo em Curso
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4 text-center">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <span className="block text-base font-black text-slate-900">{students.length}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Matriculados</span>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-100/60">
                  <span className="block text-base font-black text-emerald-700">{eligibleForCert.length}</span>
                  <span className="text-[10px] text-emerald-600 uppercase tracking-wider">100% Presença</span>
                </div>
                <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-100/60">
                  <span className="block text-base font-black text-amber-700">{pendingContact.length}</span>
                  <span className="text-[10px] text-amber-600 uppercase tracking-wider">Pendente Zap</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('attendance')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Abrir Lista de Chamada</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Card: Certificação & Assiduidade */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">Certificação Oficial (16 Horas)</h3>
                    <span className="text-[11px] text-slate-400">Regra: 100% de Presença Obrigatória</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  Carga 16h
                </span>
              </div>

              <div className="space-y-2 my-4 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <span className="text-emerald-900 font-medium">Alunos com 4 Presenças (100%):</span>
                  <strong className="text-emerald-800 font-bold">{eligibleForCert.length} alunos</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-blue-900 font-medium">Taxa Quitada / Certificado Liberado:</span>
                  <strong className="text-blue-800 font-bold">{paidCerts.length} emitidos</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('certificates')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Gerenciar Certificados</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
