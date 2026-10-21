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
  FileCheck
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
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quadro Oficial de Certificação
            </h1>
            <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              Carga Horária: 16 Horas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de elegibilidade estrita (100% de assiduidade em 4 aulas) e registro manual de quitação da taxa
          </p>
        </div>

        {/* Informative Rule Badge */}
        <div className="bg-slate-900 text-white rounded-xl p-3 text-xs max-w-sm">
          <span className="font-bold text-amber-400 block mb-0.5">Critério Inviolável de Certificação:</span>
          <span className="text-slate-300 text-[11px] leading-tight block">
            Apenas alunos com <strong>4 presenças nas 4 aulas</strong> são elegíveis. Qualquer falta desclassifica automaticamente o aluno.
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('todos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'todos' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilterTab('aptos')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'aptos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            100% Presença ({totalAptos})
          </button>
          <button
            onClick={() => setFilterTab('pendente_pagamento')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'pendente_pagamento' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Taxa Pendente ({totalPendentes})
          </button>
          <button
            onClick={() => setFilterTab('pago_liberado')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'pago_liberado' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pago / Liberado ({totalPagos})
          </button>
          <button
            onClick={() => setFilterTab('nao_elegivel')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'nao_elegivel' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Não Elegíveis ({totalInaptos})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aluno..."
            className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white w-44"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Aluno & Matrícula</th>
                <th className="py-3.5 px-4 text-center">Frequência Apurada</th>
                <th className="py-3.5 px-4 text-center">Status de Elegibilidade</th>
                <th className="py-3.5 px-4 text-center">Controle da Taxa (R$ 35,00)</th>
                <th className="py-3.5 px-4">Código do Certificado</th>
                <th className="py-3.5 px-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((student) => {
                const absences = student.attendance.filter(a => a.status === 'falta').length;
                const presences = student.attendance.filter(a => a.status === 'presente').length;
                const is100 = presences === 4 && absences === 0;
                const isPaid = student.certificate.feePaid;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-900 block">{student.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{student.registrationNumber}</span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block font-bold text-xs px-2.5 py-1 rounded-lg ${
                        is100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {presences} de 4 Aulas ({is100 ? '100%' : `${Math.round((presences / 4) * 100)}%`})
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {absences > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                          <span>Não Elegível ({absences} Falta)</span>
                        </span>
                      ) : is100 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>100% Elegível</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Em Andamento
                        </span>
                      )}
                    </td>

                    {/* Simple Payment Toggle (Zero complication, pure organization) */}
                    <td className="py-4 px-4 text-center">
                      {is100 ? (
                        <button
                          type="button"
                          onClick={() => onToggleFeePayment(student.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 animate-pulse'
                          }`}
                          title="Clique para alternar o status do pagamento da taxa"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isPaid ? 'Taxa Paga (Confirmada)' : 'Pendente Pagamento'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    {/* Certificate Code */}
                    <td className="py-4 px-4 text-xs font-mono">
                      {isPaid && is100 ? (
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {student.certificate.code || 'UNIBE-CERT-98421'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Disponível após quitação</span>
                      )}
                    </td>

                    {/* View Certificate */}
                    <td className="py-4 px-5 text-right">
                      {is100 ? (
                        <button
                          onClick={() => onOpenCertificate(student)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isPaid
                              ? 'bg-[#0B192C] hover:bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isPaid ? 'Ver Certificado' : 'Prévia'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
