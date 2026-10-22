import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { parseF10ReportPdf } from '../../services/f10Parser';
import { SAMPLE_F10_MATRICULAS } from '../../data/mockF10Data';
import { F10ParseResult } from '../../types/f10';

interface F10DropzoneProps {
  onParsed: (result: F10ParseResult) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  activeFileName?: string;
  totalMatriculas?: number;
}

export const F10Dropzone: React.FC<F10DropzoneProps> = ({
  onParsed,
  isProcessing,
  setIsProcessing,
  activeFileName = 'MATRÍCULAS DOS ÚLTIMOS 6 MESES (ABRIL – OUTUBRO).pdf',
  totalMatriculas = 110
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(activeFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Por favor, envie um arquivo no formato PDF gerado pelo ERP F10.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentFileName(file.name);

    try {
      const result = await parseF10ReportPdf(file);
      onParsed(result);
      setIsExpanded(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Falha ao processar o PDF do F10.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onParsed({
        matriculas: SAMPLE_F10_MATRICULAS,
        periodoReferencia: 'Matrículas de 01/10/2026 a 21/10/2026',
        totalRegistros: SAMPLE_F10_MATRICULAS.length
      });
      setCurrentFileName('MATRÍCULAS DOS ÚLTIMOS 6 MESES (ABRIL – OUTUBRO).pdf');
      setIsProcessing(false);
      setIsExpanded(false);
    }, 300);
  };

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Barra Compacta Inteligente (Sempre visível sem empurrar a tela) */}
      <div className="p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/60">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Relatório F10 Carregado:
              </span>
              <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/60">
                {currentFileName}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {totalMatriculas} alunos
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Processamento em 3 páginas com costura horizontal (Contratos, Telefones, Bairros e Financeiro)
            </p>
          </div>
        </div>

        {/* Controles de Ação do Relatório */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recarregar Amostra F10</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Ocultar Área de Upload' : 'Substituir PDF F10'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Painel Expansível de Drag & Drop */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 animate-in fade-in duration-150">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 scale-[1.005]'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-white dark:bg-slate-900/60'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              {isProcessing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isProcessing ? 'Extraindo dados com costura horizontal...' : 'Arraste e solte o novo relatório em PDF do F10 aqui'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Suporte automático a relatórios em 3 páginas (Pág 1 Contratos/Turmas, Pág 2 Telefones/Bairros, Pág 3 Financeiro F10).
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 underline">
                ou selecione do computador
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};