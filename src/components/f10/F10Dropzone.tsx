import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { parseF10ReportPdf } from '../../services/f10Parser';
import { SAMPLE_F10_MATRICULAS } from '../../data/mockF10Data';
import { F10ParseResult } from '../../types/f10';

interface F10DropzoneProps {
  onParsed: (result: F10ParseResult) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export const F10Dropzone: React.FC<F10DropzoneProps> = ({
  onParsed,
  isProcessing,
  setIsProcessing
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Por favor, envie um arquivo no formato PDF gerado pelo F10.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setLastUploadedName(file.name);

    try {
      const result = await parseF10ReportPdf(file);
      onParsed(result);
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
      setLastUploadedName('Relatorio_Matriculas_Outubro_F10.pdf');
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 scale-[1.005]'
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 bg-slate-50/60 dark:bg-slate-900/40'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-xs">
          {isProcessing ? (
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {isProcessing
            ? 'Extraindo e costurando colunas do relatório F10...'
            : 'Arraste o relatório em PDF do ERP F10'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Suporte completo a relatórios amplos em 3 páginas (Contratos, Telefones e Bairros com costura horizontal automática).
        </p>

        {isProcessing && (
          <div className="w-full max-w-xs mt-4">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 block font-medium">
              Processando client-side via PDF.js...
            </span>
          </div>
        )}

        {!isProcessing && lastUploadedName && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Arquivo carregado: {lastUploadedName}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Botão de Demonstração / Amostra Real */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quer testar com os dados reais do relatório F10 anexado?</span>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          disabled={isProcessing}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Carregar Amostra Real F10 (12 Matrículas)</span>
        </button>
      </div>
    </div>
  );
};
