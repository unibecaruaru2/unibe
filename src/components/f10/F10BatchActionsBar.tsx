import React from 'react';
import { 
  X, 
  MessageSquare, 
  Download, 
  Copy
} from 'lucide-react';

interface F10BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchWhatsApp: () => void;
  onBatchExportCsv: () => void;
  onBatchCopyReport?: () => void;
}

export const F10BatchActionsBar: React.FC<F10BatchActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchWhatsApp,
  onBatchExportCsv,
  onBatchCopyReport
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[11px] font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-slate-200">
          {selectedCount === 1 ? 'aluno selecionado' : 'alunos selecionados'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        {onBatchCopyReport && (
          <button
            type="button"
            onClick={onBatchCopyReport}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Copiar relatório formatado dos alunos selecionados para o WhatsApp"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>Copiar WhatsApp</span>
          </button>
        )}

        <button
          type="button"
          onClick={onBatchWhatsApp}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Cobrança em Lote</span>
        </button>

        <button
          type="button"
          onClick={onBatchExportCsv}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
        title="Desmarcar seleção"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
