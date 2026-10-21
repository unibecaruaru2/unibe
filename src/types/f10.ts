export type RegimeFinanceiro = 'QUITADO' | 'CARNE_MENSALISTA';

export interface TurmaAtribuida {
  raw: string;
  codigoTurma: string;
  professor: string;
  turno?: string;
}

export interface MatriculaAcademicaF10 {
  id: string;
  contrato: string;
  alunoNome: string;
  statusContrato: string;
  
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
  dataMatricula: string;
  dataInicio?: string;
  ultimaPresenca?: string;
  ultimaFalta?: string;
  
  // Financeiro & F10
  origemContratoF10: 'A.V' | 'S.A.V' | 'Venda' | string;
  regime: RegimeFinanceiro;
  proximoVencimento?: string;
  valorTotal?: string;
  valorPago?: string;
  valorAberto?: string;
  parcelasAberto?: number;
  linkPagamentoF10?: string;
  
  createdAt: string;
}

export interface F10KpisData {
  totalMatriculas: number;
  totalQuitados: number;
  totalCarne: number;
  totalTurmasUnicas: number;
  professoresUnicos: string[];
  valorTotalGeral: string;
  valorTotalQuitado: string;
  valorTotalEmAberto: string;
}

export interface F10ParseResult {
  matriculas: MatriculaAcademicaF10[];
  periodoReferencia?: string;
  totalRegistros: number;
  erros?: string[];
}
