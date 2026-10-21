import { test, describe } from 'node:test';
import assert from 'node:assert';
import { classificarRegime, parseTurmas, sanitizePhoneToWhatsApp } from './f10Parser';
import { canonicalizeTurma, classifyRiskQuadrant, parseCurrencyNumber, calculateF10Kpis } from '../utils/f10Analytics';
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
});
