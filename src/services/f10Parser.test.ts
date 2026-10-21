import { test, describe } from 'node:test';
import assert from 'node:assert';
import { classificarRegime, parseTurmas, sanitizePhoneToWhatsApp } from '../services/f10Parser';

describe('Serviço de Parser e Normalização ERP F10', () => {
  describe('classificarRegime()', () => {
    test('deve classificar A.V (À Vista pontuado) como QUITADO', () => {
      assert.strictEqual(classificarRegime('A.V'), 'QUITADO');
    });

    test('deve classificar S.A.V (Super À Vista pontuado) como QUITADO', () => {
      assert.strictEqual(classificarRegime('S.A.V'), 'QUITADO');
    });

    test('deve classificar AV sem pontos como QUITADO', () => {
      assert.strictEqual(classificarRegime('AV'), 'QUITADO');
    });

    test('deve classificar Venda como CARNE_MENSALISTA', () => {
      assert.strictEqual(classificarRegime('Venda'), 'CARNE_MENSALISTA');
    });

    test('deve tratar espaços e variações em minúsculo', () => {
      assert.strictEqual(classificarRegime('  a.v  '), 'QUITADO');
      assert.strictEqual(classificarRegime('  venda  '), 'CARNE_MENSALISTA');
    });
  });

  describe('parseTurmas()', () => {
    test('deve separar turmas compostas por vírgula e extrair professor e turno', () => {
      const raw = 'Mirim.35-1 - Raphael Nonato,Mirim.7- Manhã - Raphael Nonato';
      const result = parseTurmas(raw);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].codigoTurma, 'Mirim.35-1');
      assert.strictEqual(result[0].professor, 'Raphael Nonato');

      assert.strictEqual(result[1].codigoTurma, 'Mirim.7- Manhã');
      assert.strictEqual(result[1].professor, 'Raphael Nonato');
      assert.strictEqual(result[1].turno, 'Manhã');
    });

    test('deve suportar turmas triplas como o caso real da aluna Nicolly Alves', () => {
      const raw = 'Ad.2401-1 - Raphael Nonato,Pm.7 - Manhã - Dayana Silva,Pm.7 - Tarde - Dayana Silva';
      const result = parseTurmas(raw);

      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].codigoTurma, 'Ad.2401-1');
      assert.strictEqual(result[1].professor, 'Dayana Silva');
      assert.strictEqual(result[1].turno, 'Manhã');
      assert.strictEqual(result[2].professor, 'Dayana Silva');
      assert.strictEqual(result[2].turno, 'Tarde');
    });
  });

  describe('sanitizePhoneToWhatsApp()', () => {
    test('deve formatar número brasileiro com DDD e gerar link wa.me', () => {
      const { formatted, cleanDigits, waUrl } = sanitizePhoneToWhatsApp('(81) 98162-7167');
      assert.strictEqual(formatted, '(81) 98162-7167');
      assert.strictEqual(cleanDigits, '5581981627167');
      assert.strictEqual(waUrl, 'https://wa.me/5581981627167');
    });

    test('deve lidar com números de outros estados como Alagoas (82) e Rio de Janeiro (21)', () => {
      const r82 = sanitizePhoneToWhatsApp('(82) 99428-9131');
      assert.strictEqual(r82.cleanDigits, '5582994289131');

      const r21 = sanitizePhoneToWhatsApp('(21) 96504-6287');
      assert.strictEqual(r21.cleanDigits, '5521965046287');
    });
  });
});
