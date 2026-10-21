export type RegimeFinanceiro = 'QUITADO' | 'CARNE_MENSALISTA';

export type QuadranteRisco = 
  | 'Q1_OVERDUE_ATTENDING'   // Inadimplente Frequentando (Alto Potencial de Recuperação)
  | 'Q2_ABSENT_CHURN'         // Risco Crítico de Evasão (Faltas >= 3, Ativo)
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

  createdAt: string;
}

export interface F10KpisData {
  totalMatriculas: number;
  totalQuitados: number;
  totalCarne: number;
  totalTurmasUnicas: number;
  
  // Métricas de Risco & Prevenção
  receitaVencidaFrequentando: number;
  alunosRiscoEvasao: number; // Q2
  solicitacoesCancelamento: number; // Q3
  cancelamentosQuitadosRiscoEstorno: number;
  alunosSemApp: number;
  alunosNoShow: number;
}

export interface F10ParseResult {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia?: string;
  totalRegistros: number;
  erros?: string[];
}
