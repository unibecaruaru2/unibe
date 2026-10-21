import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  ShieldAlert, 
  CreditCard, 
  Search, 
  Printer, 
  Download,
  AlertCircle,
  FileCheck,
  MapPin,
  Shirt
} from 'lucide-react';
import { Student } from '../types';

interface CertificatesViewProps {
  students: Student[];
  onOpenCertificate: (student: Student) => void;
  onToggleFeePayment: (studentId: string) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  students,
  onOpenCertificate,
  onToggleFeePayment
}) => {
  const [filterTab, setFilterTab] = useState<'todos' | 'aptos' | 'pendente_pagamento' | 'pago_liberado' | 'nao_elegivel'>('todos');
  const [search, setSearch] = useState('');

  const filtered = students.filter(student => {
    const absences = student.attendance.filter(a => a.status === 'falta').length;
    const presences = student.attendance.filter(a => a.status === 'presente').length;
    const is100 = presences === 4 && absences === 0;

    if (search) {
      const q = search.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchReg = student.registrationNumber.toLowerCase().includes(q);
      if (!matchName && !matchReg) return false;
    }

    if (filterTab === 'aptos') return is100;
    if (filterTab === 'pendente_pagamento') return is100 && !student.certificate.feePaid;
    if (filterTab === 'pago_liberado') return is100 && student.certificate.feePaid;
    if (filterTab === 'nao_elegivel') return absences > 0 || student.certificate.status === 'nao_elegivel';

    return true;
  });

  const totalAptos = students.filter(s => s.attendance.filter(a => a.status === 'presente').length === 4).length;
  const totalPagos = students.filter(s => s.certificate.feePaid && s.attendance.filter(a => a.status === 'presente').length === 4).length;
  const totalPendentes = totalAptos - totalPagos;
  const totalInaptos = students.filter(s => s.attendance.filter(a => a.status === 'falta').length > 0).length;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Certificação Oficial (16 Horas)
            </h1>
            <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
              Assiduidade 100% Obrigatória
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Polo Oficial: Rua Silva Jardim, 99 • Taxa de Emissão e Registro: R$ 35,00</span>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-emerald-700 dark:text-emerald-400">{totalAptos}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500">100% Presença</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-blue-700 dark:text-blue-400">{totalPagos}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-500">Taxa Paga</span>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-rose-700 dark:text-rose-400">{totalInaptos}</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-500">Com Faltas</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold flex-wrap">
          <button
            onClick={() => setFilterTab('todos')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
              filterTab === 'todos' ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterTab('aptos')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
              filterTab === 'aptos' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Aptos 100% ({totalAptos})
          </button>
          <button
            onClick={() => setFilterTab('pago_liberado')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
              filterTab === 'pago_liberado' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Quitados ({totalPagos})
          </button>
          <button
            onClick={() => setFilterTab('pendente_pagamento')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
              filterTab === 'pendente_pagamento' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pendente Taxa ({totalPendentes})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar aluno ou matrícula..."
            className="w-full pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Aluno / Matrícula</th>
                <th className="py-2.5 px-3">Presenças (4 Aulas)</th>
                <th className="py-2.5 px-3">Elegibilidade</th>
                <th className="py-2.5 px-3">Taxa R$ 35,00</th>
                <th className="py-2.5 px-3">Código Autenticação</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Nenhum certificado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const presences = student.attendance.filter(a => a.status === 'presente').length;
                  const absences = student.attendance.filter(a => a.status === 'falta').length;
                  const is100 = presences === 4 && absences === 0;
                  const isPaid = student.certificate?.feePaid;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-200 dark:border-amber-900/40">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {student.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {presences} de 4
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({Math.round((presences / 4) * 100)}%)
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          is100
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                            : absences > 0
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {is100 ? '✓ Apto Oficial' : absences > 0 ? 'Inapto (Falta)' : 'Em Andamento'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => onToggleFeePayment(student.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {isPaid ? 'Quitado' : 'Pendente (Clique p/ Pagar)'}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {student.certificate?.code || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenCertificate(student)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Ver Diploma</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
