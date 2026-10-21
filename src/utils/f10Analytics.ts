import { MatriculaAcademicaF10, QuadranteRisco, F10KpisData } from '../types/f10';

/**
 * Normaliza e unifica nomes de turmas com base nas regras do UNIBE:
 * - "A turma PM.7 e PM707 são as mesmas, é que precisa fazer uma distinção por erro interno"
 * - "O mesmo acontece com: Mirim 7 - Manhã e Mirim 707"
 */
export function canonicalizeTurma(turmaStr: string): string {
  if (!turmaStr) return 'Não informada';
  const norm = turmaStr.trim();

  // Regra 1: PM.7 e PM.707
  if (
    /pm\.?707/i.test(norm) || 
    /pm\.?7\b/i.test(norm) ||
    /pm\.?7\s*-\s*manhã/i.test(norm) ||
    /pm\.?7\s*-\s*tarde/i.test(norm)
  ) {
    if (norm.toLowerCase().includes('tarde')) {
      return 'PM.7 / PM.707 (Tarde)';
    }
    return 'PM.7 / PM.707 (Manhã)';
  }

  // Regra 2: Mirim 7 - Manhã e Mirim 707
  if (
    /mirim\.?707/i.test(norm) || 
    /mirim\.?7\s*-\s*manhã/i.test(norm)
  ) {
    return 'Mirim 7 / 707 (Manhã)';
  }

  if (/mirim\.?7\s*-\s*tarde/i.test(norm)) {
    return 'Mirim 7 (Tarde)';
  }

  return norm;
}

/**
 * Converte valor em moeda brasileira para número float.
 * Ex: "R$ 3.180,00" -> 3180.00
 */
export function parseCurrencyNumber(val?: string | null): number {
  if (!val) return 0;
  const clean = val.replace(/[^\d,\.]/g, '').trim();
  if (!clean) return 0;

  if (clean.includes(',') && clean.includes('.')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
  }
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.')) || 0;
  }
  return parseFloat(clean) || 0;
}

/**
 * Verifica se a presença registrada é recente (dentro de 30 dias em relação ao mês vigente).
 */
export function isPresenceRecent(ultimaPresenca?: string): boolean {
  if (!ultimaPresenca) return false;
  const parts = ultimaPresenca.split('/');
  if (parts.length === 3) {
    const mes = parseInt(parts[1], 10);
    const ano = parseInt(parts[2], 10);
    if ((ano === 2026 || ano === 26) && (mes === 10 || mes === 9)) {
      return true;
    }
  }
  return false;
}

/**
 * Classifica o aluno na Matriz de 4 Quadrantes Operacionais
 * Agora com suporte explícito a Inadimplente Frequentando E Inadimplente Ausente!
 */
export function classifyRiskQuadrant(params: {
  statusContrato: string;
  valorVencidoNum: number;
  faltasTotais: number;
  ultimaPresenca?: string;
}): QuadranteRisco {
  const status = (params.statusContrato || '').toLowerCase().trim();

  // Q3: Aguardando Cancelamento (Prioridade de Retenção)
  if (status.includes('aguardando') || status.includes('cancel')) {
    return 'Q3_WAITING_CANCEL';
  }

  // Se tem valor vencido > 0:
  if (params.valorVencidoNum > 0) {
    if (isPresenceRecent(params.ultimaPresenca)) {
      // Q1: Inadimplente Frequentando (Alto Potencial de Recuperação)
      return 'Q1_OVERDUE_ATTENDING';
    }
    // Q1: Inadimplente Ausente (Risco Duplo: Financeiro + Evasão)
    return 'Q1_OVERDUE_ABSENT';
  }

  // Q2: Risco Crítico de Evasão (Faltas >= 3 E Ativo sem débito vencido)
  if (params.faltasTotais >= 3 && status === 'ativo') {
    return 'Q2_ABSENT_CHURN';
  }

  // Q4: Aluno Regular / Saudável
  return 'Q4_REGULAR';
}

/**
 * Calcula os KPIs Consolidados para a Central de Evasão, Inadimplência & Risco
 */
export function calculateF10Kpis(matriculas: MatriculaAcademicaF10[]): F10KpisData {
  let receitaTotalVencida = 0;
  let totalAlunosInadimplentes = 0;
  let receitaVencidaFrequentando = 0;
  let alunosInadimplentesFrequentando = 0;
  let receitaVencidaAusentes = 0;
  let alunosInadimplentesAusentes = 0;

  let alunosRiscoEvasao = 0;
  let solicitacoesCancelamento = 0;
  let cancelamentosQuitadosRiscoEstorno = 0;
  let alunosSemApp = 0;
  let alunosNoShow = 0;
  let totalQuitados = 0;
  let totalCarne = 0;

  const turmasSet = new Set<string>();

  for (const m of matriculas) {
    if (m.regime === 'QUITADO') totalQuitados++;
    if (m.regime === 'CARNE_MENSALISTA') totalCarne++;

    m.turmasCanonicas.forEach(t => turmasSet.add(t));

    // Inadimplência Geral
    if (m.valorVencidoNum > 0) {
      receitaTotalVencida += m.valorVencidoNum;
      totalAlunosInadimplentes++;

      if (m.quadranteRisco === 'Q1_OVERDUE_ATTENDING') {
        receitaVencidaFrequentando += m.valorVencidoNum;
        alunosInadimplentesFrequentando++;
      } else {
        receitaVencidaAusentes += m.valorVencidoNum;
        alunosInadimplentesAusentes++;
      }
    }

    // Q2: Risco de Evasão
    if (m.quadranteRisco === 'Q2_ABSENT_CHURN') {
      alunosRiscoEvasao++;
    }

    // Q3: Solicitações de Cancelamento
    if (m.quadranteRisco === 'Q3_WAITING_CANCEL') {
      solicitacoesCancelamento++;
      if (m.isAguardandoQuitado) {
        cancelamentosQuitadosRiscoEstorno++;
      }
    }

    // Sem App
    if (!m.hasAppActive) {
      alunosSemApp++;
    }

    // No Show
    if (m.isNoShow) {
      alunosNoShow++;
    }
  }

  return {
    totalMatriculas: matriculas.length,
    totalQuitados,
    totalCarne,
    totalTurmasUnicas: turmasSet.size,
    receitaTotalVencida,
    totalAlunosInadimplentes,
    receitaVencidaFrequentando,
    alunosInadimplentesFrequentando,
    receitaVencidaAusentes,
    alunosInadimplentesAusentes,
    alunosRiscoEvasao,
    solicitacoesCancelamento,
    cancelamentosQuitadosRiscoEstorno,
    alunosSemApp,
    alunosNoShow
  };
}
