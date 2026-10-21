import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Info, 
  CheckCircle2, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { MatriculaAcademicaF10, RegimeFinanceiro, F10ParseResult } from '../types/f10';
import { SAMPLE_F10_MATRICULAS } from '../data/mockF10Data';
import { F10Dropzone } from '../components/f10/F10Dropzone';
import { F10Kpis } from '../components/f10/F10Kpis';
import { F10FilterBar } from '../components/f10/F10FilterBar';
import { F10AcademicTable } from '../components/f10/F10AcademicTable';
import { F10WhatsAppModal } from '../components/f10/F10WhatsAppModal';

const STORAGE_KEY = 'unibe_f10_matriculas_v1';
const STORAGE_PERIOD_KEY = 'unibe_f10_periodo_v1';

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
      return localStorage.getItem(STORAGE_PERIOD_KEY) || 'Matrículas de 01/10/2026 a 21/10/2026';
    } catch {
      return 'Matrículas de 01/10/2026 a 21/10/2026';
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeWhatsAppMatricula, setActiveWhatsAppMatricula] = useState<MatriculaAcademicaF10 | null>(null);

  // Estados dos Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTurmaOrProf, setSelectedTurmaOrProf] = useState('TODOS');
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

  // Coleta turmas e professores únicos para os selects
  const availableOptions = useMemo(() => {
    const turmas = new Set<string>();
    const professores = new Set<string>();

    matriculas.forEach(m => {
      m.turmas.forEach(t => {
        if (t.codigoTurma) turmas.add(t.codigoTurma);
        if (t.professor && t.professor !== 'Não informado') professores.add(t.professor);
      });
    });

    return {
      turmas: Array.from(turmas).sort(),
      professores: Array.from(professores).sort()
    };
  }, [matriculas]);

  // Filtra as matrículas em tempo real
  const filteredMatriculas = useMemo(() => {
    return matriculas.filter(m => {
      // Filtro de Regime
      if (selectedRegime !== 'TODOS' && m.regime !== selectedRegime) {
        return false;
      }

      // Filtro de Turma ou Professor
      if (selectedTurmaOrProf !== 'TODOS') {
        if (selectedTurmaOrProf.startsWith('prof:')) {
          const profTarget = selectedTurmaOrProf.replace('prof:', '');
          const matchProf = m.turmas.some(t => t.professor === profTarget);
          if (!matchProf) return false;
        } else if (selectedTurmaOrProf.startsWith('turma:')) {
          const turmaTarget = selectedTurmaOrProf.replace('turma:', '');
          const matchTurma = m.turmas.some(t => t.codigoTurma === turmaTarget);
          if (!matchTurma) return false;
        }
      }

      // Filtro de Busca Textual (Nome, Bairro, Contrato)
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
  }, [matriculas, searchQuery, selectedTurmaOrProf, selectedRegime]);

  // Exportar para CSV
  const handleExportCsv = () => {
    if (filteredMatriculas.length === 0) return;

    const headers = [
      'Contrato',
      'Aluno',
      'Idade',
      'Telefone',
      'Bairro',
      'Turmas',
      'Professores',
      'Data Matricula',
      'Regime F10',
      'Regime Normalizado',
      'Valor Total',
      'Link Pagamento F10'
    ];

    const rows = filteredMatriculas.map(m => [
      `"${m.contrato}"`,
      `"${m.alunoNome}"`,
      m.idade || '',
      `"${m.telefonePrincipal}"`,
      `"${m.bairro || ''}"`,
      `"${m.turmas.map(t => t.codigoTurma).join('; ')}"`,
      `"${m.turmas.map(t => t.professor).join('; ')}"`,
      `"${m.dataMatricula}"`,
      `"${m.origemContratoF10}"`,
      `"${m.regime}"`,
      `"${m.valorTotal || ''}"`,
      `"${m.linkPagamentoF10 || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `F10_Matriculas_Academicas_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Módulo Acadêmico & Ingestão F10
                </h1>
                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
                  ERP F10 Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Extração e normalização de relatórios de matrículas mensais em PDF (3 páginas horizontais)
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200/80 dark:border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Limpar todas as matrículas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Área de Ingestão Drag & Drop */}
      <F10Dropzone
        onParsed={handleParsed}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Indicadores Acadêmicos & Financeiros */}
      <F10Kpis
        matriculas={matriculas}
        periodoReferencia={periodoReferencia}
      />

      {/* Barra de Filtros em Tempo Real */}
      <F10FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTurmaOrProf={selectedTurmaOrProf}
        setSelectedTurmaOrProf={setSelectedTurmaOrProf}
        selectedRegime={selectedRegime}
        setSelectedRegime={setSelectedRegime}
        availableOptions={availableOptions}
        totalCount={matriculas.length}
        filteredCount={filteredMatriculas.length}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedTurmaOrProf('TODOS');
          setSelectedRegime('TODOS');
        }}
      />

      {/* Tabela Acadêmica Interativa */}
      <F10AcademicTable
        matriculas={filteredMatriculas}
        onOpenWhatsApp={(mat) => setActiveWhatsAppMatricula(mat)}
      />

      {/* Modal de Disparo WhatsApp */}
      <F10WhatsAppModal
        isOpen={Boolean(activeWhatsAppMatricula)}
        onClose={() => setActiveWhatsAppMatricula(null)}
        matricula={activeWhatsAppMatricula}
      />
    </div>
  );
};
