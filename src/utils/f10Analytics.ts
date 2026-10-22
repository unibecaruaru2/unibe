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
 * Verifica se a presença registrada é recente (dentro de 45 dias em relação ao período do relatório).
 */
export function isPresenceRecent(ultimaPresenca?: string): boolean {
  if (!ultimaPresenca) return false;
  const parts = ultimaPresenca.split('/');
  if (parts.length === 3) {
    const mes = parseInt(parts[1], 10);
    const ano = parseInt(parts[2], 10);
    // Presenças em Outubro ou Setembro são recentes
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

  // Q3: Aguardando Cancelamento (Prioridade de Retenção)
  if (status.includes('aguardando') || status.includes('cancel')) {
    return 'Q3_WAITING_CANCEL';
  }

  // Se tem valor vencido > 0:
  if (params.valorVencidoNum > 0) {
    if (isPresenceRecent(params.ultimaPresenca)) {
      return 'Q1_OVERDUE_ATTENDING';
    }
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
  let totalNuncaCompareceram = 0;
  let totalQuitados = 0;
  let totalCarne = 0;
  let receitaTotalContratada = 0;
  let receitaTotalPaga = 0;
  let receitaTotalAberto = 0;

  const turmasSet = new Set<string>();

  for (const m of matriculas) {
    if (m.regime === 'QUITADO') totalQuitados++;
    if (m.regime === 'CARNE_MENSALISTA') totalCarne++;

    receitaTotalContratada += m.valorTotalNum || 0;
    receitaTotalPaga += m.valorPagoNum || 0;
    receitaTotalAberto += m.valorAbertoNum || 0;

    m.turmasCanonicas.forEach(t => turmasSet.add(t));

    // Se não tem presença registrada
    if (!m.ultimaPresenca || m.nuncaCompareceu) {
      totalNuncaCompareceram++;
    }

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
    alunosNoShow,
    totalNuncaCompareceram,
    receitaTotalContratada,
    receitaTotalPaga,
    receitaTotalAberto
  };
}

/**
 * Calcula os Índices Executivos e Análise Multidimensional (Turmas, Regimes e Quadrantes)
 */
export function calculateExecutiveIndices(matriculas: MatriculaAcademicaF10[]): import('../types/f10').ExecutiveIndices {
  const total = matriculas.length || 1;
  const kpis = calculateF10Kpis(matriculas);

  // Alunos em risco real = Inadimplente ausente + Risco de evasão (faltas) + Cancelamento
  const totalAlunosEmRisco = kpis.alunosInadimplentesAusentes + kpis.alunosRiscoEvasao + kpis.solicitacoesCancelamento;
  const taxaRiscoEvasao = Math.round((totalAlunosEmRisco / total) * 100);

  let classificacaoEvasao: 'CONTROLADO' | 'ATENÇÃO' | 'CRÍTICO' = 'CONTROLADO';
  if (taxaRiscoEvasao > 35) {
    classificacaoEvasao = 'CRÍTICO';
  } else if (taxaRiscoEvasao > 18) {
    classificacaoEvasao = 'ATENÇÃO';
  }

  // Taxa de recuperabilidade = % do valor vencido que está sendo frequentado
  const taxaRecuperabilidade = kpis.receitaTotalVencida > 0 
    ? Math.round((kpis.receitaVencidaFrequentando / kpis.receitaTotalVencida) * 100) 
    : 100;

  // Assiduidade = alunos com menos de 3 faltas e com presença registrada
  const alunosComPresencaAtiva = matriculas.filter(m => m.ultimaPresenca && m.faltasTotais < 3).length;
  const taxaAssiduidade = Math.round((alunosComPresencaAtiva / total) * 100);

  // Taxa de No-Show
  const taxaNoShow = Math.round((kpis.totalNuncaCompareceram / total) * 100);

  // Adoção App Smart
  const alunosComApp = matriculas.filter(m => m.hasAppActive).length;
  const taxaAdocaoApp = Math.round((alunosComApp / total) * 100);

  // Calcular valor de estorno sob risco (quitados em cancelamento)
  let capitalQuitadoRiscoEstorno = 0;
  matriculas.forEach(m => {
    if (m.isAguardandoQuitado) {
      capitalQuitadoRiscoEstorno += m.valorPagoNum || m.valorTotalNum || 0;
    }
  });

  // Agrupamento por Turma Canônica
  const turmasMap = new Map<string, {
    total: number;
    inadimplentes: number;
    valorVencido: number;
    somaFaltas: number;
    risco: number;
    comPresenca: number;
  }>();

  matriculas.forEach(m => {
    m.turmasCanonicas.forEach(tc => {
      if (!turmasMap.has(tc)) {
        turmasMap.set(tc, {
          total: 0,
          inadimplentes: 0,
          valorVencido: 0,
          somaFaltas: 0,
          risco: 0,
          comPresenca: 0
        });
      }
      const item = turmasMap.get(tc)!;
      item.total++;
      if (m.valorVencidoNum > 0) {
        item.inadimplentes++;
        item.valorVencido += m.valorVencidoNum;
      }
      item.somaFaltas += m.faltasTotais;
      if (m.quadranteRisco !== 'Q4_REGULAR') {
        item.risco++;
      }
      if (m.ultimaPresenca) {
        item.comPresenca++;
      }
    });
  });

  const turmas: import('../types/f10').TurmaAnalyticItem[] = Array.from(turmasMap.entries()).map(([turma, data]) => ({
    turma,
    totalAlunos: data.total,
    alunosInadimplentes: data.inadimplentes,
    valorVencido: data.valorVencido,
    taxaInadimplencia: data.total > 0 ? Math.round((data.inadimplentes / data.total) * 100) : 0,
    mediaFaltas: data.total > 0 ? Number((data.somaFaltas / data.total).toFixed(1)) : 0,
    alunosRisco: data.risco,
    taxaPresenca: data.total > 0 ? Math.round((data.comPresenca / data.total) * 100) : 0
  })).sort((a, b) => b.totalAlunos - a.totalAlunos);

  return {
    taxaRiscoEvasao,
    classificacaoEvasao,
    taxaRecuperabilidade,
    capitalEmAulaRecuperavel: kpis.receitaVencidaFrequentando,
    capitalAusenteRiscoPerda: kpis.receitaVencidaAusentes,
    capitalQuitadoRiscoEstorno,
    taxaAssiduidade,
    taxaNoShow,
    alunosNuncaCompareceram: kpis.totalNuncaCompareceram,
    taxaAdocaoApp,
    totalSemApp: kpis.alunosSemApp,
    turmas,
    distribuicaoRegime: {
      quitadosCount: kpis.totalQuitados,
      quitadosPercent: Math.round((kpis.totalQuitados / total) * 100),
      carneCount: kpis.totalCarne,
      carnePercent: Math.round((kpis.totalCarne / total) * 100)
    },
    distribuicaoQuadrantes: {
      q1Attending: kpis.alunosInadimplentesFrequentando,
      q1Absent: kpis.alunosInadimplentesAusentes,
      q2Churn: kpis.alunosRiscoEvasao,
      q3Cancel: kpis.solicitacoesCancelamento,
      q4Regular: matriculas.filter(m => m.quadranteRisco === 'Q4_REGULAR').length
    }
  };
}
