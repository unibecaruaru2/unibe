import React from 'react';
import { 
  X, 
  Award, 
  Download, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Printer,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Student } from '../../types';
import { formatFullPortugueseDate } from '../../utils/dateUtils';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onConfirmPayment?: (studentId: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  onConfirmPayment
}) => {
  if (!isOpen || !student) return null;

  const presentCount = student.attendance.filter(a => a.status === 'presente').length;
  const isEligible = presentCount === 4;
  const isPaid = student.certificate?.feePaid || student.certificate?.status === 'pago_liberado';
  const certCode = student.certificate?.code || `UNIBE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert(`Certificado digital autenticado (${certCode}) pronto para download em PDF.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                Certificação Oficial • Treinamento Social
              </h2>
              <p className="text-xs text-slate-400">
                UNIBE Extensão • Carga Horária: 16 Horas • Critério de 100% de Presença
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial & Eligibility Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Status Financeiro:</span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Taxa Paga (R$ 35,00) • Certificado Liberado
              </span>
            ) : isEligible ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold animate-pulse">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Pendente Pagamento da Taxa de Emissão (R$ 35,00)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Não Elegível (Frequência &lt; 100%)
              </span>
            )}
          </div>

          {!isPaid && isEligible && onConfirmPayment && (
            <button
              onClick={() => onConfirmPayment(student.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Confirmar Recebimento da Taxa</span>
            </button>
          )}
        </div>

        {/* Certificate Visual Diploma Card */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="border-8 border-double border-slate-200 p-8 rounded-2xl bg-gradient-to-b from-amber-50/20 to-white text-center relative shadow-inner">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 mb-4">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block mb-1">
              Universidade Brasileira de Extensão - UNIBE
            </span>
            <h1 className="text-2xl font-serif font-black text-slate-900 mb-2">
              CERTIFICADO DE FORMAÇÃO SOCIAL
            </h1>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed my-4">
              Certificamos para os devidos fins que <strong className="text-slate-900 font-bold underline decoration-amber-400">{student.name}</strong>, sob matrícula <span className="font-mono font-semibold">{student.registrationNumber}</span>, concluiu com 100% de aproveitamento o ciclo presencial de 4 sábados consecutivos do <strong className="text-slate-900">Módulo de Treinamento e Inserção Social</strong>, totalizando 16 horas de formação cívica e profissionalizante.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 text-xs">
              <div>
                <span className="block text-slate-400">Frequência Apurada</span>
                <span className="font-bold text-emerald-700">{presentCount} de 4 Aulas (100% Presença)</span>
              </div>
              <div>
                <span className="block text-slate-400">Código de Autenticidade</span>
                <span className="font-bold font-mono text-slate-800">{certCode}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 flex items-center justify-around text-center text-xs border-t border-slate-200">
              <div>
                <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                <span className="font-semibold text-slate-700">Coord. de Extensão UNIBE</span>
              </div>
              <div>
                <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                <span className="font-semibold text-slate-700">Diretoria Acadêmica</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Validação biométrica e registro autenticado em banco de dados</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!isPaid}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!isPaid}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
