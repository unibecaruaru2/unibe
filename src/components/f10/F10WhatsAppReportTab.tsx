import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Filter, 
  ShieldAlert, 
  CalendarCheck2, 
  UserMinus, 
  AlertTriangle, 
  UserX, 
  CheckCircle, 
  Smartphone, 
  Edit3
} from 'lucide-react';
import { MatriculaAcademicaF10, RegimeFinanceiro } from '../../types/f10';
import { FilterQuadrantOption } from './F10FilterBar';
import { 
  generateWhatsAppExecutiveReport, 
  formatStudentReportLine
} from '../../utils/f10WhatsAppReports';

interface F10WhatsAppReportTabProps {
  matriculas: MatriculaAcademicaF10[];
  selectedQuadrant: FilterQuadrantOption;
  onSelectQuadrant: (q: FilterQuadrantOption) => void;
  selectedTurma: string;
  onSelectTurma: (t: string) => void;
  selectedRegime: 'TODOS' | RegimeFinanceiro;
  onSelectRegime: (r: 'TODOS' | RegimeFinanceiro) => void;
  selectedUnidade?: string;
  onSelectUnidade?: (u: string) => void;
  availableUnidades?: string[];
  availableTurmas: string[];
  periodoReferencia: string;
  onSaveRetention: (contrato: string, actionType: string, notes: string) => Promise<void>;
  onTriggerToast: (msg: string) => void;
}

export const F10WhatsAppReportTab: React.FC<F10WhatsAppReportTabProps> = ({
  matriculas,
  selectedQuadrant,
  onSelectQuadrant,
  selectedTurma,
  onSelectTurma,
  selectedRegime,
  onSelectRegime,
  selectedUnidade = 'Caruaru',
  availableTurmas,
  periodoReferencia,
  onSaveRetention,
  onTriggerToast
}) => {
  // Configurações de Formatação
  const [nameDisplay, setNameDisplay] = useState<'FIRST_NAME' | 'FULL_NAME' | 'NONE'>('FIRST_NAME');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [customHeaderTitle, setCustomHeaderTitle] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Edição rápida de observação/tratativa inline
  const [editingContrato, setEditingContrato] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Mapeamento das Abas com Labels e Ícones
  const tabDefs: Array<{
    id: FilterQuadrantOption;
    label: string;
    icon: any;
    reportTitle: string;
  }> = [
    { 
      id: 'INADIMPLENTES_TODOS', 
      label: 'Inadimplentes (Geral)', 
      icon: ShieldAlert,
      reportTitle: 'Relatório de Inadimplentes F10 (Geral)'
    },
    { 
      id: 'Q1_OVERDUE_ATTENDING', 
      label: 'Em Aula c/ Débito', 
      icon: CalendarCheck2,
      reportTitle: 'Alunos Frequentes em Aula com Débito (Recuperação Prioritária)'
    },
    { 
      id: 'Q1_OVERDUE_ABSENT', 
      label: 'Ausente c/ Débito', 
      icon: UserMinus,
      reportTitle: 'Alunos Ausentes com Débito Vencido (Risco Duplo)'
    },
    { 
      id: 'Q3_WAITING_CANCEL', 
      label: 'Fila de Retenção', 
      icon: UserX,
      reportTitle: 'Fila de Retenção - Solicitações de Cancelamento'
    },
    { 
      id: 'Q2_ABSENT_CHURN', 
      label: 'Risco Evasão (≥3 Faltas)', 
      icon: AlertTriangle,
      reportTitle: 'Alunos em Risco Crítico de Evasão (≥3 Faltas)'
    },
    { 
      id: 'SEM_APP', 
      label: 'Sem App Smart', 
      icon: Smartphone,
      reportTitle: 'Alunos Sem Cadastro no App Smart Aluno'
    },
    { 
      id: 'Q4_REGULAR', 
      label: 'Regular / Saudável', 
      icon: CheckCircle,
      reportTitle: 'Alunos em Situação Regular e Saudável'
    },
    { 
      id: 'TODOS', 
      label: 'Todos os Alunos', 
      icon: Filter,
      reportTitle: 'Relatório Geral Consolidado de Matrículas'
    }
  ];

  const activeTabDef = tabDefs.find(t => t.id === selectedQuadrant) || tabDefs[0];

  const filteredList = useMemo(() => {
    return matriculas.filter(m => {
      if (selectedQuadrant !== 'TODOS') {
        if (selectedQuadrant === 'INADIMPLENTES_TODOS') {
          if (m.valorVencidoNum <= 0) return false;
        } else if (selectedQuadrant === 'SEM_APP') {
          if (m.hasAppActive) return false;
        } else if (m.quadranteRisco !== selectedQuadrant) {
          return false;
        }
      }

      if (selectedRegime !== 'TODOS' && m.regime !== selectedRegime) {
        return false;
      }

      if (selectedTurma !== 'TODOS' && !m.turmasCanonicas.includes(selectedTurma)) {
        return false;
      }

      return true;
    });
  }, [matriculas, selectedQuadrant, selectedRegime, selectedTurma]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tabDefs.forEach(t => {
      counts[t.id] = matriculas.filter(m => {
        if (t.id === 'TODOS') return true;
        if (t.id === 'INADIMPLENTES_TODOS') return m.valorVencidoNum > 0;
        if (t.id === 'SEM_APP') return !m.hasAppActive;
        return m.quadranteRisco === t.id;
      }).length;
    });
    return counts;
  }, [matriculas]);

  const totalDebito = useMemo(() => {
    return filteredList.reduce((acc, m) => acc + (m.valorVencidoNum || 0), 0);
  }, [filteredList]);

  const generatedWhatsAppText = useMemo(() => {
    const finalTitle = customHeaderTitle.trim() || activeTabDef.reportTitle;
    return generateWhatsAppExecutiveReport({
      matriculas: filteredList,
      tabTitle: finalTitle,
      unidade: selectedUnidade,
      periodoReferencia,
      filterTurma: selectedTurma,
      filterRegime: selectedRegime,
      options: {
        includeExecutiveSummary: includeSummary,
        nameDisplay
      }
    });
  }, [filteredList, activeTabDef, customHeaderTitle, selectedUnidade, periodoReferencia, selectedTurma, selectedRegime, includeSummary, nameDisplay]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedWhatsAppText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedWhatsAppText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      onTriggerToast('✅ Relatório copiado para o WhatsApp com sucesso!');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error(e);
      onTriggerToast('⚠️ Selecione o texto e use Ctrl+C para copiar.');
    }
  };

  const handleStartEditNote = (mat: MatriculaAcademicaF10) => {
    setEditingContrato(mat.contrato);
    setTempNote(mat.tratativaNotas || '');
  };

  const handleSaveQuickNote = async (contrato: string) => {
    setIsSavingNote(true);
    try {
      await onSaveRetention(contrato, 'RELATORIO_WHATSAPP', tempNote);
      setEditingContrato(null);
      onTriggerToast(`Observação do contrato #${contrato} atualizada!`);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Header Executivo */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-900/60">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Gerador de Relatórios Executivos para WhatsApp
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Direto & Sem Ruído
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relatórios formatados prontos para colar nas conversas com a diretoria e coordenação
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
            isCopied 
              ? 'bg-emerald-600 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{isCopied ? 'Copiado para WhatsApp!' : 'Copiar Relatório da Aba'}</span>
        </button>
      </div>

      {/* 2. Seleção de Categoria & Opções */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Selecione a Categoria para Gerar:
          </span>
          <span className="text-xs font-medium text-slate-400">
            {filteredList.length} registros
          </span>
        </div>

        {/* Grade de Categorias */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tabDefs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedQuadrant === tab.id;
            const count = tabCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectQuadrant(tab.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-2xs font-semibold'
                    : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-400'}`} />
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isSelected 
                      ? 'bg-white/20 dark:bg-black/10' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="text-xs leading-tight line-clamp-1 mt-0.5">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filtros e Ajuste de Formatação */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Turma */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Turma:</span>
              <select
                value={selectedTurma}
                onChange={(e) => onSelectTurma(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="TODOS">Todas as Turmas</option>
                {availableTurmas.map(t => (
                  <option key={`report-turma-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Regime */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Regime:</span>
              <select
                value={selectedRegime}
                onChange={(e) => onSelectRegime(e.target.value as any)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="TODOS">Todos os Regimes</option>
                <option value="QUITADO">À Vista / SAV</option>
                <option value="CARNE_MENSALISTA">Carnê Mensalista</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Exibição de Nome */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setNameDisplay('FIRST_NAME')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  nameDisplay === 'FIRST_NAME' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                CTR + Nome Curto
              </button>
              <button
                type="button"
                onClick={() => setNameDisplay('NONE')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  nameDisplay === 'NONE' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Apenas Contrato
              </button>
              <button
                type="button"
                onClick={() => setNameDisplay('FULL_NAME')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  nameDisplay === 'FULL_NAME' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Nome Completo
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Resumo no Topo</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Prévia do WhatsApp + Editor Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Preview WhatsApp */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Prévia Formatada da Mensagem:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-xl p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto select-all border border-slate-200/70 dark:border-slate-800">
            {generatedWhatsAppText}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>{filteredList.length} linhas geradas</span>
            {totalDebito > 0 && (
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Débito: R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>

        {/* Editor Rápido de Notas */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Personalizar Notas por Aluno
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Clique para editar
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Adicione observações manuais que substituirão a linha automática no relatório final.
          </p>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredList.map((mat) => {
              const isEditing = editingContrato === mat.contrato;
              const hasCustomNote = Boolean(mat.tratativaNotas?.trim());

              return (
                <div 
                  key={mat.id}
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    isEditing 
                      ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-400' 
                      : hasCustomNote 
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40' 
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                        <span className="font-mono bg-slate-200/80 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">
                          CTR {mat.contrato}
                        </span>
                        <span className="line-clamp-1">{mat.alunoNome}</span>
                      </div>
                      
                      {!isEditing && (
                        <p className={`mt-1 text-[11px] leading-snug ${
                          hasCustomNote 
                            ? 'text-amber-800 dark:text-amber-300 font-medium italic' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {hasCustomNote ? `"${mat.tratativaNotas}"` : formatStudentReportLine(mat, { nameDisplay: 'NONE' }).replace(`${mat.contrato} - `, '')}
                        </p>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(mat)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-[10px] font-medium cursor-pointer shrink-0 transition-colors"
                      >
                        {hasCustomNote ? 'Editar' : '+ Nota'}
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-2 space-y-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                      <textarea
                        rows={2}
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Ex: ELE FOI BOLSA E ESTÁ COM PARCELA DEVENDO..."
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingContrato(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveQuickNote(mat.contrato)}
                          disabled={isSavingNote}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {isSavingNote ? 'Salvando...' : 'Salvar Nota'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
