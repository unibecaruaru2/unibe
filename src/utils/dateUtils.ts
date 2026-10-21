// Date utilities for UNIBE Saturday cycles

/**
 * Returns the next N Saturdays starting from a given date.
 * If the given date is a Saturday, it can be included as the first one.
 */
export function calculateSaturdayDates(startDateStr: string, count: number = 4): string[] {
  const dates: string[] = [];
  const current = new Date(startDateStr + 'T12:00:00');

  // If not Saturday (6), advance to the next Saturday
  while (current.getDay() !== 6) {
    current.setDate(current.getDate() + 1);
  }

  for (let i = 0; i < count; i++) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    
    // Jump 7 days to next Saturday
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

/**
 * Format ISO date string (YYYY-MM-DD) into readable Portuguese date
 * e.g., "24 de Outubro de 2026"
 */
export function formatFullPortugueseDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format short date (e.g. "24/10")
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

/**
 * Check if a date string corresponds to a Saturday
 */
export function isSaturday(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getDay() === 6;
}

/**
 * Generate WhatsApp Web / API click-to-chat URL
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  // Default to Brazil (+55) if no country code provided
  const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodedText}`;
}

/**
 * Formats phone number to Brazilian standard (XX) XXXXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
