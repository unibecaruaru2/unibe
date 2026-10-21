import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink, 
  FileText,
  User,
  Sparkles
} from 'lucide-react';
import { Student, WhatsAppContactStatusType } from '../types';
import { whatsappTemplates } from '../data/mockData';
import { formatPhoneNumber } from '../utils/dateUtils';

interface WhatsAppViewProps {
  students: Student[];
  onOpenWhatsApp: (student: Student) => void;
  onUpdateStatus: (studentId: string, status: WhatsAppContactStatusType) => void;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  students,
  onOpenWhatsApp,
  onUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<'todos' | WhatsAppContactStatusType>('todos');
  const [search, setSearch] = useState('');
  const [selectedTemplateTab, setSelectedTemplateTab] = useState(whatsappTemplates[0].id);

  const filteredStudents = students.filter(s => {
    if (statusFilter !== 'todos' && s.whatsappStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchGuardian = s.guardian?.name.toLowerCase().includes(q);
      if (!matchName && !matchGuardian) return false;
    }
    return true;
  });

  const countNotContacted = students.filter(s => s.whatsappStatus === 'nao_contatado').length;
  const countSent = students.filter(s => s.whatsappStatus === 'mensagem_enviada').length;
  const countConfirmed = students.filter(s => s.whatsappStatus === 'confirmado').length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Comunicação & Confirmações WhatsApp
            </h1>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Disparo com Edição Prévia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de contato ativo com responsáveis e alunos via wa.me oficial com variáveis dinâmicas
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center">
            <span className="block font-black text-slate-700">{countNotContacted}</span>
            <span className="text-[11px] text-slate-400">Não Contatados</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
            <span className="block font-black text-blue-700">{countSent}</span>
            <span className="text-[11px] text-blue-500">Enviados</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
            <span className="block font-black text-emerald-700">{countConfirmed}</span>
            <span className="text-[11px] text-emerald-500">Confirmados</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact List (70%) + Templates Viewer (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contact Queue */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-soft flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'todos' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Todos ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('nao_contatado')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'nao_contatado' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Não Contatados ({countNotContacted})
              </button>
              <button
                onClick={() => setStatusFilter('mensagem_enviada')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'mensagem_enviada' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Enviados ({countSent})
              </button>
              <button
                onClick={() => setStatusFilter('confirmado')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'confirmado' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Confirmados ({countConfirmed})
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome..."
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
                    <th className="py-3.5 px-4">Responsável & Telefone</th>
                    <th className="py-3.5 px-4 text-center">Status Contato</th>
                    <th className="py-3.5 px-5 text-right">Disparo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.map((student) => {
                    const phone = student.guardian ? student.guardian.phone : student.phone;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-900 block">{student.name}</span>
                          <span className="text-xs text-slate-400 font-mono">{student.registrationNumber}</span>
                        </td>

                        <td className="py-4 px-4 text-xs">
                          <span className="font-medium text-slate-800 block">
                            {student.guardian ? student.guardian.name : 'Próprio Aluno'}
                          </span>
                          <span className="text-slate-500 font-mono">{formatPhoneNumber(phone)}</span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                            <button
                              onClick={() => onUpdateStatus(student.id, 'nao_contatado')}
                              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                                student.whatsappStatus === 'nao_contatado' ? 'bg-slate-700 text-white' : 'text-slate-500'
                              }`}
                            >
                              Não
                            </button>
                            <button
                              onClick={() => onUpdateStatus(student.id, 'mensagem_enviada')}
                              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                                student.whatsappStatus === 'mensagem_enviada' ? 'bg-blue-600 text-white' : 'text-slate-500'
                              }`}
                            >
                              Enviada
                            </button>
                            <button
                              onClick={() => onUpdateStatus(student.id, 'confirmado')}
                              className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                                student.whatsappStatus === 'confirmado' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                              }`}
                            >
                              Confirmado
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => onOpenWhatsApp(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Abrir & Enviar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Template Library Preview */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Modelos Oficiais de Mensagem</h3>
          </div>

          <div className="space-y-2">
            {whatsappTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateTab(tpl.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                  selectedTemplateTab === tpl.id 
                    ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-950' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{tpl.title}</span>
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-[11px] font-normal text-slate-500 mt-1">{tpl.description}</p>
              </button>
            ))}
          </div>

          {/* Template Text Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono leading-relaxed text-slate-700">
            <span className="block font-bold text-slate-400 text-[10px] uppercase mb-1">Prévia do Texto:</span>
            {whatsappTemplates.find(t => t.id === selectedTemplateTab)?.text}
          </div>
        </div>
      </div>
    </div>
  );
};
