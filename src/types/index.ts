export type AttendanceStatus = 'presente' | 'falta' | 'pendente';

export type ShiftType = 'manha' | 'tarde';

export type WhatsAppContactStatusType = 
  | 'nao_contatado' 
  | 'mensagem_enviada' 
  | 'confirmado';

// Alias for backwards compatibility
export type WhatsAppConfirmationStatus = WhatsAppContactStatusType | 'aguardando' | 'enviado' | 'nao_enviado';

export interface Guardian {
  id: string;
  name: string;
  relationship: 'Mae' | 'Pai' | 'Avo' | 'Tutor' | 'Outro';
  phone: string; // WhatsApp formatted
  email?: string;
  cpf?: string;
}

export interface AttendanceRecord {
  lessonNumber: 1 | 2 | 3 | 4;
  date: string; // ISO date 'YYYY-MM-DD'
  status: AttendanceStatus;
  notes?: string;
  updatedAt?: string;
}

export interface WhatsAppLog {
  id: string;
  studentId: string;
  recipientPhone: string;
  recipientName: string;
  templateType: 'lembrete' | 'cobranca_falta' | 'matricula' | 'certificado' | 'custom';
  messageText: string;
  sentAt: string;
  status: 'enviada' | 'entregue' | 'lida' | 'respondida' | 'falha';
}

export type CertificateFlagStatus = 
  | 'nao_elegivel'       // possui faltas
  | 'em_andamento'       // aulas futuras pendentes e sem faltas
  | 'pendente_pagamento' // 100% presenças (4 de 4), taxa não paga
  | 'pago_liberado';     // 100% presenças + taxa quitada, emitido

export interface CertificateInfo {
  id: string;
  studentId: string;
  issuedAt?: string;
  code?: string;
  status: CertificateFlagStatus;
  feeAmount: number; // Ex: 35.00
  feePaid: boolean;
  pdfUrl?: string;
}

export interface TrainingCycle {
  id: string;
  cohortName: string; // Ex: 'Turma Outubro 2026 - A'
  startDate: string; // 1st Saturday
  endDate: string; // 4th Saturday
  saturdays: string[]; // 4 dates
  shift: ShiftType;
  classroom: string;
  instructorName: string;
  maxCapacity: number;
}

export interface Student {
  id: string;
  registrationNumber: string; // Ex: "UNB-2026-084"
  name: string;
  email?: string;
  phone: string; // WhatsApp
  birthDate: string;
  isUnderage: boolean;
  guardian?: Guardian;
  cycleId: string;
  cycleName: string;
  shift: ShiftType;
  classroom: string;
  currentLesson: 1 | 2 | 3 | 4;
  saturdays: string[]; // Array of exactly 4 Saturday dates ISO
  enrollmentDate: string; // Data de Inscrição
  attendance: AttendanceRecord[];
  whatsappStatus: WhatsAppContactStatusType;
  certificate: CertificateInfo;
  avatarUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardKpis {
  studentsScheduledThisSaturday: {
    total: number;
    shiftMorning: number;
    shiftAfternoon: number;
    trendPercentage: number;
  };
  overallAttendanceRate: {
    percentage: number;
    presentCount: number;
    totalExpected: number;
    trendPercentage: number;
  };
  whatsappConfirmations: {
    confirmedRate: number;
    confirmedCount: number;
    pendingCount: number;
    trendPercentage: number;
  };
  completedCertificates: {
    totalReadyOrIssued: number;
    issuedThisMonth: number;
    trendPercentage: number;
  };
}

export interface StudentFilterOptions {
  searchQuery: string;
  shift: 'todos' | ShiftType;
  status: 'todos' | 'em_andamento' | 'aptos' | 'em_risco' | 'concluidos';
  whatsappStatus: 'todos' | WhatsAppContactStatusType;
  dateFilter?: string; // Filter by scheduled Saturday
}

export type WhatsAppTemplateId = 
  | 'lembrete_sabado' 
  | 'alerta_falta' 
  | 'boas_vindas_matricula' 
  | 'certificado_liberado';

export interface WhatsAppTemplate {
  id: WhatsAppTemplateId;
  title: string;
  description: string;
  text: string;
}
