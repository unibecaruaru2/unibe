export type RegimeFinanceiro = 'QUITADO' | 'CARNE_MENSALISTA';

export type QuadranteRisco = 
  | 'Q1_OVERDUE_ATTENDING'   // Inadimplente Frequentando (Alto Potencial de Recuperação)
  | 'Q1_OVERDUE_ABSENT'      // Inadimplente Ausente (Risco Duplo: Financeiro + Evasão)
  | 'Q2_ABSENT_CHURN'         // Risco Crítico de Evasão (Faltas >= 3, Ativo sem débito vencido)
  | 'Q3_WAITING_CANCEL'       // Aguardando Cancelamento (Fila de Retenção)
  | 'Q4_REGULAR';             // Aluno Regular / Saudável

export interface TurmaAtribuida {
  raw: string;
  codigoTurma: string;
  codigoCanonico: string; // Turma normalizada (ex: PM.7 e PM.707 unificadas)
  professor: string;
  turno?: string;
}

export interface MatriculaAcademicaF10 {
  id: string;
  contrato: string;
  alunoNome: string;
  unidade?: string; // Unidade escolar (ex: "Caruaru", "Recife", etc.)
  statusContrato: 'Ativo' | 'Aguardando' | 'Cancelado' | string;
  
  // Contato & Identificação Pessoal
  telefonePrincipal: string;
  telefoneSecundario?: string;
  telefoneComercial?: string;
  whatsappUrl: string;
  nascimento?: string;
  idade?: number;
  sexo?: 'M' | 'F' | string;
  bairro?: string;
  
  // Turmas & Pedagogia
  turmas: TurmaAtribuida[];
  turmasCanonicas: string[];
  dataMatricula: string;
  dataInicio?: string;
  ultimaPresenca?: string;
  ultimaFalta?: string;
  faltasTotais: number;
  isNoShow: boolean; // Se tem faltas acumuladas e nenhuma presença registrada
  nuncaCompareceu: boolean; // Verdadeiro quando a aluna nunca veio para aula presencial (sem data de presença)
  
  // Financeiro & F10
  origemContratoF10: 'A.V' | 'S.A.V' | 'Venda' | 'Bolsa' | 'A.C' | string;
  regime: RegimeFinanceiro;
  proximoVencimento?: string;
  valorTotal?: string;
  valorTotalNum: number;
  valorPago?: string;
  valorPagoNum: number;
  valorAberto?: string;
  valorAbertoNum: number;
  valorVencido?: string;
  valorVencidoNum: number;
  parcelasVencidas: number;
  parcelasAberto: number;
  linkPagamentoF10?: string;
  
  // Status de App F10
  smartAluno: string; // Ex: "Cadastrado", "Não Cadastrado", "Acesso em..."
  smartTitular: string;
  hasAppActive: boolean;

  // Classificação Operacional de Risco
  quadranteRisco: QuadranteRisco;
  isAguardandoQuitado: boolean; // Aluno que quer cancelar mas já pagou o curso integral
  motivoCancelamento?: string;
  tratativaTipo?: string;
  tratativaNotas?: string;

  createdAt: string;
}

export interface F10KpisData {
  totalMatriculas: number;
  totalQuitados: number;
  totalCarne: number;
  totalTurmasUnicas: number;
  
  // Métricas de Risco & Inadimplência Geral
  receitaTotalVencida: number; // Inadimplência Geral em R$
  totalAlunosInadimplentes: number; // Todos com valorVencido > 0
  receitaVencidaFrequentando: number; // Q1 Frequentando
  alunosInadimplentesFrequentando: number;
  receitaVencidaAusentes: number; // Q1 Ausente
  alunosInadimplentesAusentes: number;

  alunosRiscoEvasao: number; // Q2
  solicitacoesCancelamento: number; // Q3
  cancelamentosQuitadosRiscoEstorno: number;
  alunosSemApp: number;
  alunosNoShow: number;
  totalNuncaCompareceram: number; // Quantidade de alunos que nunca vieram à aula presencial

  // Totais de Contratos e Valores Globais
  receitaTotalContratada: number;
  receitaTotalPaga: number;
  receitaTotalAberto: number;
}

export interface TurmaAnalyticItem {
  turma: string;
  totalAlunos: number;
  alunosInadimplentes: number;
  valorVencido: number;
  taxaInadimplencia: number;
  mediaFaltas: number;
  alunosRisco: number;
  taxaPresenca: number;
}

export interface ExecutiveIndices {
  // Índice de Evasão Global (0 - 100%)
  taxaRiscoEvasao: number;
  classificacaoEvasao: 'CONTROLADO' | 'ATENÇÃO' | 'CRÍTICO';
  
  // Índice de Recuperabilidade de Débito (0 - 100%)
  taxaRecuperabilidade: number;
  capitalEmAulaRecuperavel: number;
  capitalAusenteRiscoPerda: number;
  capitalQuitadoRiscoEstorno: number;

  // Índice de Saúde Acadêmica / Assiduidade
  taxaAssiduidade: number;
  taxaNoShow: number;
  alunosNuncaCompareceram: number;

  // Índice de Engajamento Digital
  taxaAdocaoApp: number;
  totalSemApp: number;

  // Distribuições
  turmas: TurmaAnalyticItem[];
  distribuicaoRegime: {
    quitadosCount: number;
    quitadosPercent: number;
    carneCount: number;
    carnePercent: number;
  };
  distribuicaoQuadrantes: {
    q1Attending: number;
    q1Absent: number;
    q2Churn: number;
    q3Cancel: number;
    q4Regular: number;
  };
}

export interface F10ParseResult {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia?: string;
  unidade?: string;
  totalRegistros: number;
  erros?: string[];
}
