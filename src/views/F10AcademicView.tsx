import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  ShieldAlert, 
  Users, 
  Sparkles,
  BarChart3,
  ListFilter
} from 'lucide-react';
import { MatriculaAcademicaF10, RegimeFinanceiro, QuadranteRisco, F10ParseResult } from '../types/f10';
import { SAMPLE_F10_MATRICULAS } from '../data/mockF10Data';
import { F10Dropzone } from '../components/f10/F10Dropzone';
import { F10Kpis } from '../components/f10/F10Kpis';
import { F10FilterBar } from '../components/f10/F10FilterBar';
import { F10AcademicTable } from '../components/f10/F10AcademicTable';
import { F10WhatsAppModal } from '../components/f10/F10WhatsAppModal';
import { F10RetentionModal } from '../components/f10/F10RetentionModal';

const STORAGE_KEY = 'unibe_f10_matriculas_v2';
const STORAGE_PERIOD_KEY = 'unibe_f10_periodo_v2';

export const F10AcademicView: React.FC = () => {
  // Estado das Matrículas Carregadas
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
  const [activeWhatsAppMatricula, setActiveWhatsAppMatricula] = useState<MatriculaAcademicaF10 | null>(null);
  const [activeWhatsAppMode, setActiveWhatsAppMode] = useState<'COBRANCA' | 'RESGATE_PEDAGOGICO' | 'RETENCAO' | 'BOAS_VINDAS'>('COBRANCA');
  const [retentionTargetMatricula, setRetentionTargetMatricula] = useState<MatriculaAcademicaF10 | null>(null);

  // Estados dos Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('TODOS');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'TODOS' | QuadranteRisco | 'SEM_APP'>('TODOS');
  const [selectedRegime, setSelectedRegime] = useState<'TODOS' | RegimeFinanceiro>('TODOS');

  // Salva no localStorage sempre que alterar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matriculas));
      localStorage.setItem(STORAGE_PERIOD_KEY, periodoReferencia);
    } catch {}
  }, [matriculas, periodoReferencia]);

  // Handler de Novo PDF Parseado
  const handleParsed = (result: F10ParseResult) => {
    setMatriculas(result.matriculas);
    if (result.periodoReferencia) {
      setPeriodoReferencia(result.periodoReferencia);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Deseja limpar as matrículas importadas do F10?')) {
      setMatriculas([]);
      setPeriodoReferencia('Nenhum relatório ativo');
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_PERIOD_KEY);
      } catch {}
    }
  };

  // Coleta turmas canônicas únicas (PM.7 / PM.707 e Mirim 7 / 707 unificadas)
  const availableTurmas = useMemo(() => {
    const setT = new Set<string>();
    matriculas.forEach(m => {
      m.turmasCanonicas.forEach(tc => setT.add(tc));
    });
    return Array.from(setT).sort();
  }, [matriculas]);

  // Filtra as matrículas em tempo real
  const filteredMatriculas = useMemo(() => {
    return matriculas.filter(m => {
      // Filtro de Quadrante Operacional
      if (selectedQuadrant !== 'TODOS') {
        if (selectedQuadrant === 'SEM_APP') {
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
  }, [matriculas, searchQuery, selectedTurma, selectedQuadrant, selectedRegime]);

  // Exportar para CSV
  const handleExportCsv = () => {
    if (filteredMatriculas.length === 0) return;

    const headers = [
      'Contrato',
      'Aluno',
      'Status',
      'Quadrante',
      'Faltas',
      'Ultima Presenca',
      'Valor Vencido',
      'Telefone',
      'Bairro',
      'Turmas Canonicas',
      'Smart Aluno',
      'Link Pagamento F10'
    ];

    const rows = filteredMatriculas.map(m => [
      `"${m.contrato}"`,
      `"${m.alunoNome}"`,
      `"${m.statusContrato}"`,
      `"${m.quadranteRisco}"`,
      m.faltasTotais,
      `"${m.ultimaPresenca || ''}"`,
      `"${m.valorVencido || 'R$ 0,00'}"`,
      `"${m.telefonePrincipal}"`,
      `"${m.bairro || ''}"`,
      `"${m.turmasCanonicas.join('; ')}"`,
      `"${m.smartAluno}"`,
      `"${m.linkPagamentoF10 || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `F10_Prevencao_Evasao_Inadimplencia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#0E1726] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Prevenção de Evasão, Recuperação & Risco Acadêmico
                </h1>
                <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-200/60">
                  F10 Risk Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cruzamento inteligente de frequência, parcelas vencidas, links de pagamento e retenção de cancelamentos
              </p>
            </div>
          </div>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2">
          {matriculas.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Limpar todos os dados"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Drag & Drop */}
      <F10Dropzone
        onParsed={handleParsed}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Cards de KPIs da Matriz de Risco (Clicáveis para filtrar!) */}
      <F10Kpis
        matriculas={matriculas}
        periodoReferencia={periodoReferencia}
        activeQuadrantFilter={selectedQuadrant}
        onSelectQuadrant={(q: any) => setSelectedQuadrant(q)}
      />

      {/* Barra de Filtros com Seletor de Quadrantes e Turmas Canônicas */}
      <F10FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTurma={selectedTurma}
        setSelectedTurma={setSelectedTurma}
        selectedQuadrant={selectedQuadrant}
        setSelectedQuadrant={setSelectedQuadrant}
        selectedRegime={selectedRegime}
        setSelectedRegime={setSelectedRegime}
        availableTurmas={availableTurmas}
        totalCount={matriculas.length}
        filteredCount={filteredMatriculas.length}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedTurma('TODOS');
          setSelectedQuadrant('TODOS');
          setSelectedRegime('TODOS');
        }}
      />

      {/* Tabela Operacional de Risco & Ações Rápidas */}
      <F10AcademicTable
        matriculas={filteredMatriculas}
        onOpenWhatsApp={(mat, mode) => {
          setActiveWhatsAppMatricula(mat);
          if (mode) setActiveWhatsAppMode(mode);
        }}
        onOpenRetentionModal={(mat) => setRetentionTargetMatricula(mat)}
      />

      {/* Modais Operacionais */}
      <F10WhatsAppModal
        isOpen={Boolean(activeWhatsAppMatricula)}
        onClose={() => setActiveWhatsAppMatricula(null)}
        matricula={activeWhatsAppMatricula}
        defaultMode={activeWhatsAppMode}
      />

      <F10RetentionModal
        isOpen={Boolean(retentionTargetMatricula)}
        onClose={() => setRetentionTargetMatricula(null)}
        matricula={retentionTargetMatricula}
      />
    </div>
  );
};
