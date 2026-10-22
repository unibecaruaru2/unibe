import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Building2,
  ChevronDown,
  X,
  FileUp,
  FolderOpen
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
  const [isModalUploadOpen, setIsModalUploadOpen] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(activeFileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do Modal de Seleção de Unidade
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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

    setIsProcessing(true);
    setCurrentFileName(pendingFile.name);

    try {
      const result = await parseF10ReportPdf(pendingFile, { unidade: finalUnidade });
      onParsed(result);
      setIsModalUploadOpen(false);
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
      setIsModalUploadOpen(false);
    }, 250);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Faixa Informativa Slim e Integrada do Arquivo Ativo */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-2 truncate">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Relatório Ativo:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
              {currentFileName}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
              <CheckCircle2 className="w-3 h-3" />
              {totalMatriculas} registros
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isProcessing}
            className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Recarregar dados originais de amostra do F10"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Amostra Padrão</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalUploadOpen(true)}
            className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Substituir PDF F10</span>
          </button>
        </div>
      </div>

      {/* Modal Limpo de Upload de Arquivo e Segmentação de Unidade */}
      {isModalUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/60">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Importar Relatório PDF F10
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Processamento com costura horizontal inteligente de páginas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalUploadOpen(false);
                  setPendingFile(null);
                  setErrorMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Arquivo / Dropzone */}
            {!pendingFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-3">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Arraste o relatório PDF do F10 aqui
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ou clique para selecionar do computador
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {pendingFile.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {(pendingFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingFile(null)}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Trocar arquivo
                  </button>
                </div>

                {/* Seletor de Unidade Escolar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vincular à Unidade Escolar:</span>
                  </label>
                  
                  {!isTypingNewUnidade ? (
                    <div className="space-y-2">
                      <select
                        value={selectedTargetUnidade}
                        onChange={(e) => {
                          if (e.target.value === '__NEW__') {
                            setIsTypingNewUnidade(true);
                          } else {
                            setSelectedTargetUnidade(e.target.value);
                          }
                        }}
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none font-medium"
                      >
                        {availableUnidades.map((u) => (
                          <option key={`opt-modal-u-${u}`} value={u}>{u}</option>
                        ))}
                        <option value="__NEW__">+ Cadastrar Nova Unidade...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUnidadeInput}
                        onChange={(e) => setNewUnidadeInput(e.target.value)}
                        placeholder="Nome da unidade (ex: Caruaru, Recife...)"
                        className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsTypingNewUnidade(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 cursor-pointer"
                      >
                        Voltar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalUploadOpen(false);
                  setPendingFile(null);
                  setErrorMessage(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmAndProcess}
                disabled={!pendingFile || isProcessing}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isProcessing ? 'Processando PDF...' : 'Importar Matrículas'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
