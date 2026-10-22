import React from 'react';
import { 
  CheckSquare, 
  X, 
  MessageSquare, 
  Download, 
  ShieldAlert,
  Sparkles,
  Copy
} from 'lucide-react';
import { MatriculaAcademicaF10 } from '../../types/f10';

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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </div>
        <span className="text-xs font-medium text-slate-200">
          {selectedCount === 1 ? 'aluno selecionado' : 'alunos selecionados'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onBatchCopyReport && (
          <button
            type="button"
            onClick={onBatchCopyReport}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Copiar relatório formatado dos alunos selecionados para o WhatsApp"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar p/ WhatsApp</span>
          </button>
        )}

        <button
          type="button"
          onClick={onBatchWhatsApp}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Cobrança em Lote</span>
        </button>

        <button
          type="button"
          onClick={onBatchExportCsv}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
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