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
  AlertCircle,
  MapPin
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0E1726] rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0B192C] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                Certificação Oficial • Treinamento Social
              </h2>
              <p className="text-[11px] text-slate-400">
                Visualização do documento, autenticação e validação de assiduidade
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Certificate Preview Card */}
          <div className="border-4 border-double border-amber-200 dark:border-amber-900/50 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900 p-6 rounded-2xl text-center space-y-4 shadow-inner relative">
            {/* Stamp Badge */}
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-300 dark:border-amber-700 shadow-sm">
              <Award className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                UNIBE • Formação Cívica e Cidadã
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
                CERTIFICADO OFICIAL DE CONCLUSÃO
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Certificamos que para todos os fins de direito e comprovação:
              </p>
            </div>

            <div className="py-2">
              <div className="text-base font-black text-blue-900 dark:text-blue-300 border-b-2 border-slate-300 dark:border-slate-700 pb-1 max-w-sm mx-auto">
                {student.name}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Matrícula: {student.registrationNumber}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              Concluiu com aproveitamento de <strong>100% de assiduidade</strong> o Treinamento Social Presencial (Ciclo de 4 Sábados consecutivos), perfazendo carga horária total de <strong>16 Horas de Atividades Práticas</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autenticador: <strong>{certCode}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Polo: <strong>Rua Silva Jardim, 99</strong></span>
              </div>
            </div>
          </div>

          {/* Payment & Eligibility Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block uppercase">
                Requisito de Assiduidade:
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold ${isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {presentCount} de 4 Presenças ({Math.round((presentCount / 4) * 100)}%)
                </span>
                {isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block uppercase">
                Taxa de Emissão e Registro:
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  R$ 35,00
                </span>
                {onConfirmPayment && (
                  <button
                    type="button"
                    onClick={() => onConfirmPayment(student.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                      isPaid
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isPaid ? '✓ Quitado' : 'Marcar como Pago'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Certificado PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
