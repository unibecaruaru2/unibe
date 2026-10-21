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

  // Limpa sufixos de turma
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

  // Se tem ponto e vírgula (padrão BR: 3.180,00)
  if (clean.includes(',') && clean.includes('.')) {
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
  }
  // Se tem apenas vírgula (ex: 3180,00)
  if (clean.includes(',')) {
    return parseFloat(clean.replace(',', '.')) || 0;
  }
  return parseFloat(clean) || 0;
}

/**
 * Verifica se a presença registrada é recente (dentro de 30 dias em relação a Outubro/2026).
 */
export function isPresenceRecent(ultimaPresenca?: string): boolean {
  if (!ultimaPresenca) return false;
  // Como o relatório do F10 é de Outubro/2026:
  // Presenças em Outubro (10/2026) ou final de Setembro (09/2026) são recentes.
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
 */
export function classifyRiskQuadrant(params: {
  statusContrato: string;
  valorVencidoNum: number;
  faltasTotais: number;
  ultimaPresenca?: string;
}): QuadranteRisco {
  const status = (params.statusContrato || '').toLowerCase().trim();

  // Q3: Aguardando Cancelamento (Prioridade Máxima de Retenção)
  if (status.includes('aguardando') || status.includes('cancel')) {
    return 'Q3_WAITING_CANCEL';
  }

  // Q1: Inadimplente Frequentando (Alto Potencial de Recuperação)
  // Valor Vencido > 0 E frequentou recentemente
  if (params.valorVencidoNum > 0 && isPresenceRecent(params.ultimaPresenca)) {
    return 'Q1_OVERDUE_ATTENDING';
  }

  // Q2: Risco Crítico de Evasão (Faltas >= 3 E Ativo)
  if (params.faltasTotais >= 3 && status === 'ativo') {
    return 'Q2_ABSENT_CHURN';
  }

  // Se tem valor vencido mas não tem presença recente, também é risco Q1/Q2
  if (params.valorVencidoNum > 0) {
    return 'Q1_OVERDUE_ATTENDING';
  }

  // Q4: Aluno Regular / Saudável
  return 'Q4_REGULAR';
}

/**
 * Calcula os KPIs Consolidados para a Central de Evasão & Risco
 */
export function calculateF10Kpis(matriculas: MatriculaAcademicaF10[]): F10KpisData {
  let receitaVencidaFrequentando = 0;
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

    // Q1: Receita Vencida de Alunos que Frequentam
    if (m.quadranteRisco === 'Q1_OVERDUE_ATTENDING') {
      receitaVencidaFrequentando += m.valorVencidoNum;
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

    // No Show (muitas faltas e nunca pisou na escola)
    if (m.isNoShow) {
      alunosNoShow++;
    }
  }

  return {
    totalMatriculas: matriculas.length,
    totalQuitados,
    totalCarne,
    totalTurmasUnicas: turmasSet.size,
    receitaVencidaFrequentando,
    alunosRiscoEvasao,
    solicitacoesCancelamento,
    cancelamentosQuitadosRiscoEstorno,
    alunosSemApp,
    alunosNoShow
  };
}
