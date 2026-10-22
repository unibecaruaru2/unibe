import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  ShieldAlert, 
  Cloud, 
  CloudCheck, 
  RefreshCw,
  Sparkles,
  Smartphone,
  Layers,
  BarChart3,
  CalendarCheck2,
  Users,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { MatriculaAcademicaF10, RegimeFinanceiro, QuadranteRisco, F10ParseResult } from '../types/f10';
import { SAMPLE_F10_MATRICULAS } from '../data/mockF10Data';
import { F10Dropzone } from '../components/f10/F10Dropzone';
import { F10ExecutiveIndices } from '../components/f10/F10ExecutiveIndices';
import { F10FilterBar, FilterQuadrantOption, SortOption, ViewTab } from '../components/f10/F10FilterBar';
import { F10AcademicTable } from '../components/f10/F10AcademicTable';
import { F10AnalyticsView } from '../components/f10/F10AnalyticsView';
import { F10WhatsAppReportTab } from '../components/f10/F10WhatsAppReportTab';
import { F10StudentDrawer } from '../components/f10/F10StudentDrawer';
import { F10BatchActionsBar } from '../components/f10/F10BatchActionsBar';
import { F10WhatsAppModal } from '../components/f10/F10WhatsAppModal';
import { F10RetentionModal } from '../components/f10/F10RetentionModal';
import { generateWhatsAppExecutiveReport } from '../utils/f10WhatsAppReports';
import { 
  fetchF10MatriculasFromSupabase, 
  syncF10MatriculasToSupabase, 
  updateF10RetentionInSupabase, 
  clearF10MatriculasInSupabase 
} from '../services/f10Supabase';

const STORAGE_KEY = 'unibe_f10_matriculas_v3';
const STORAGE_PERIOD_KEY = 'unibe_f10_periodo_v3';

export const F10AcademicView: React.FC = () => {
  // Estado das Matrículas
  const [matriculas, setMatriculas] = useState<MatriculaAcademicaF10[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_F10_MATRICULAS;
  });

  const [periodoReferencia, setPeriodoReferencia] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_PERIOD_KEY) || 'Consolidado F10 (01/07/26 a 21/10/26)';
    } catch {
      return 'Consolidado F10 (01/07/26 a 21/10/26)';
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Modais & Drawer
  const [activeWhatsAppMatricula, setActiveWhatsAppMatricula] = useState<MatriculaAcademicaF10 | null>(null);
  const [activeWhatsAppMode, setActiveWhatsAppMode] = useState<'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS'>('COBRANCA');
  const [retentionTargetMatricula, setRetentionTargetMatricula] = useState<MatriculaAcademicaF10 | null>(null);
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<MatriculaAcademicaF10 | null>(null);

  // Estados dos Filtros e Visualização
  const [activeTab, setActiveTab] = useState<ViewTab>('TABELA');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('TODOS');
  const [selectedQuadrant, setSelectedQuadrant] = useState<FilterQuadrantOption>('TODOS');
  const [selectedRegime, setSelectedRegime] = useState<'TODOS' | RegimeFinanceiro>('TODOS');
  const [sortBy, setSortBy] = useState<SortOption>('DEBITO_DESC');
  const [density, setDensity] = useState<'confortavel' | 'compacto'>('confortavel');

  // Seleção em Lote (Batch Actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Toast e Cópia Rápida para WhatsApp
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickCopiedWhatsApp, setIsQuickCopiedWhatsApp] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Sincronização Inicial com o Supabase ao Montar a Tela
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      setIsSyncingDb(true);
      try {
        const cloudData = await fetchF10MatriculasFromSupabase();
        if (isMounted) {
          if (cloudData && cloudData.matriculas.length > 0) {
            setMatriculas(cloudData.matriculas);
            setPeriodoReferencia(cloudData.periodoReferencia);
            setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          } else {
            await syncF10MatriculasToSupabase(SAMPLE_F10_MATRICULAS, 'Consolidado F10 (01/07/26 a 21/10/26)');
            setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        console.warn('Uso offline / cache local ativado:', err);
      } finally {
        if (isMounted) setIsSyncingDb(false);
      }
    }

    loadCloudData();
    return () => { isMounted = false; };
  }, []);

  // Salva no localStorage como cache de segurança
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matriculas));
      localStorage.setItem(STORAGE_PERIOD_KEY, periodoReferencia);
    } catch {}
  }, [matriculas, periodoReferencia]);

  // Força Sincronização Manual com o Banco
  const handleForceSync = async () => {
    setIsSyncingDb(true);
    try {
      const cloudData = await fetchF10MatriculasFromSupabase();
      if (cloudData && cloudData.matriculas.length > 0) {
        setMatriculas(cloudData.matriculas);
        setPeriodoReferencia(cloudData.periodoReferencia);
      } else {
        await syncF10MatriculasToSupabase(matriculas, periodoReferencia);
      }
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Handler de Novo PDF Parseado
  const handleParsed = async (result: F10ParseResult) => {
    setMatriculas(result.matriculas);
    const ref = result.periodoReferencia || periodoReferencia;
    setPeriodoReferencia(ref);
    setSelectedStudentIds([]);

    setIsSyncingDb(true);
    try {
      await syncF10MatriculasToSupabase(result.matriculas, ref);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Erro ao sincronizar com nuvem:', err);
    } finally {
      setIsSyncingDb(false);
    }
  };

  // Handler de Retenção Salva
  const handleSaveRetention = async (contrato: string, actionType: string, notes: string) => {
    setMatriculas(prev => prev.map(m => {
      if (m.contrato === contrato) {
        return {
          ...m,
          tratativaTipo: actionType,
          tratativaNotas: notes
        };
      }
      return m;
    }));

    if (selectedStudentForDrawer && selectedStudentForDrawer.contrato === contrato) {
      setSelectedStudentForDrawer(prev => prev ? ({
        ...prev,
        tratativaTipo: actionType,
        tratativaNotas: notes
      }) : null);
    }

    try {
      await updateF10RetentionInSupabase(contrato, actionType, notes);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Deseja limpar as matrículas importadas do F10 em todos os dispositivos?')) {
      setMatriculas([]);
      setPeriodoReferencia('Nenhum relatório ativo');
      setSelectedStudentIds([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_PERIOD_KEY);
        await clearF10MatriculasInSupabase();
      } catch {}
    }
  };

  // Coleta turmas canônicas únicas
  const availableTurmas = useMemo(() => {
    const setT = new Set<string>();
    matriculas.forEach(m => {
      m.turmasCanonicas.forEach(tc => setT.add(tc));
    });
    return Array.from(setT).sort();
  }, [matriculas]);

  // Contadores por quadrante em tempo real
  const countsByQuadrant = useMemo(() => {
    let inadimplentesGeral = 0;
    let q1Attending = 0;
    let q1Absent = 0;
    let q2Churn = 0;
    let q3Cancel = 0;
    let q4Regular = 0;
    let semApp = 0;

    matriculas.forEach(m => {
      if (m.valorVencidoNum > 0) inadimplentesGeral++;
      if (m.quadranteRisco === 'Q1_OVERDUE_ATTENDING') q1Attending++;
      if (m.quadranteRisco === 'Q1_OVERDUE_ABSENT') q1Absent++;
      if (m.quadranteRisco === 'Q2_ABSENT_CHURN') q2Churn++;
      if (m.quadranteRisco === 'Q3_WAITING_CANCEL') q3Cancel++;
      if (m.quadranteRisco === 'Q4_REGULAR') q4Regular++;
      if (!m.hasAppActive) semApp++;
    });

    return {
      todos: matriculas.length,
      inadimplentesGeral,
      q1Attending,
      q1Absent,
      q2Churn,
      q3Cancel,
      q4Regular,
      semApp
    };
  }, [matriculas]);

  // Filtra e Ordena as matrículas em tempo real
  const filteredMatriculas = useMemo(() => {
    const filtered = matriculas.filter(m => {
      // Filtros de Quadrante e Inadimplência
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

      // Filtro de Turma Canônica
      if (selectedTurma !== 'TODOS') {
        if (!m.turmasCanonicas.includes(selectedTurma)) {
          return false;
        }
      }

      // Busca Textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = m.alunoNome.toLowerCase().includes(query);
        const matchBairro = m.bairro?.toLowerCase().includes(query) || false;
        const matchContrato = m.contrato.toLowerCase().includes(query);
        const matchPhone = m.telefonePrincipal.includes(query);

        if (!matchName && !matchBairro && !matchContrato && !matchPhone) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    return filtered.sort((a, b) => {
      if (sortBy === 'DEBITO_DESC') {
        return (b.valorVencidoNum || 0) - (a.valorVencidoNum || 0);
      }
      if (sortBy === 'FALTAS_DESC') {
        return (b.faltasTotais || 0) - (a.faltasTotais || 0);
      }
      if (sortBy === 'NOME_ASC') {
        return a.alunoNome.localeCompare(b.alunoNome);
      }
      if (sortBy === 'RECENTE_DESC') {
        return (b.contrato || '').localeCompare(a.contrato || '');
      }
      return 0;
    });
  }, [matriculas, searchQuery, selectedTurma, selectedQuadrant, selectedRegime, sortBy]);

  // Seleção em lote
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === filteredMatriculas.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredMatriculas.map(m => m.id));
    }
  };

  // Exportar para CSV (selecionados ou filtrados)
  const handleExportCsv = (onlySelected = false) => {
    const listToExport = onlySelected 
      ? filteredMatriculas.filter(m => selectedStudentIds.includes(m.id))
      : filteredMatriculas;

    if (listToExport.length === 0) return;

    const headers = [
      'Contrato',
      'Aluno',
      'Status',
      'Quadrante',
      'Faltas',
      'Ultima Presenca',
      'Valor Vencido',
      'Parcelas Vencidas',
      'Valor Total',
      'Telefone',
      'Bairro',
      'Turmas Canonicas',
      'Smart Aluno',
      'Tratativa Tipo',
      'Tratativa Notas',
      'Link Pagamento F10'
    ];

    const rows = listToExport.map(m => [
      `"${m.contrato}"`,
      `"${m.alunoNome}"`,
      `"${m.statusContrato}"`,
      `"${m.quadranteRisco}"`,
      m.faltasTotais,
      `"${m.ultimaPresenca || ''}"`,
      `"${m.valorVencido || 'R$ 0,00'}"`,
      m.parcelasVencidas,
      `"${m.valorTotal || 'R$ 0,00'}"`,
      `"${m.telefonePrincipal}"`,
      `"${m.bairro || ''}"`,
      `"${m.turmasCanonicas.join('; ')}"`,
      `"${m.smartAluno}"`,
      `"${m.tratativaTipo || ''}"`,
      `"${(m.tratativaNotas || '').replace(/"/g, '""')}"`,
      `"${m.linkPagamentoF10 || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `F10_Gestao_Alunos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Batch WhatsApp (abre o primeiro da lista selecionada)
  const handleBatchWhatsApp = () => {
    const selected = filteredMatriculas.filter(m => selectedStudentIds.includes(m.id));
    if (selected.length > 0) {
      setActiveWhatsAppMatricula(selected[0]);
      setActiveWhatsAppMode(selected[0].valorVencidoNum > 0 ? 'COBRANCA' : 'RESGATE_PEDAGOGICO');
    }
  };

  // Copia rápida do relatório da aba ativa diretamente para o WhatsApp
  const handleQuickCopyCurrentTabReport = async () => {
    if (filteredMatriculas.length === 0) {
      showToast('Nenhum aluno encontrado na aba selecionada para gerar relatório.');
      return;
    }

    const titles: Record<FilterQuadrantOption, string> = {
      'INADIMPLENTES_TODOS': 'Relatório: Inadimplentes F10 (Geral)',
      'Q1_OVERDUE_ATTENDING': 'Alunos em Aula com Débito (Recuperação Prioritária)',
      'Q1_OVERDUE_ABSENT': 'Alunos Ausentes com Débito Vencido (Risco Duplo)',
      'Q2_ABSENT_CHURN': 'Alunos em Risco Crítico de Evasão (≥3 Faltas)',
      'Q3_WAITING_CANCEL': 'Fila de Retenção - Solicitações de Cancelamento',
      'Q4_REGULAR': 'Alunos em Situação Regular / Saudável',
      'SEM_APP': 'Alunos Sem App Smart Aluno',
      'TODOS': 'Relatório Geral Consolidado de Matrículas'
    };

    const title = titles[selectedQuadrant] || 'Relatório de Matrículas F10';

    const text = generateWhatsAppExecutiveReport({
      matriculas: filteredMatriculas,
      tabTitle: title,
      periodoReferencia,
      filterTurma: selectedTurma,
      filterRegime: selectedRegime,
      options: {
        includeExecutiveSummary: true,
        nameDisplay: 'FIRST_NAME'
      }
    });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsQuickCopiedWhatsApp(true);
      showToast(`✅ Relatório da aba "${titles[selectedQuadrant] || 'Ativa'}" copiado para o WhatsApp!`);
      setTimeout(() => setIsQuickCopiedWhatsApp(false), 2500);
    } catch {
      showToast('⚠️ Erro ao copiar. Abra a aba "Copiar Relatório WhatsApp" para copiar manualmente.');
    }
  };

  // Copia relatório somente dos alunos selecionados via checkbox
  const handleBatchCopySelectedReport = async () => {
    const selected = filteredMatriculas.filter(m => selectedStudentIds.includes(m.id));
    if (selected.length === 0) return;

    const text = generateWhatsAppExecutiveReport({
      matriculas: selected,
      tabTitle: `Relatório de Alunos Selecionados (${selected.length})`,
      periodoReferencia,
      options: {
        includeExecutiveSummary: true,
        nameDisplay: 'FIRST_NAME'
      }
    });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      showToast(`✅ ${selected.length} alunos selecionados copiados para o WhatsApp!`);
    } catch {}
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto animate-fadeIn pb-16">
      
      {/* 1. Top Header com Sincronização em Nuvem Supabase e Ações Executivas */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Gestão & Prevenção de Evasão Acadêmica F10
              </h1>
              
              {/* Badge de Sincronização em Nuvem */}
              <div 
                onClick={handleForceSync}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                title="Sincronizado via Supabase em tempo real. Clique para sincronizar agora."
              >
                {isSyncingDb ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <Cloud className="w-3 h-3 text-emerald-600" />
                )}
                <span>{isSyncingDb ? 'Sincronizando...' : `Nuvem Ativa ${lastSyncTime ? `(${lastSyncTime})` : ''}`}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitoramento inteligente de assiduidade, inadimplência e retenção com integração F10
            </p>
          </div>
        </div>

        {/* Ações Globais */}
        <div className="flex items-center gap-2">
          {matriculas.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncingDb}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Sincronizar dados com o Supabase agora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDb ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sincronizar</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportCsv(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Exportar dados filtrados para planilha CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Limpar todos os dados importados"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Barra Inteligente de Upload & Relatório F10 (Compacta e Expansível) */}
      <F10Dropzone
        onParsed={handleParsed}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        totalMatriculas={matriculas.length}
      />

      {/* 3. Índices Executivos Estratégicos & Análise de Dados */}
      <F10ExecutiveIndices
        matriculas={matriculas}
        activeFilter={selectedQuadrant}
        onSelectFilter={(q) => {
          setSelectedQuadrant(q);
          setActiveTab('TABELA');
        }}
      />

      {/* 4. Barra Central de Filtros, Modos de Visualização e Controles */}
      <F10FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTurma={selectedTurma}
        setSelectedTurma={setSelectedTurma}
        selectedQuadrant={selectedQuadrant}
        setSelectedQuadrant={setSelectedQuadrant}
        selectedRegime={selectedRegime}
        setSelectedRegime={setSelectedRegime}
        sortBy={sortBy}
        setSortBy={setSortBy}
        density={density}
        setDensity={setDensity}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableTurmas={availableTurmas}
        totalCount={matriculas.length}
        filteredCount={filteredMatriculas.length}
        countsByQuadrant={countsByQuadrant}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedTurma('TODOS');
          setSelectedQuadrant('TODOS');
          setSelectedRegime('TODOS');
        }}
        onQuickCopyWhatsApp={handleQuickCopyCurrentTabReport}
        isQuickCopiedWhatsApp={isQuickCopiedWhatsApp}
      />

      {/* 5. Conteúdo Dinâmico por Aba: Tabela Operacional, Painel Analítico OU Gerador WhatsApp */}
      {activeTab === 'TABELA' ? (
        <F10AcademicTable
          matriculas={filteredMatriculas}
          selectedStudentIds={selectedStudentIds}
          onToggleSelectStudent={handleToggleSelectStudent}
          onToggleSelectAll={handleToggleSelectAll}
          density={density}
          onOpenStudentDrawer={(mat) => setSelectedStudentForDrawer(mat)}
          onOpenWhatsApp={(mat, mode) => {
            setActiveWhatsAppMatricula(mat);
            if (mode) setActiveWhatsAppMode(mode);
          }}
          onOpenRetentionModal={(mat) => setRetentionTargetMatricula(mat)}
        />
      ) : activeTab === 'ANALYTICS' ? (
        <F10AnalyticsView
          matriculas={matriculas}
          onSelectTurma={(turma) => {
            setSelectedTurma(turma);
            setActiveTab('TABELA');
          }}
          onSelectFilter={(filter) => {
            setSelectedQuadrant(filter);
            setActiveTab('TABELA');
          }}
          onGoToStudentsTable={() => setActiveTab('TABELA')}
        />
      ) : (
        <F10WhatsAppReportTab
          matriculas={matriculas}
          selectedQuadrant={selectedQuadrant}
          onSelectQuadrant={setSelectedQuadrant}
          selectedTurma={selectedTurma}
          onSelectTurma={setSelectedTurma}
          selectedRegime={selectedRegime}
          onSelectRegime={setSelectedRegime}
          availableTurmas={availableTurmas}
          periodoReferencia={periodoReferencia}
          onSaveRetention={handleSaveRetention}
          onTriggerToast={showToast}
        />
      )}

      {/* 6. Barra Flutuante de Ações em Lote */}
      <F10BatchActionsBar
        selectedCount={selectedStudentIds.length}
        onClearSelection={() => setSelectedStudentIds([])}
        onBatchWhatsApp={handleBatchWhatsApp}
        onBatchExportCsv={() => handleExportCsv(true)}
        onBatchCopyReport={handleBatchCopySelectedReport}
      />

      {/* 7. Dossiê Completo do Aluno (Slide-Over Drawer) */}
      <F10StudentDrawer
        isOpen={Boolean(selectedStudentForDrawer)}
        onClose={() => setSelectedStudentForDrawer(null)}
        matricula={selectedStudentForDrawer}
        onOpenWhatsApp={(mat, mode) => {
          setActiveWhatsAppMatricula(mat);
          if (mode) setActiveWhatsAppMode(mode);
        }}
        onSaveRetention={handleSaveRetention}
      />

      {/* 8. Modais Operacionais de Ação */}
      <F10WhatsAppModal
        isOpen={Boolean(activeWhatsAppMatricula)}
        onClose={() => setActiveWhatsAppMatricula(null)}
        matricula={activeWhatsAppMatricula}
        defaultMode={activeWhatsAppMode}
      />

      {/* 9. Toast Notificação Flutuante de Alta Visibilidade */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-100">{toastMessage}</span>
        </div>
      )}

      <F10RetentionModal
        isOpen={Boolean(retentionTargetMatricula)}
        onClose={() => setRetentionTargetMatricula(null)}
        matricula={retentionTargetMatricula}
        onSaveFeedback={handleSaveRetention}
      />
    </div>
  );
};