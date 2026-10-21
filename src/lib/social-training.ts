/**
 * UNIBE - Módulo de Treinamento Social
 * Camada de Regras de Negócio e Utilitários de Domínio
 */

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export type AttendanceStatus = 'PRESENTE' | 'FALTA' | 'PENDENTE';

export type CertificateStatus =
  | 'NAO_ELEGIVEL'
  | 'EM_ANDAMENTO'
  | 'PENDENTE_PAGAMENTO'
  | 'PAGO_LIBERADO';

export interface CertificateStatusResult {
  status: CertificateStatus;
  canIssue: boolean;
  presentCount: number;
  totalClasses: number;
  reason?: string;
}

export interface CalculateSaturdaysOptions {
  /**
   * Se a data de matrícula for exatamente em um sábado:
   * - true: Aula 1 é agendada para o próprio sábado de matrícula.
   * - false (padrão): Aula 1 é agendada para o próximo sábado subsequente (+7 dias).
   */
  includeSameDaySaturday?: boolean;
  /**
   * Fuso horário de referência para conversão de datas (ex: 'America/Sao_Paulo').
   * Padrão: 'America/Sao_Paulo'.
   */
  timeZone?: string;
}

export interface ClassScheduleItem {
  classNumber: number;
  date: Date;
  dateIso: string;
  dateShort: string;
  dateLong: string;
}

export interface WhatsAppTemplateData {
  nome_responsavel?: string;
  nome_aluno?: string;
  numero_aula?: number | string;
  data_aula?: string;
  horario?: string;
  link_confirmacao?: string;
  [key: string]: string | number | undefined;
}

export interface FormatTemplateOptions {
  /**
   * Se true, mantém tags que não possuem valor fornecido no objeto de dados.
   * Se false (padrão), substitui por string vazia ''.
   */
  preserveMissingTags?: boolean;
}

// ============================================================================
// Constantes de Domínio
// ============================================================================

export const TOTAL_CLASSES_REQUIRED = 4;
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
export const SATURDAY_DAY_OF_WEEK = 6; // 0 = Domingo, ..., 6 = Sábado

const MONTH_NAMES_PT_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
] as const;

// ============================================================================
// Utilitários de Data e Fuso Horário
// ============================================================================

/**
 * Extrai os componentes de calendário civil (ano, mês 1-12, dia 1-31) de forma imune
 * a distorções de fuso horário UTC vs Local.
 */
export function extractCivilDateParts(
  dateInput: Date | string,
  timeZone: string = DEFAULT_TIMEZONE
): { year: number; month: number; day: number } {
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Padrão YYYY-MM-DD puro (sem hora/offset)
    const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10);
      const day = parseInt(ymdMatch[3], 10);
      validateDateComponents(year, month, day, dateInput);
      return { year, month, day };
    }

    // Padrão DD/MM/YYYY puro
    const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      const year = parseInt(dmyMatch[3], 10);
      validateDateComponents(year, month, day, dateInput);
      return { year, month, day };
    }
  }

  const parsed = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Data inválida fornecida: "${String(dateInput)}"`);
  }

  // Utiliza Intl.DateTimeFormat para projetar o timestamp no fuso especificado
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const parts = formatter.formatToParts(parsed);
  let year = 0;
  let month = 0;
  let day = 0;

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'day') day = parseInt(part.value, 10);
  }

  return { year, month, day };
}

/**
 * Valida a existência real da data (ex: evita 31 de Abril ou 29 de Fev em ano não bissexto).
 */
function validateDateComponents(year: number, month: number, day: number, original: string): void {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Data com valores fora do calendário civil: "${original}"`);
  }
  const testDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    testDate.getUTCFullYear() !== year ||
    testDate.getUTCMonth() !== month - 1 ||
    testDate.getUTCDate() !== day
  ) {
    throw new Error(`Data de calendário inexistente: "${original}"`);
  }
}

/**
 * Cria uma data UTC ao meio-dia (12:00:00 UTC) para os componentes ano, mês e dia.
 * O meio-dia UTC garante que em qualquer fuso do planeta (UTC-12 a UTC+14),
 * a data civil representada seja idêntica, evitando desvios de virada de dia.
 */
export function createSafeDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/**
 * Retorna o dia da semana (0=Domingo, 6=Sábado) para uma data civil.
 */
export function getCivilDayOfWeek(year: number, month: number, day: number): number {
  return createSafeDate(year, month, day).getUTCDay();
}

/**
 * Verifica se uma data corresponde a um sábado.
 */
export function isSaturday(dateInput: Date | string, timeZone: string = DEFAULT_TIMEZONE): boolean {
  const { year, month, day } = extractCivilDateParts(dateInput, timeZone);
  return getCivilDayOfWeek(year, month, day) === SATURDAY_DAY_OF_WEEK;
}

/**
 * Formata uma data para o padrão pt-BR legível.
 * - 'short': 'DD/MM/YYYY' (ex: '08/11/2025')
 * - 'long': 'DD de Mês de YYYY' (ex: '08 de Novembro de 2025')
 */
export function formatDatePtBR(
  dateInput: Date | string,
  format: 'short' | 'long' = 'short',
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const { year, month, day } = extractCivilDateParts(dateInput, timeZone);
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);

  if (format === 'short') {
    return `${dd}/${mm}/${yyyy}`;
  }

  const monthName = MONTH_NAMES_PT_BR[month - 1];
  return `${dd} de ${monthName} de ${yyyy}`;
}

/**
 * Formata uma data no formato padrão ISO 'YYYY-MM-DD'.
 */
export function formatDateIso(dateInput: Date | string, timeZone: string = DEFAULT_TIMEZONE): string {
  const { year, month, day } = extractCivilDateParts(dateInput, timeZone);
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);
  return `${yyyy}-${mm}-${dd}`;
}

// ============================================================================
// Regra 1: Cálculo dos 4 Sábados Consecutivos
// ============================================================================

/**
 * Calcula as 4 datas de sábados consecutivos para as Aulas 1 a 4 do Treinamento Social.
 *
 * @param enrollmentDate Data de matrícula (string ISO, 'YYYY-MM-DD', 'DD/MM/YYYY' ou objeto Date).
 * @param options Configurações adicionais de agendamento e fuso horário.
 * @returns Array contendo exatamente 4 objetos Date representando as Aulas 1, 2, 3 e 4.
 */
export function calculateFourSaturdays(
  enrollmentDate: Date | string,
  options?: CalculateSaturdaysOptions
): Date[] {
  const includeSameDay = options?.includeSameDaySaturday ?? false;
  const timeZone = options?.timeZone ?? DEFAULT_TIMEZONE;

  const { year, month, day } = extractCivilDateParts(enrollmentDate, timeZone);
  const currentDayOfWeek = getCivilDayOfWeek(year, month, day);

  let daysUntilFirstSaturday: number;
  if (currentDayOfWeek === SATURDAY_DAY_OF_WEEK) {
    daysUntilFirstSaturday = includeSameDay ? 0 : 7;
  } else {
    // Domingo = 0 (faltam 6 dias), Segunda = 1 (faltam 5 dias), ..., Sexta = 5 (falta 1 dia)
    daysUntilFirstSaturday = SATURDAY_DAY_OF_WEEK - currentDayOfWeek;
  }

  // Base UTC ao meio-dia para cálculo imune a horário de verão / shifts
  const firstSaturdayTimestamp = Date.UTC(year, month - 1, day + daysUntilFirstSaturday, 12, 0, 0, 0);

  const saturdays: Date[] = [];
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < TOTAL_CLASSES_REQUIRED; i++) {
    const classDate = new Date(firstSaturdayTimestamp + i * ONE_WEEK_MS);
    saturdays.push(classDate);
  }

  return saturdays;
}

/**
 * Retorna o cronograma completo detalhado das 4 aulas com formatações pt-BR prontas.
 */
export function getDetailedSchedule(
  enrollmentDate: Date | string,
  options?: CalculateSaturdaysOptions
): ClassScheduleItem[] {
  const dates = calculateFourSaturdays(enrollmentDate, options);
  const tz = options?.timeZone ?? DEFAULT_TIMEZONE;

  return dates.map((date, index) => ({
    classNumber: index + 1,
    date,
    dateIso: formatDateIso(date, tz),
    dateShort: formatDatePtBR(date, 'short', tz),
    dateLong: formatDatePtBR(date, 'long', tz)
  }));
}

// ============================================================================
// Regra 2: Avaliação de Elegibilidade do Certificado
// ============================================================================

/**
 * Avalia a elegibilidade para emissão de certificado no Treinamento Social.
 *
 * Regras estritas de negócio:
 * 1. 100% de frequência obrigatória (4 presenças em 4 aulas).
 * 2. Qualquer FALTA torna o aluno imediatamente NAO_ELEGIVEL.
 * 3. Se houver aulas PENDENTES (ou menos de 4 aulas registradas) e nenhuma falta: EM_ANDAMENTO.
 * 4. 4 presenças concluídas:
 *    - Se feePaid === false: PENDENTE_PAGAMENTO (canIssue: false).
 *    - Se feePaid === true: PAGO_LIBERADO (canIssue: true).
 *
 * @param attendanceRecords Lista com os status de presença de cada aula.
 * @param feePaid Booleano indicando se a taxa de emissão do certificado foi paga.
 */
export function evaluateCertificateEligibility(
  attendanceRecords: AttendanceStatus[],
  feePaid: boolean
): CertificateStatusResult {
  if (!Array.isArray(attendanceRecords)) {
    throw new TypeError('attendanceRecords deve ser um array de AttendanceStatus.');
  }

  // Normalização defensiva caso venha em lowercase
  const normalizedRecords = attendanceRecords.map((r) =>
    typeof r === 'string' ? (r.toUpperCase() as AttendanceStatus) : r
  );

  let presentCount = 0;
  let absentCount = 0;
  let pendingCount = 0;

  for (const status of normalizedRecords) {
    if (status === 'PRESENTE') {
      presentCount++;
    } else if (status === 'FALTA') {
      absentCount++;
    } else if (status === 'PENDENTE') {
      pendingCount++;
    } else {
      throw new Error(`Status de presença inválido: "${String(status)}"`);
    }
  }

  // 1. Regra de Falta: qualquer falta reprova imediatamente
  if (absentCount > 0) {
    return {
      status: 'NAO_ELEGIVEL',
      canIssue: false,
      presentCount,
      totalClasses: TOTAL_CLASSES_REQUIRED,
      reason: 'Possui faltas registradas. O Treinamento Social exige 100% de frequência.'
    };
  }

  // 2. Se tiver menos de 4 aulas registradas no array, as restantes são consideradas pendentes
  const totalRecorded = normalizedRecords.length;
  const effectivePending = pendingCount + Math.max(0, TOTAL_CLASSES_REQUIRED - totalRecorded);

  if (effectivePending > 0 || presentCount < TOTAL_CLASSES_REQUIRED) {
    return {
      status: 'EM_ANDAMENTO',
      canIssue: false,
      presentCount,
      totalClasses: TOTAL_CLASSES_REQUIRED
    };
  }

  // 3. 4 aulas com 4 presenças completas (100% de presença)
  if (feePaid) {
    return {
      status: 'PAGO_LIBERADO',
      canIssue: true,
      presentCount: TOTAL_CLASSES_REQUIRED,
      totalClasses: TOTAL_CLASSES_REQUIRED
    };
  }

  return {
    status: 'PENDENTE_PAGAMENTO',
    canIssue: false,
    presentCount: TOTAL_CLASSES_REQUIRED,
    totalClasses: TOTAL_CLASSES_REQUIRED
  };
}

// ============================================================================
// Regra 3: Formatação e URL do WhatsApp
// ============================================================================

/**
 * Sanitiza número de telefone garantindo formato internacional padrão do Brasil (DDI 55).
 * - Remove caracteres especiais, parênteses, traços, espaços e sinal de +.
 * - Remove zero inicial de discagem (ex: 011 -> 11).
 * - Adiciona DDI 55 se fornecido com DDD + número (10 ou 11 dígitos).
 *
 * @param phone Telefone bruto fornecido pelo usuário.
 * @returns Número sanitizado iniciando com 55.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') {
    throw new TypeError(`Telefone deve ser uma string, recebido: ${typeof phone}`);
  }

  // Remove qualquer caracter não numérico
  let digits = phone.replace(/\D/g, '');

  // Remove zero à esquerda caso tenha sido digitado (ex: 011999999999)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Se já possui DDI 55 (12 dígitos para fixo ou 13 para celular):
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Número brasileiro padrão sem DDI: 10 dígitos (fixo) ou 11 dígitos (celular)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  throw new Error(
    `Número de telefone inválido para o padrão brasileiro: "${phone}" (dígitos extraídos: "${digits}")`
  );
}

/**
 * Substitui as variáveis de template no padrão `{tag}` pelos valores correspondentes.
 * Tags padrão: {nome_responsavel}, {nome_aluno}, {numero_aula}, {data_aula}, {horario}, {link_confirmacao}.
 *
 * @param template String com o modelo da mensagem.
 * @param data Objeto com os valores para substituição.
 * @param options Opções adicionais de formatação.
 */
export function formatWhatsAppMessage(
  template: string,
  data: WhatsAppTemplateData,
  options?: FormatTemplateOptions
): string {
  if (typeof template !== 'string') {
    throw new TypeError(`Template deve ser uma string, recebido: ${typeof template}`);
  }

  const preserveMissing = options?.preserveMissingTags ?? false;

  // Substitui qualquer tag no padrão { tag_name }, tolerando espaços internos
  return template.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key: string) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return preserveMissing ? match : '';
  });
}

/**
 * Gera o link wa.me pronto para acionamento direto do WhatsApp Web / App.
 *
 * @param phone Número de telefone de destino (será sanitizado para DDI 55).
 * @param message Mensagem de texto (será codificada via encodeURIComponent).
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const sanitized = sanitizePhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encodedMessage}`;
}
