import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  formatExecutiveName, 
  formatContractNumber, 
  formatStudentReportLine, 
  generateWhatsAppExecutiveReport 
} from './f10WhatsAppReports';
import { MatriculaAcademicaF10 } from '../types/f10';

const createMockMatricula = (overrides: Partial<MatriculaAcademicaF10> = {}): MatriculaAcademicaF10 => ({
  id: 'f10-1234',
  contrato: '2.388',
  alunoNome: 'Pietro Guilherme Amorim',
  statusContrato: 'Ativo',
  telefonePrincipal: '(81) 99156-4607',
  whatsappUrl: 'https://wa.me/5581991564607',
  turmas: [],
  turmasCanonicas: ['PM.7'],
  dataMatricula: '05/09/2026',
  faltasTotais: 0,
  isNoShow: false,
  nuncaCompareceu: false,
  origemContratoF10: 'Venda',
  regime: 'CARNE_MENSALISTA',
  valorTotalNum: 3500,
  valorPagoNum: 740,
  valorAbertoNum: 2760,
  valorVencido: 'R$ 265,00',
  valorVencidoNum: 265,
  parcelasVencidas: 1,
  parcelasAberto: 12,
  smartAluno: 'Cadastrado',
  smartTitular: 'Cadastrado',
  hasAppActive: true,
  quadranteRisco: 'Q1_OVERDUE_ATTENDING',
  isAguardandoQuitado: false,
  createdAt: '2026-10-22T00:00:00Z',
  ...overrides
});

describe('Módulo de Relatórios Executivos para WhatsApp (f10WhatsAppReports)', () => {

  it('formatContractNumber: deve normalizar contratos com ponto (2.388 -> 2388)', () => {
    assert.strictEqual(formatContractNumber('2.388'), '2388');
    assert.strictEqual(formatContractNumber('2404'), '2404');
    assert.strictEqual(formatContractNumber('CTR (1) BUGADO THIAGO VINICIUS'), 'CTR (1) BUGADO THIAGO VINICIUS');
  });

  it('formatExecutiveName: deve formatar primeiro e segundo nome', () => {
    assert.strictEqual(formatExecutiveName('Pietro Guilherme Amorim'), 'PIETRO GUILHERME');
    assert.strictEqual(formatExecutiveName('Francine Rodrigues da Silva'), 'FRANCINE RODRIGUES');
    assert.strictEqual(formatExecutiveName('Davi'), 'DAVI');
  });

  it('formatStudentReportLine: deve priorizar nota manual quando preenchida (ex: caso mãe internada / bolsa)', () => {
    const mat1 = createMockMatricula({
      contrato: '2404',
      alunoNome: 'Lucas Henrique',
      tratativaNotas: 'ELE FOI BOLSA E ESTÁ COM PARCELA DEVENDO, NÃO SEI O QUE TEM QUE FAZER (EXCLUIR AS PARCELAS?)'
    });
    const line1 = formatStudentReportLine(mat1);
    assert.ok(line1.includes('2404'));
    assert.ok(line1.includes('ELE FOI BOLSA E ESTÁ COM PARCELA DEVENDO'));

    const mat2 = createMockMatricula({
      contrato: '2386',
      alunoNome: 'Arthur Gabriel',
      tratativaNotas: 'É AQUELA SITUAÇÃO QUE A MÃE TA INTERNADA TEM QUE FALAR POR OUTRO NÚMERO'
    });
    const line2 = formatStudentReportLine(mat2);
    assert.ok(line2.includes('2386'));
    assert.ok(line2.includes('É AQUELA SITUAÇÃO QUE A MÃE TA INTERNADA'));
  });

  it('formatStudentReportLine: se não houver nota, formata atraso e vencimento sem poluição', () => {
    const mat = createMockMatricula({
      contrato: '2.388',
      alunoNome: 'Pietro Guilherme',
      proximoVencimento: '20/10',
      valorVencido: 'R$ 265,00',
      valorVencidoNum: 265,
      quadranteRisco: 'Q1_OVERDUE_ATTENDING'
    });
    const line = formatStudentReportLine(mat);
    assert.ok(line.includes('2388'));
    assert.ok(line.includes('265,00'));
    assert.ok(line.includes('20/10'));
  });

  it('formatStudentReportLine: deve tratar aluno aguardando cancelamento', () => {
    const mat = createMockMatricula({
      contrato: '2.350',
      alunoNome: 'Maria Eduarda',
      statusContrato: 'Aguardando',
      quadranteRisco: 'Q3_WAITING_CANCEL'
    });
    const line = formatStudentReportLine(mat);
    assert.ok(line.includes('2350'));
    assert.ok(line.includes('AGUARDANDO CANCELAMENTO'));
  });

  it('generateWhatsAppExecutiveReport: deve gerar cabeçalho, resumo e lista formatada', () => {
    const m1 = createMockMatricula({
      contrato: '2.388',
      alunoNome: 'Pietro Guilherme',
      valorVencido: 'R$ 265,00',
      valorVencidoNum: 265
    });
    const m2 = createMockMatricula({
      contrato: '2.387',
      alunoNome: 'Lucas Gabriel',
      valorVencido: 'R$ 230,00',
      valorVencidoNum: 230
    });

    const report = generateWhatsAppExecutiveReport({
      matriculas: [m1, m2],
      tabTitle: 'Matrículas de Abril - Outubro Mensalistas Devedores',
      periodoReferencia: '01/07 a 21/10',
      options: { includeExecutiveSummary: true }
    });

    assert.ok(report.includes('*MATRÍCULAS DE ABRIL - OUTUBRO MENSALISTAS DEVEDORES*'));
    assert.ok(report.includes('*Total:* 2 alunos'));
    assert.ok(report.includes('2388'));
    assert.ok(report.includes('2387'));
  });

  it('generateWhatsAppExecutiveReport: deve incluir o nome da unidade no cabeçalho quando fornecido', () => {
    const m1 = createMockMatricula({
      contrato: '2.388',
      alunoNome: 'Pietro Guilherme',
      unidade: 'Caruaru'
    });

    const reportCaruaru = generateWhatsAppExecutiveReport({
      matriculas: [m1],
      tabTitle: 'Inadimplentes F10',
      unidade: 'Caruaru'
    });

    assert.ok(reportCaruaru.includes('*UNIBE CARUARU | INADIMPLENTES F10*'));

    const reportRecife = generateWhatsAppExecutiveReport({
      matriculas: [m1],
      tabTitle: 'Inadimplentes F10',
      unidade: 'Recife'
    });

    assert.ok(reportRecife.includes('*UNIBE RECIFE | INADIMPLENTES F10*'));
  });
});
