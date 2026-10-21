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
  Sparkles,
  MapPin,
  Shirt,
  Copy,
  Check
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
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

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

  const currentTemplate = whatsappTemplates.find(t => t.id === selectedTemplateTab) || whatsappTemplates[0];

  const handleCopyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Comunicação WhatsApp Oficial
            </h1>
            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              wa.me Oficial
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Rua Silva Jardim, 99</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 font-medium">
              <Shirt className="w-3.5 h-3.5 text-rose-500" />
              <span>Calça, sapato fechado e blusa vermelha ou branca</span>
            </span>
          </div>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-slate-700 dark:text-slate-200">{countNotContacted}</span>
            <span className="text-[10px] text-slate-400">Pendentes</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-blue-700 dark:text-blue-300">{countSent}</span>
            <span className="text-[10px] text-blue-500 dark:text-blue-400">Enviados</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-2.5 py-1.5 text-center">
            <span className="block font-black text-emerald-700 dark:text-emerald-300">{countConfirmed}</span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400">Confirmados</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact List + Templates Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column: Contact Queue */}
        <div className="lg:col-span-8 space-y-3">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#0E1726] rounded-xl p-3 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  statusFilter === 'todos' ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Todos ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('nao_contatado')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  statusFilter === 'nao_contatado' ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Pendentes ({countNotContacted})
              </button>
              <button
                onClick={() => setStatusFilter('confirmado')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  statusFilter === 'confirmado' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Confirmados ({countConfirmed})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar responsável ou aluno..."
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Student Contact Cards */}
          <div className="bg-white dark:bg-[#0E1726] rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                Nenhum contato encontrado.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const targetPhone = student.guardian ? student.guardian.phone : student.phone;
                const contactName = student.guardian ? `${student.guardian.name} (${student.guardian.relationship})` : student.name;

                return (
                  <div key={student.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {student.registrationNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Destinatário: <strong className="text-slate-700 dark:text-slate-300">{contactName}</strong></span>
                          <span>•</span>
                          <span className="font-mono">{formatPhoneNumber(targetPhone)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        student.whatsappStatus === 'confirmado'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                          : student.whatsappStatus === 'mensagem_enviada'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {student.whatsappStatus === 'confirmado' ? '✓ Confirmado' : student.whatsappStatus === 'mensagem_enviada' ? 'Enviado' : 'Pendente'}
                      </span>

                      <button
                        onClick={() => onOpenWhatsApp(student)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Abrir Mensagem</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Templates Viewer */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0E1726] rounded-xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Modelos Institucionais
            </h3>
            <button
              onClick={() => handleCopyTemplate(currentTemplate.text, currentTemplate.id)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              {copiedTemplate === currentTemplate.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTemplate === currentTemplate.id ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div className="space-y-1">
            {whatsappTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplateTab(tpl.id)}
                className={`w-full text-left p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer block truncate ${
                  selectedTemplateTab === tpl.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar">
            {currentTemplate.text}
          </div>
        </div>
      </div>
    </div>
  );
};
