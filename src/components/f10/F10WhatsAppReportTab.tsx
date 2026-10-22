import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Send, 
  Filter, 
  ShieldAlert, 
  CalendarCheck2, 
  UserMinus, 
  AlertTriangle, 
  UserX, 
  CheckCircle, 
  Smartphone, 
  Sparkles, 
  Settings2, 
  ExternalLink,
  Edit3,
  Save,
  CheckCircle2,
  Users
} from 'lucide-react';
import { MatriculaAcademicaF10, RegimeFinanceiro } from '../../types/f10';
import { FilterQuadrantOption } from './F10FilterBar';
import { 
  generateWhatsAppExecutiveReport, 
  WhatsAppReportOptions,
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
  onSelectUnidade,
  availableUnidades = ['Caruaru'],
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
      label: 'Em Aula (Frequente e Devendo)', 
      icon: CalendarCheck2,
      reportTitle: 'Alunos Frequentes em Aula com Débito (Recuperação Prioritária)'
    },
    { 
      id: 'Q1_OVERDUE_ABSENT', 
      label: 'Ausente com Débito (Risco Duplo)', 
      icon: UserMinus,
      reportTitle: 'Alunos Ausentes com Débito Vencido (Risco Duplo)'
    },
    { 
      id: 'Q3_WAITING_CANCEL', 
      label: 'Fila de Retenção (Cancelamento)', 
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
      label: 'Sem App Smart Aluno', 
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

  // Filtra as matrículas conforme a aba e seletores ativos
  const activeTabDef = tabDefs.find(t => t.id === selectedQuadrant) || tabDefs[0];

  const filteredList = useMemo(() => {
    return matriculas.filter(m => {
      // Filtro de Quadrante / Categoria
      if (selectedQuadrant !== 'TODOS') {
        if (selectedQuadrant === 'INADIMPLENTES_TODOS') {
          if (m.valorVencidoNum <= 0) return false;
        } else if (selectedQuadrant === 'SEM_APP') {
          if (m.hasAppActive) return false;
        } else if (m.quadranteRisco !== selectedQuadrant) {
          return false;
        }
      }

      // Filtro de Regime
      if (selectedRegime !== 'TODOS' && m.regime !== selectedRegime) {
        return false;
      }

      // Filtro de Turma
      if (selectedTurma !== 'TODOS' && !m.turmasCanonicas.includes(selectedTurma)) {
        return false;
      }

      return true;
    });
  }, [matriculas, selectedQuadrant, selectedRegime, selectedTurma]);

  // Contadores rápidos por aba para badges
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

  // Total de débito da seleção
  const totalDebito = useMemo(() => {
    return filteredList.reduce((acc, m) => acc + (m.valorVencidoNum || 0), 0);
  }, [filteredList]);

  // Gera o texto para o WhatsApp em tempo real
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

  // Copia para área de transferência com fallback
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
      onTriggerToast('✅ Relatório copiado! Pronto para colar no WhatsApp dos seus superiores.');
      setTimeout(() => setIsCopied(false), 2500);
    } catch (e) {
      console.error(e);
      onTriggerToast('⚠️ Não foi possível copiar automaticamente. Selecione o texto e use Ctrl+C.');
    }
  };

  // Salva observação rápida do aluno
  const handleStartEditNote = (mat: MatriculaAcademicaF10) => {
    setEditingContrato(mat.contrato);
    setTempNote(mat.tratativaNotas || '');
  };

  const handleSaveQuickNote = async (contrato: string) => {
    setIsSavingNote(true);
    try {
      await onSaveRetention(contrato, 'RELATORIO_WHATSAPP', tempNote);
      setEditingContrato(null);
      onTriggerToast(`Observação do contrato #${contrato} atualizada com sucesso!`);
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header Explicativo com Estatísticas */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Gerador de Relatórios Executivos para WhatsApp
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white uppercase tracking-wider">
                  Direto & Sem Poluição
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
                Relatórios sintetizados por categoria/aba pensados especialmente para superiores que têm pouco tempo. 
                Copie com 1 clique e cole diretamente nas conversas ou grupos do WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                isCopied 
                  ? 'bg-white text-emerald-700 scale-105' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-102'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Copiado para o WhatsApp!' : 'Copiar Relatório da Aba'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Seleção da Aba / Categoria para Relatório */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-500" />
            <span>1. Escolha a Aba que Deseja Reportar:</span>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredList.length} {filteredList.length === 1 ? 'aluno selecionado' : 'alunos selecionados'}
          </span>
        </div>

        {/* Grade de Pílulas das Abas */}
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
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-1 mt-1">
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filtros Complementares: Turma, Regime e Opções de Formato */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Turma */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-semibold">Turma:</span>
              <select
                value={selectedTurma}
                onChange={(e) => onSelectTurma(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-bold"
              >
                <option value="TODOS">Todas as Turmas</option>
                {availableTurmas.map(t => (
                  <option key={`report-turma-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Regime */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-semibold">Regime:</span>
              <select
                value={selectedRegime}
                onChange={(e) => onSelectRegime(e.target.value as any)}
                className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-bold"
              >
                <option value="TODOS">Todos Regimes</option>
                <option value="QUITADO">À Vista / SAV</option>
                <option value="CARNE_MENSALISTA">Carnê Mensalista</option>
              </select>
            </div>
          </div>

          {/* Formatação Visual */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Exibição de Nome */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="px-2 text-[10px] font-bold text-slate-400 uppercase">Identificação:</span>
              <button
                type="button"
                onClick={() => setNameDisplay('FIRST_NAME')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  nameDisplay === 'FIRST_NAME' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Exibe CTR (PRIMEIRO NOME)"
              >
                CTR + Nome Curto
              </button>
              <button
                type="button"
                onClick={() => setNameDisplay('NONE')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  nameDisplay === 'NONE' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Apenas o número do contrato"
              >
                Apenas Contrato
              </button>
              <button
                type="button"
                onClick={() => setNameDisplay('FULL_NAME')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  nameDisplay === 'FULL_NAME' 
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Nome completo do aluno"
              >
                Nome Completo
              </button>
            </div>

            {/* Alternar Resumo no Topo */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Incluir Resumo no Topo</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Seção Principal com Divisão em 2 Colunas: Prévia do WhatsApp + Editor Rápido de Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Coluna Esquerda: Preview Estilo WhatsApp (6 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-[#0b141a] text-slate-100 rounded-2xl border border-emerald-900/30 p-4 shadow-xl relative overflow-hidden">
            {/* Header Barra WhatsApp */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  WA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Prévia da Mensagem (WhatsApp)
                  </h4>
                  <p className="text-[10px] text-emerald-400">
                    Formato pronto com negritos e marcadores executivos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

            {/* Balão de Mensagem WhatsApp */}
            <div className="bg-[#1f2c34] text-[#e9edef] rounded-xl p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto select-all shadow-inner border border-emerald-900/20">
              {generatedWhatsAppText}
            </div>

            {/* Rodapé da Prévia */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>{filteredList.length} linhas geradas</span>
              {totalDebito > 0 && (
                <span className="font-bold text-emerald-400">
                  Débito Total: R$ {totalDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Personalização Rápida de Notas por Aluno (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0E1726] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                Personalizar Notas da Aba
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Clique no aluno para editar a nota
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Como no exemplo fornecido (<span className="italic font-semibold text-slate-600 dark:text-slate-300">"Mãe internada...", "Ele foi bolsa...", "Sinalizou cancelamento..."</span>), 
            você pode adicionar uma observação específica para qualquer aluno. Ela substituirá o status automático no relatório.
          </p>

          {/* Lista de Alunos com Editor Rápido */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
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
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' 
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                        <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">
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
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-[10px] font-bold cursor-pointer shrink-0 transition-colors"
                      >
                        {hasCustomNote ? 'Editar Nota' : '+ Adicionar Nota'}
                      </button>
                    )}
                  </div>

                  {/* Campo de Edição Aberto */}
                  {isEditing && (
                    <div className="mt-2 space-y-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40">
                      <textarea
                        rows={2}
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Ex: ELE FOI BOLSA E ESTÁ COM PARCELA DEVENDO..."
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingContrato(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveQuickNote(mat.contrato)}
                          disabled={isSavingNote}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
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
