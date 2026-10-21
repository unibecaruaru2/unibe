import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFourSaturdays,
  evaluateCertificateEligibility,
  formatDatePtBR,
  formatDateIso,
  formatWhatsAppMessage,
  generateWhatsAppUrl,
  sanitizePhoneNumber,
  isSaturday,
  getDetailedSchedule,
  extractCivilDateParts,
  type AttendanceStatus,
  type WhatsAppTemplateData
} from './social-training.js';

describe('Módulo de Treinamento Social - Suíte de Regras de Negócio e Testes de Borda', () => {
  // ==========================================================================
  // 1. Testes de calculateFourSaturdays e Manipulação de Datas
  // ==========================================================================
  describe('calculateFourSaturdays() - Regras de Calendário e Sábados', () => {
    it('deve retornar exatamente 4 datas de sábados consecutivos (+0d, +7d, +14d, +21d)', () => {
      // 03/11/2025 é uma segunda-feira
      const saturdays = calculateFourSaturdays('2025-11-03');

      assert.strictEqual(saturdays.length, 4, 'Deve retornar exatamente 4 datas');

      const expectedIso = ['2025-11-08', '2025-11-15', '2025-11-22', '2025-11-29'];
      saturdays.forEach((sat, i) => {
        assert.strictEqual(isSaturday(sat), true, `Aula ${i + 1} deve ser um sábado`);
        assert.strictEqual(formatDateIso(sat), expectedIso[i]);
      });

      // Validar intervalo de 7 dias entre cada aula consecutiva
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      for (let i = 1; i < saturdays.length; i++) {
        const diff = saturdays[i].getTime() - saturdays[i - 1].getTime();
        assert.strictEqual(diff, ONE_WEEK_MS, `Intervalo entre aula ${i} e ${i + 1} deve ser de exatamente 7 dias`);
      }
    });

    describe('Regra de borda: Matrícula realizada exatamente em um sábado', () => {
      // 08/11/2025 é sábado
      const saturdayDateStr = '2025-11-08';

      it('quando includeSameDaySaturday === false (padrão): deve agendar Aula 1 para o próximo sábado (+7d)', () => {
        const saturdays = calculateFourSaturdays(saturdayDateStr);

        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-15', 'Aula 1 deve ser o próximo sábado');
        assert.strictEqual(formatDateIso(saturdays[1]), '2025-11-22');
        assert.strictEqual(formatDateIso(saturdays[2]), '2025-11-29');
        assert.strictEqual(formatDateIso(saturdays[3]), '2025-12-06');
      });

      it('quando includeSameDaySaturday === true: deve agendar Aula 1 para o mesmo sábado (+0d)', () => {
        const saturdays = calculateFourSaturdays(saturdayDateStr, { includeSameDaySaturday: true });

        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08', 'Aula 1 deve ser o próprio sábado');
        assert.strictEqual(formatDateIso(saturdays[1]), '2025-11-15');
        assert.strictEqual(formatDateIso(saturdays[2]), '2025-11-22');
        assert.strictEqual(formatDateIso(saturdays[3]), '2025-11-29');
      });
    });

    describe('Cálculo correto a partir de cada dia da semana', () => {
      // Semana de 02/11/2025 (domingo) até 08/11/2025 (sábado)
      it('matrícula no Domingo (02/11/2025) -> Primeiro sábado é 08/11/2025 (+6 dias)', () => {
        const saturdays = calculateFourSaturdays('2025-11-02');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('matrícula na Segunda-feira (03/11/2025) -> Primeiro sábado é 08/11/2025 (+5 dias)', () => {
        const saturdays = calculateFourSaturdays('2025-11-03');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('matrícula na Terça-feira (04/11/2025) -> Primeiro sábado é 08/11/2025 (+4 dias)', () => {
        const saturdays = calculateFourSaturdays('2025-11-04');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('matrícula na Quarta-feira (05/11/2025) -> Primeiro sábado é 08/11/2025 (+3 dias)', () => {
        const saturdays = calculateFourSaturdays('2025-11-05');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('matrícula na Quinta-feira (06/11/2025) -> Primeiro sábado é 08/11/2025 (+2 dias)', () => {
        const saturdays = calculateFourSaturdays('2025-11-06');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('matrícula na Sexta-feira (07/11/2025) -> Primeiro sábado é 08/11/2025 (+1 dia)', () => {
        const saturdays = calculateFourSaturdays('2025-11-07');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });
    });

    describe('Casos de Borda Críticos: Ano Bissexto e Transições de Mês e Ano', () => {
      it('ano bissexto (2024): matrícula em 26/02/2024 (segunda-feira) atravessando 29 de Fevereiro', () => {
        const saturdays = calculateFourSaturdays('2024-02-26');
        // Fevereiro de 2024 teve 29 dias (29/02 foi quinta-feira, 01/03 sexta, 02/03 sábado)
        assert.strictEqual(formatDateIso(saturdays[0]), '2024-03-02');
        assert.strictEqual(formatDateIso(saturdays[1]), '2024-03-09');
        assert.strictEqual(formatDateIso(saturdays[2]), '2024-03-16');
        assert.strictEqual(formatDateIso(saturdays[3]), '2024-03-23');
      });

      it('ano bissexto (2024): matrícula no exato dia 29/02/2024 (quinta-feira)', () => {
        const saturdays = calculateFourSaturdays('2024-02-29');
        assert.strictEqual(formatDateIso(saturdays[0]), '2024-03-02');
      });

      it('ano não bissexto (2025): matrícula em 26/02/2025 (quarta-feira) com Fev tendo 28 dias', () => {
        const saturdays = calculateFourSaturdays('2025-02-26');
        // 28/02/2025 é sexta-feira -> primeiro sábado é 01/03/2025
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-03-01');
        assert.strictEqual(formatDateIso(saturdays[1]), '2025-03-08');
        assert.strictEqual(formatDateIso(saturdays[2]), '2025-03-15');
        assert.strictEqual(formatDateIso(saturdays[3]), '2025-03-22');
      });

      it('transição de Ano (Dezembro para Janeiro: 2025 -> 2026)', () => {
        // 22/12/2025 é segunda-feira
        const saturdays = calculateFourSaturdays('2025-12-22');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-12-27');
        assert.strictEqual(formatDateIso(saturdays[1]), '2026-01-03');
        assert.strictEqual(formatDateIso(saturdays[2]), '2026-01-10');
        assert.strictEqual(formatDateIso(saturdays[3]), '2026-01-17');
      });

      it('transição de Ano no último sábado do ano (27/12/2025)', () => {
        const saturdays = calculateFourSaturdays('2025-12-27', { includeSameDaySaturday: true });
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-12-27');
        assert.strictEqual(formatDateIso(saturdays[1]), '2026-01-03');
        assert.strictEqual(formatDateIso(saturdays[2]), '2026-01-10');
        assert.strictEqual(formatDateIso(saturdays[3]), '2026-01-17');
      });
    });

    describe('Imunidade a Fusos Horários e Diferentes Formatos de Entrada', () => {
      it('deve aceitar string "DD/MM/YYYY" padrão brasileiro', () => {
        const saturdays = calculateFourSaturdays('03/11/2025');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('deve aceitar objeto Date nativo instanciado', () => {
        const dateObj = new Date(2025, 10, 3, 14, 30, 0); // 3 de Novembro de 2025
        const saturdays = calculateFourSaturdays(dateObj);
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('deve aceitar ISO string completa com UTC timezone (Z)', () => {
        const saturdays = calculateFourSaturdays('2025-11-03T23:59:59.000Z');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('deve aceitar ISO string com offset explícito de fuso (-03:00)', () => {
        const saturdays = calculateFourSaturdays('2025-11-03T10:00:00-03:00');
        assert.strictEqual(formatDateIso(saturdays[0]), '2025-11-08');
      });

      it('deve rejeitar datas inválidas ou inexistentes no calendário', () => {
        assert.throws(() => calculateFourSaturdays('data-invalida'), /Data inválida fornecida/);
        assert.throws(() => calculateFourSaturdays('2025-02-29'), /Data de calendário inexistente/);
        assert.throws(() => calculateFourSaturdays('2025-04-31'), /Data de calendário inexistente/);
      });
    });
  });

  // ==========================================================================
  // 2. Utilitários de Formatação em pt-BR
  // ==========================================================================
  describe('Utilitários de Formatação (formatDatePtBR, getDetailedSchedule)', () => {
    it('formatDatePtBR formato "short": deve exibir DD/MM/YYYY', () => {
      assert.strictEqual(formatDatePtBR('2025-11-08', 'short'), '08/11/2025');
      assert.strictEqual(formatDatePtBR('2026-01-03', 'short'), '03/01/2026');
    });

    it('formatDatePtBR formato "long": deve exibir DD de Mês de YYYY com inicial maiúscula', () => {
      assert.strictEqual(formatDatePtBR('2025-11-08', 'long'), '08 de Novembro de 2025');
      assert.strictEqual(formatDatePtBR('2026-03-07', 'long'), '07 de Março de 2026');
    });

    it('getDetailedSchedule: deve retornar detalhes de cada uma das 4 aulas', () => {
      const schedule = getDetailedSchedule('2025-11-03');
      assert.strictEqual(schedule.length, 4);

      assert.strictEqual(schedule[0].classNumber, 1);
      assert.strictEqual(schedule[0].dateIso, '2025-11-08');
      assert.strictEqual(schedule[0].dateShort, '08/11/2025');
      assert.strictEqual(schedule[0].dateLong, '08 de Novembro de 2025');

      assert.strictEqual(schedule[3].classNumber, 4);
      assert.strictEqual(schedule[3].dateIso, '2025-11-29');
      assert.strictEqual(schedule[3].dateShort, '29/11/2025');
      assert.strictEqual(schedule[3].dateLong, '29 de Novembro de 2025');
    });
  });

  // ==========================================================================
  // 3. Testes de evaluateCertificateEligibility (Regra Estrita de 100% de Presença)
  // ==========================================================================
  describe('evaluateCertificateEligibility() - Elegibilidade para Certificado', () => {
    it('Cenário 1: 4 presenças completas e taxa PAGA -> PAGO_LIBERADO (canIssue: true)', () => {
      const attendances: AttendanceStatus[] = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'PRESENTE'];
      const result = evaluateCertificateEligibility(attendances, true);

      assert.deepStrictEqual(result, {
        status: 'PAGO_LIBERADO',
        canIssue: true,
        presentCount: 4,
        totalClasses: 4
      });
    });

    it('Cenário 2: 4 presenças completas e taxa NÃO paga -> PENDENTE_PAGAMENTO (canIssue: false)', () => {
      const attendances: AttendanceStatus[] = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'PRESENTE'];
      const result = evaluateCertificateEligibility(attendances, false);

      assert.deepStrictEqual(result, {
        status: 'PENDENTE_PAGAMENTO',
        canIssue: false,
        presentCount: 4,
        totalClasses: 4
      });
    });

    describe('Cenário 3: Qualquer FALTA deve reprovar imediatamente como NAO_ELEGIVEL', () => {
      const expectedReason = 'Possui faltas registradas. O Treinamento Social exige 100% de frequência.';

      it('falta na Aula 1', () => {
        const records: AttendanceStatus[] = ['FALTA', 'PRESENTE', 'PRESENTE', 'PRESENTE'];
        const result = evaluateCertificateEligibility(records, true);
        assert.strictEqual(result.status, 'NAO_ELEGIVEL');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 3);
        assert.strictEqual(result.reason, expectedReason);
      });

      it('falta na Aula 2', () => {
        const records: AttendanceStatus[] = ['PRESENTE', 'FALTA', 'PRESENTE', 'PRESENTE'];
        const result = evaluateCertificateEligibility(records, true);
        assert.strictEqual(result.status, 'NAO_ELEGIVEL');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 3);
      });

      it('falta na Aula 3', () => {
        const records: AttendanceStatus[] = ['PRESENTE', 'PRESENTE', 'FALTA', 'PRESENTE'];
        const result = evaluateCertificateEligibility(records, false);
        assert.strictEqual(result.status, 'NAO_ELEGIVEL');
        assert.strictEqual(result.canIssue, false);
      });

      it('falta na Aula 4', () => {
        const records: AttendanceStatus[] = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'FALTA'];
        const result = evaluateCertificateEligibility(records, true);
        assert.strictEqual(result.status, 'NAO_ELEGIVEL');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 3);
      });

      it('falta prematura com aulas pendentes (ex: faltou na aula 1)', () => {
        const records: AttendanceStatus[] = ['FALTA', 'PENDENTE'];
        const result = evaluateCertificateEligibility(records, false);
        assert.strictEqual(result.status, 'NAO_ELEGIVEL');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.reason, expectedReason);
      });
    });

    describe('Cenário 4: Treinamento em andamento sem faltas -> EM_ANDAMENTO', () => {
      it('início do treinamento com array vazio []', () => {
        const result = evaluateCertificateEligibility([], false);
        assert.strictEqual(result.status, 'EM_ANDAMENTO');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 0);
        assert.strictEqual(result.totalClasses, 4);
      });

      it('1 presença registrada e 3 pendentes', () => {
        const result = evaluateCertificateEligibility(['PRESENTE', 'PENDENTE', 'PENDENTE', 'PENDENTE'], false);
        assert.strictEqual(result.status, 'EM_ANDAMENTO');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 1);
        assert.strictEqual(result.totalClasses, 4);
      });

      it('3 presenças registradas em array curto (tamanho 3 sem faltas)', () => {
        const result = evaluateCertificateEligibility(['PRESENTE', 'PRESENTE', 'PRESENTE'], true);
        assert.strictEqual(result.status, 'EM_ANDAMENTO');
        assert.strictEqual(result.canIssue, false);
        assert.strictEqual(result.presentCount, 3);
      });
    });

    describe('Validações e Tratamento de Erros', () => {
      it('deve aceitar status em lowercase de forma resiliente', () => {
        const records = ['presente', 'presente', 'presente', 'presente'] as unknown as AttendanceStatus[];
        const result = evaluateCertificateEligibility(records, true);
        assert.strictEqual(result.status, 'PAGO_LIBERADO');
      });

      it('deve lançar erro se receber status de presença não reconhecido', () => {
        const records = ['PRESENTE', 'JUSTIFICADA'] as unknown as AttendanceStatus[];
        assert.throws(
          () => evaluateCertificateEligibility(records, false),
          /Status de presença inválido: "JUSTIFICADA"/
        );
      });

      it('deve lançar TypeError se não receber array', () => {
        assert.throws(
          () => evaluateCertificateEligibility(null as unknown as AttendanceStatus[], false),
          /attendanceRecords deve ser um array/
        );
      });
    });
  });

  // ==========================================================================
  // 4. Testes de formatWhatsAppMessage e generateWhatsAppUrl
  // ==========================================================================
  describe('Integração de Mensagens WhatsApp e Sanitização de Telefones', () => {
    describe('formatWhatsAppMessage()', () => {
      const template =
        'Olá, {nome_responsavel}! Informamos que o aluno {nome_aluno} tem a Aula {numero_aula} confirmada para {data_aula} às {horario}. Link: {link_confirmacao}';

      const data: WhatsAppTemplateData = {
        nome_responsavel: 'Maria Santos',
        nome_aluno: 'Pedro Santos',
        numero_aula: 1,
        data_aula: '08/11/2025',
        horario: '09:00',
        link_confirmacao: 'https://unibe.edu.br/confirm/abc123'
      };

      it('deve substituir todas as tags do template com sucesso', () => {
        const formatted = formatWhatsAppMessage(template, data);
        assert.strictEqual(
          formatted,
          'Olá, Maria Santos! Informamos que o aluno Pedro Santos tem a Aula 1 confirmada para 08/11/2025 às 09:00. Link: https://unibe.edu.br/confirm/abc123'
        );
      });

      it('deve ser tolerante a espaços internos nas tags ({ nome_aluno })', () => {
        const spacedTemplate = 'Aluno: {  nome_aluno  } | Aula: { numero_aula }';
        const formatted = formatWhatsAppMessage(spacedTemplate, { nome_aluno: 'Lucas', numero_aula: 2 });
        assert.strictEqual(formatted, 'Aluno: Lucas | Aula: 2');
      });

      it('deve substituir múltiplas ocorrências da mesma tag', () => {
        const repeatedTemplate = '{nome_aluno} compareça. Parabéns, {nome_aluno}!';
        const formatted = formatWhatsAppMessage(repeatedTemplate, { nome_aluno: 'Ana' });
        assert.strictEqual(formatted, 'Ana compareça. Parabéns, Ana!');
      });

      it('se uma tag estiver ausente: substitui por vazio por padrão', () => {
        const partialTemplate = 'Olá {nome_responsavel}, seu código é {codigo_inexistente}.';
        const formatted = formatWhatsAppMessage(partialTemplate, { nome_responsavel: 'Carlos' });
        assert.strictEqual(formatted, 'Olá Carlos, seu código é .');
      });

      it('se preserveMissingTags === true: mantém a tag original quando ausente', () => {
        const partialTemplate = 'Olá {nome_responsavel}, seu código é {codigo_inexistente}.';
        const formatted = formatWhatsAppMessage(
          partialTemplate,
          { nome_responsavel: 'Carlos' },
          { preserveMissingTags: true }
        );
        assert.strictEqual(formatted, 'Olá Carlos, seu código é {codigo_inexistente}.');
      });

      it('deve lançar TypeError se template não for string', () => {
        assert.throws(
          () => formatWhatsAppMessage(null as unknown as string, {}),
          /Template deve ser uma string/
        );
      });
    });

    describe('sanitizePhoneNumber() - Formatação para DDI 55 Brasil', () => {
      it('número com máscara padrão celular "(11) 99999-8888" -> "5511999998888"', () => {
        assert.strictEqual(sanitizePhoneNumber('(11) 99999-8888'), '5511999998888');
      });

      it('número celular sem formatação "11999998888" (11 dígitos) -> "5511999998888"', () => {
        assert.strictEqual(sanitizePhoneNumber('11999998888'), '5511999998888');
      });

      it('número com DDI e sinal de mais "+55 (11) 99999-8888" -> "5511999998888"', () => {
        assert.strictEqual(sanitizePhoneNumber('+55 (11) 99999-8888'), '5511999998888');
      });

      it('número já com DDI 55 sem formatação "5511999998888" -> mantém "5511999998888"', () => {
        assert.strictEqual(sanitizePhoneNumber('5511999998888'), '5511999998888');
      });

      it('telefone fixo brasileiro "(11) 3333-4444" (10 dígitos) -> "551133334444"', () => {
        assert.strictEqual(sanitizePhoneNumber('(11) 3333-4444'), '551133334444');
      });

      it('número com zero à esquerda de operadora "011999998888" -> remove zero -> "5511999998888"', () => {
        assert.strictEqual(sanitizePhoneNumber('011999998888'), '5511999998888');
      });

      it('deve lançar erro se o número de telefone for inválido ou muito curto', () => {
        assert.throws(() => sanitizePhoneNumber('12345'), /Número de telefone inválido/);
        assert.throws(() => sanitizePhoneNumber('abc'), /Número de telefone inválido/);
        assert.throws(() => sanitizePhoneNumber(123 as unknown as string), /Telefone deve ser uma string/);
      });
    });

    describe('generateWhatsAppUrl()', () => {
      it('deve gerar a URL wa.me com telefone sanitizado e mensagem codificada via encodeURIComponent', () => {
        const phone = '(11) 98765-4321';
        const message = 'Olá! Sua aula será no dia 08/11/2025 às 09h00.';
        const url = generateWhatsAppUrl(phone, message);

        const expectedEncoded = encodeURIComponent(message);
        assert.strictEqual(url, `https://wa.me/5511987654321?text=${expectedEncoded}`);
      });

      it('deve codificar corretamente quebras de linha e caracteres acentuados', () => {
        const phone = '5511987654321';
        const message = 'Linha 1\nLinha 2: Ação & Confirmação!';
        const url = generateWhatsAppUrl(phone, message);

        assert.ok(url.startsWith('https://wa.me/5511987654321?text='));
        assert.ok(!url.includes('\n'), 'Não deve conter quebras de linha cruas');
        assert.ok(!url.includes(' '), 'Não deve conter espaços crus');
      });
    });
  });
});
