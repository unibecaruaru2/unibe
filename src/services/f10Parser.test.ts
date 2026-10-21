import { test, describe } from 'node:test';
import assert from 'node:assert';
import { classificarRegime, parseTurmas, sanitizePhoneToWhatsApp } from './f10Parser';
import { canonicalizeTurma, classifyRiskQuadrant, parseCurrencyNumber } from '../utils/f10Analytics';

describe('Módulo de Prevenção de Evasão, Recuperação & Risco ERP F10', () => {
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

    test('deve manter outras turmas específicas intactas', () => {
      assert.strictEqual(canonicalizeTurma('Epcar-707-1'), 'Epcar-707-1');
      assert.strictEqual(canonicalizeTurma('Mirim.35-1'), 'Mirim.35-1');
      assert.strictEqual(canonicalizeTurma('Ad.2401-1'), 'Ad.2401-1');
    });
  });

  describe('classifyRiskQuadrant() - Matriz de 4 Quadrantes Operacionais', () => {
    test('Q3: Aluno com status Aguardando deve ser classificado como Fila de Retenção', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Aguardando',
        valorVencidoNum: 0,
        faltasTotais: 1,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q3_WAITING_CANCEL');
    });

    test('Q1: Aluno com valor vencido > 0 e presença recente deve ser Inadimplente Frequente', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 230.00,
        faltasTotais: 0,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q1_OVERDUE_ATTENDING');
    });

    test('Q2: Aluno com 3 ou mais faltas e status Ativo deve ser Risco Crítico de Evasão', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 0,
        faltasTotais: 7,
        ultimaPresenca: '13/08/2026'
      });
      assert.strictEqual(q, 'Q2_ABSENT_CHURN');
    });

    test('Q4: Aluno sem atrasos e com baixa ausência deve ser Regular / Saudável', () => {
      const q = classifyRiskQuadrant({
        statusContrato: 'Ativo',
        valorVencidoNum: 0,
        faltasTotais: 0,
        ultimaPresenca: '17/10/2026'
      });
      assert.strictEqual(q, 'Q4_REGULAR');
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
    test('deve classificar A.V (À Vista pontuado) como QUITADO', () => {
      assert.strictEqual(classificarRegime('A.V'), 'QUITADO');
    });

    test('deve classificar S.A.V (Super À Vista pontuado) como QUITADO', () => {
      assert.strictEqual(classificarRegime('S.A.V'), 'QUITADO');
    });

    test('deve classificar Venda como CARNE_MENSALISTA', () => {
      assert.strictEqual(classificarRegime('Venda'), 'CARNE_MENSALISTA');
    });
  });

  describe('parseTurmas()', () => {
    test('deve separar turmas e extrair código canônico e turno', () => {
      const raw = 'Mirim.35-1 - Raphael Nonato,Mirim.7- Manhã - Raphael Nonato';
      const result = parseTurmas(raw);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].codigoTurma, 'Mirim.35-1');
      assert.strictEqual(result[1].codigoCanonico, 'Mirim 7 / 707 (Manhã)');
      assert.strictEqual(result[1].turno, 'Manhã');
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
