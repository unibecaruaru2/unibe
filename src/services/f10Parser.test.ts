import { test, describe } from 'node:test';
import assert from 'node:assert';
import { classificarRegime, parseTurmas, sanitizePhoneToWhatsApp, resolveRowDates } from './f10Parser';
import { canonicalizeTurma, classifyRiskQuadrant, parseCurrencyNumber, calculateF10Kpis, calculateExecutiveIndices } from '../utils/f10Analytics';
import { SAMPLE_F10_MATRICULAS } from '../data/mockF10Data';

describe('Módulo de Prevenção de Evasão, Inadimplência Geral & Sincronização F10', () => {
  describe('canonicalizeTurma() - Unificação Canônica de Turmas', () => {
    test('deve unificar PM.7 e PM.707 na mesma turma canônica', () => {
      assert.strictEqual(canonicalizeTurma('Pm.707-1'), 'PM.7 / PM.707 (Manhã)');
      assert.strictEqual(canonicalizeTurma('Pm.7 - Manhã'), 'PM.7 / PM.707 (Manhã)');
      assert.strictEqual(canonicalizeTurma('Pm.7 - Tarde'), 'PM.7 / PM.707 (Tarde)');
    });

    test('deve unificar Mirim 7 - Manhã e Mirim 707 na mesma turma canônica', () => {
      assert.strictEqual(canonicalizeTurma('Mirim.707-1'), 'Mirim 7 / 707 (Manhã)');
      assert.strictEqual(canonicalizeTurma('Mirim.7- Manhã'), 'Mirim 7 / 707 (Manhã)');
    });
  });

  describe('classifyRiskQuadrant() - Inadimplência Frequentando vs Inadimplente Ausente', () => {
    test('Q1: Inadimplente Frequentando (valor vencido > 0 e presença recente)', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 230.00,
        faltasTotais: 0,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q1_OVERDUE_ATTENDING');
    });

    test('Q1: Inadimplente Ausente (valor vencido > 0 e sem presença recente)', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 600.00,
        faltasTotais: 10,
        ultimaPresenca: undefined
      });
      assert.strictEqual(q, 'Q1_OVERDUE_ABSENT');
    });

    test('Q3: Aluno com status Aguardando deve ser Fila de Retenção', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Aguardando',
        valorVencidoNum: 0,
        faltasTotais: 1,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q3_WAITING_CANCEL');
    });

    test('Q2: Aluno com 3 ou mais faltas e status Ativo deve ser Risco de Evasão', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 0,
        faltasTotais: 7,
        ultimaPresenca: '13/08/2026'
      });
      assert.strictEqual(q, 'Q2_ABSENT_CHURN');
    });

    test('Q4: Aluno regular e sem atrasos', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 0,
        faltasTotais: 0,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q4_REGULAR');
    });
  });

  describe('calculateF10Kpis() - Métricas de Inadimplência Geral', () => {
    test('deve calcular corretamente a receita total vencida e a divisão entre frequentando e ausentes', () => {
      const kpis = calculateF10Kpis(SAMPLE_F10_MATRICULAS);
      assert.ok(kpis.receitaTotalVencida > 0);
      assert.ok(kpis.totalAlunosInadimplentes > 0);
      assert.ok(kpis.alunosInadimplentesFrequentando > 0);
      assert.ok(kpis.alunosInadimplentesAusentes > 0);
      assert.strictEqual(
        kpis.receitaTotalVencida, 
        kpis.receitaVencidaFrequentando + kpis.receitaVencidaAusentes
      );
    });
  });

  describe('parseCurrencyNumber()', () => {
    test('deve converter valores brasileiros com ponto de milhar e vírgula', () => {
      assert.strictEqual(parseCurrencyNumber('R$ 3.180,00'), 3180);
      assert.strictEqual(parseCurrencyNumber('R$ 6.580,00'), 6580);
      assert.strictEqual(parseCurrencyNumber('R$ 230,00'), 230);
      assert.strictEqual(parseCurrencyNumber(undefined), 0);
    });
  });

  describe('classificarRegime()', () => {
    test('deve classificar A.V e S.A.V como QUITADO e Venda como CARNE_MENSALISTA', () => {
      assert.strictEqual(classificarRegime('A.V'), 'QUITADO');
      assert.strictEqual(classificarRegime('S.A.V'), 'QUITADO');
      assert.strictEqual(classificarRegime('Venda'), 'CARNE_MENSALISTA');
    });
  });

  describe('sanitizePhoneToWhatsApp()', () => {
    test('deve formatar número com DDD e gerar link wa.me', () => {
      const { formatted, cleanDigits, waUrl } = sanitizePhoneToWhatsApp('(81) 98162-7167');
      assert.strictEqual(formatted, '(81) 98162-7167');
      assert.strictEqual(cleanDigits, '5581981627167');
      assert.strictEqual(waUrl, 'https://wa.me/5581981627167');
    });
  });

  describe('resolveRowDates() - Resolução Posicional X de Datas F10 (Caso Francine CTR 2288)', () => {
    test('deve resolver corretamente Francine CTR 2288 com Última Presença 17/10/2026 e Matrícula 06/05/2026', () => {
      // Simula linha extraída com itens e coordenadas X reais do relatório F10
      const mockLine = {
        y: 450,
        fullText: 'Ativo 06/05/2026 17/10/2026 Mirim.7- Manhã - Raphael Nonato',
        items: [
          { text: 'Ativo', x: 125, y: 450, width: 25 },
          { text: '17/10/2026', x: 235, y: 450, width: 45 }, // Coluna Presença (x ~ 235)
          { text: '06/05/2026', x: 290, y: 450, width: 45 }, // Coluna Matrícula (x ~ 290)
          { text: 'Mirim.7- Manhã - Raphael Nonato', x: 360, y: 450, width: 120 }
        ]
      };

      const headerCols = {
        xPresenca: 235,
        xMatricula: 290
      };

      const dates = resolveRowDates(mockLine, headerCols);
      assert.strictEqual(dates.ultimaPresenca, '17/10/2026', 'Última presença deve ser 17/10/2026');
      assert.strictEqual(dates.dataMatricula, '06/05/2026', 'Data de matrícula deve ser 06/05/2026');
    });

    test('deve identificar aluna que NUNCA compareceu quando coluna presença estiver sem data', () => {
      const mockLine = {
        y: 420,
        fullText: 'Ativo 15/08/2026 Mirim.7- Manhã',
        items: [
          { text: 'Ativo', x: 125, y: 420, width: 25 },
          { text: '15/08/2026', x: 290, y: 420, width: 45 }, // Apenas Data Matrícula (x ~ 290)
          { text: 'Mirim.7- Manhã', x: 360, y: 420, width: 90 }
        ]
      };

      const headerCols = {
        xPresenca: 235,
        xMatricula: 290
      };

      const dates = resolveRowDates(mockLine, headerCols);
      assert.strictEqual(dates.ultimaPresenca, undefined, 'Última presença deve ser undefined para aluna que nunca veio');
      assert.strictEqual(dates.dataMatricula, '15/08/2026', 'Data de matrícula deve ser 15/08/2026');
    });
  });

  describe('calculateF10Kpis() - Métricas de Alunos que Nunca Compareceram', () => {
    test('deve contabilizar totalNuncaCompareceram na base', () => {
      const kpis = calculateF10Kpis(SAMPLE_F10_MATRICULAS);
      assert.ok(kpis.totalNuncaCompareceram > 0, 'Deve ter alunos sinalizados que nunca compareceram à aula presencial');
    });
  });

  describe('calculateExecutiveIndices() - Índices Estratégicos & Análise Multidimensional', () => {
    test('deve calcular taxa de risco de evasão, assiduidade e adoção do app', () => {
      const indices = calculateExecutiveIndices(SAMPLE_F10_MATRICULAS);
      assert.ok(indices.taxaRiscoEvasao >= 0 && indices.taxaRiscoEvasao <= 100);
      assert.ok(indices.taxaAssiduidade >= 0 && indices.taxaAssiduidade <= 100);
      assert.ok(indices.taxaAdocaoApp >= 0 && indices.taxaAdocaoApp <= 100);
      assert.ok(Array.isArray(indices.turmas));
      assert.ok(indices.turmas.length > 0);
      assert.ok(['CONTROLADO', 'ATENÇÃO', 'CRÍTICO'].includes(indices.classificacaoEvasao));
    });
  });
});
