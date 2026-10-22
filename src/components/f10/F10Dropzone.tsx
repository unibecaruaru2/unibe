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
  FileSpreadsheet,
  Building2,
  Plus,
  X
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
  availableUnidades?: string[];
  currentUnidade?: string;
}

export const F10Dropzone: React.FC<F10DropzoneProps> = ({
  onParsed,
  isProcessing,
  setIsProcessing,
  activeFileName = 'MATRÍCULAS DOS ÚLTIMOS 6 MESES (ABRIL – OUTUBRO).pdf',
  totalMatriculas = 110,
  availableUnidades = ['Caruaru'],
  currentUnidade = 'Caruaru'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(activeFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Modal de Seleção de Unidade
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [selectedTargetUnidade, setSelectedTargetUnidade] = useState<string>(currentUnidade || 'Caruaru');
  const [isTypingNewUnidade, setIsTypingNewUnidade] = useState(false);
  const [newUnidadeInput, setNewUnidadeInput] = useState('');

  // Ao receber arquivo, abre o modal para confirmar a unidade
  const handleInitiateFileImport = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Por favor, envie um arquivo no formato PDF gerado pelo ERP F10.');
      return;
    }

    setErrorMessage(null);
    setPendingFile(file);
    setSelectedTargetUnidade(currentUnidade === 'TODAS' ? 'Caruaru' : (currentUnidade || 'Caruaru'));
    setIsTypingNewUnidade(false);
    setNewUnidadeInput('');
    setIsUnitModalOpen(true);
  };

  const handleConfirmAndProcess = async () => {
    if (!pendingFile) return;

    let finalUnidade = selectedTargetUnidade.trim();
    if (isTypingNewUnidade) {
      if (!newUnidadeInput.trim()) {
        setErrorMessage('Por favor, digite o nome da nova unidade escolar.');
        return;
      }
      finalUnidade = newUnidadeInput.trim();
    }

    setIsUnitModalOpen(false);
    setIsProcessing(true);
    setCurrentFileName(pendingFile.name);

    try {
      const result = await parseF10ReportPdf(pendingFile, { unidade: finalUnidade });
      onParsed(result);
      setIsExpanded(false);
      setPendingFile(null);
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
      handleInitiateFileImport(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleInitiateFileImport(e.target.files[0]);
    }
    // Reseta o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onParsed({
        matriculas: SAMPLE_F10_MATRICULAS,
        periodoReferencia: 'Matrículas de 01/10/2026 a 21/10/2026',
        unidade: 'Caruaru',
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
              Processamento em 3 páginas com costura horizontal e segmentação por unidade escolar
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
                Suporte automático a múltiplas escolas e filiais. Ao carregar o PDF, você selecionará a unidade correspondente.
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

      {/* MODAL DE SELEÇÃO DE UNIDADE AO IMPORTAR PDF */}
      {isUnitModalOpen && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E1726] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    De qual unidade é este relatório?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Arquivo: <span className="font-semibold text-blue-600 dark:text-blue-400">{pendingFile.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUnitModalOpen(false);
                  setPendingFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Selecione a escola/filial para vincular essas matrículas. Os dados serão isolados e integrados sem misturar com outras escolas.
            </p>

            {/* Pílulas de Unidades Existentes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Unidades Cadastradas:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableUnidades.filter(u => u !== 'TODAS').map((u) => {
                  const isSelected = !isTypingNewUnidade && selectedTargetUnidade.toLowerCase() === u.toLowerCase();
                  return (
                    <button
                      key={`modal-unit-${u}`}
                      type="button"
                      onClick={() => {
                        setSelectedTargetUnidade(u);
                        setIsTypingNewUnidade(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{u}</span>
                    </button>
                  );
                })}

                {/* Botão de Digitar Nova Unidade */}
                <button
                  type="button"
                  onClick={() => setIsTypingNewUnidade(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isTypingNewUnidade
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-dashed border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Outra Escola / Nova Unidade</span>
                </button>
              </div>
            </div>

            {/* Campo de Entrada de Nova Unidade */}
            {isTypingNewUnidade && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome da Nova Unidade / Escola:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newUnidadeInput}
                  onChange={(e) => setNewUnidadeInput(e.target.value)}
                  placeholder="Ex: Recife, Petrolina, Garanhuns..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-blue-400 dark:border-blue-600 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>
            )}

            {/* Ações do Modal */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsUnitModalOpen(false);
                  setPendingFile(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAndProcess}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Confirmar e Processar PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};