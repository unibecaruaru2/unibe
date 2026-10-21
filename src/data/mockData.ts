import { Student, TrainingCycle, DashboardKpis, WhatsAppTemplate } from '../types';

export const initialCycles: TrainingCycle[] = [
  {
    id: 'cycle-2026-out-manha',
    cohortName: 'Turma Outubro 2026 - Manhã',
    startDate: '2026-10-03',
    endDate: '2026-10-24',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    shift: 'manha',
    classroom: 'Laboratório Inovação Social - Sala 102',
    instructorName: 'Prof. Carlos Eduardo Mendes',
    maxCapacity: 30
  },
  {
    id: 'cycle-2026-out-tarde',
    cohortName: 'Turma Outubro 2026 - Tarde',
    startDate: '2026-10-03',
    endDate: '2026-10-24',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    shift: 'tarde',
    classroom: 'Auditório Principal Darcy Ribeiro',
    instructorName: 'Profa. Mariana Albuquerque',
    maxCapacity: 30
  },
  {
    id: 'cycle-2026-nov-manha',
    cohortName: 'Turma Novembro 2026 - Manhã',
    startDate: '2026-11-07',
    endDate: '2026-11-28',
    saturdays: ['2026-11-07', '2026-11-14', '2026-11-21', '2026-11-28'],
    shift: 'manha',
    classroom: 'Laboratório Inovação Social - Sala 102',
    instructorName: 'Prof. Carlos Eduardo Mendes',
    maxCapacity: 30
  }
];

export const mockStudents: Student[] = [
  {
    id: 'std-1',
    registrationNumber: 'UNB-2026-001',
    name: 'Beatriz Vasconcelos Lima',
    email: 'beatriz.lima@email.com',
    phone: '11987654321',
    birthDate: '2008-04-12',
    isUnderage: true,
    guardian: {
      id: 'grd-1',
      name: 'Helena Vasconcelos Lima',
      relationship: 'Mae',
      phone: '11987651234'
    },
    cycleId: 'cycle-2026-out-manha',
    cycleName: 'Turma Outubro 2026 - Manhã',
    shift: 'manha',
    classroom: 'Lab 102',
    currentLesson: 4,
    enrollmentDate: '2026-09-28',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'presente' },
      { lessonNumber: 3, date: '2026-10-17', status: 'presente' },
      { lessonNumber: 4, date: '2026-10-24', status: 'presente' }
    ],
    whatsappStatus: 'confirmado',
    certificate: {
      id: 'cert-001',
      studentId: 'std-1',
      status: 'pago_liberado',
      feeAmount: 35.00,
      feePaid: true,
      code: 'CERT-UNIBE-98421',
      issuedAt: '2026-10-24'
    },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-28'
  },
  {
    id: 'std-2',
    registrationNumber: 'UNB-2026-002',
    name: 'Lucas Gabriel Silveira',
    email: 'lucas.silveira@email.com',
    phone: '11976543210',
    birthDate: '2007-09-19',
    isUnderage: true,
    guardian: {
      id: 'grd-2',
      name: 'Roberto Silveira',
      relationship: 'Pai',
      phone: '11976549988'
    },
    cycleId: 'cycle-2026-out-manha',
    cycleName: 'Turma Outubro 2026 - Manhã',
    shift: 'manha',
    classroom: 'Lab 102',
    currentLesson: 4,
    enrollmentDate: '2026-09-28',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'falta' },
      { lessonNumber: 3, date: '2026-10-17', status: 'presente' },
      { lessonNumber: 4, date: '2026-10-24', status: 'presente' }
    ],
    whatsappStatus: 'mensagem_enviada',
    certificate: {
      id: 'cert-002',
      studentId: 'std-2',
      status: 'nao_elegivel',
      feeAmount: 35.00,
      feePaid: false
    },
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-28'
  },
  {
    id: 'std-3',
    registrationNumber: 'UNB-2026-003',
    name: 'Camila Rodrigues Neves',
    email: 'camila.neves@email.com',
    phone: '11965432109',
    birthDate: '2006-03-08',
    isUnderage: false,
    guardian: {
      id: 'grd-3',
      name: 'Valéria Rodrigues',
      relationship: 'Mae',
      phone: '11965430011'
    },
    cycleId: 'cycle-2026-out-tarde',
    cycleName: 'Turma Outubro 2026 - Tarde',
    shift: 'tarde',
    classroom: 'Auditório Darcy Ribeiro',
    currentLesson: 4,
    enrollmentDate: '2026-09-29',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'presente' },
      { lessonNumber: 3, date: '2026-10-17', status: 'presente' },
      { lessonNumber: 4, date: '2026-10-24', status: 'presente' }
    ],
    whatsappStatus: 'confirmado',
    certificate: {
      id: 'cert-003',
      studentId: 'std-3',
      status: 'pendente_pagamento',
      feeAmount: 35.00,
      feePaid: false
    },
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-29'
  },
  {
    id: 'std-4',
    registrationNumber: 'UNB-2026-004',
    name: 'Guilherme Ferreira Santos',
    email: 'guilherme.santos@email.com',
    phone: '11954321098',
    birthDate: '2009-01-22',
    isUnderage: true,
    guardian: {
      id: 'grd-4',
      name: 'Cláudia Ferreira Santos',
      relationship: 'Mae',
      phone: '11954327766'
    },
    cycleId: 'cycle-2026-out-manha',
    cycleName: 'Turma Outubro 2026 - Manhã',
    shift: 'manha',
    classroom: 'Lab 102',
    currentLesson: 4,
    enrollmentDate: '2026-09-30',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'presente' },
      { lessonNumber: 3, date: '2026-10-17', status: 'presente' },
      { lessonNumber: 4, date: '2026-10-24', status: 'pendente' }
    ],
    whatsappStatus: 'mensagem_enviada',
    certificate: {
      id: 'cert-004',
      studentId: 'std-4',
      status: 'em_andamento',
      feeAmount: 35.00,
      feePaid: false
    },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-09-30'
  },
  {
    id: 'std-5',
    registrationNumber: 'UNB-2026-005',
    name: 'Mariana Duarte Souza',
    email: 'mariana.duarte@email.com',
    phone: '11943210987',
    birthDate: '2008-11-05',
    isUnderage: true,
    guardian: {
      id: 'grd-5',
      name: 'Juliana Duarte Souza',
      relationship: 'Mae',
      phone: '11943215544'
    },
    cycleId: 'cycle-2026-out-tarde',
    cycleName: 'Turma Outubro 2026 - Tarde',
    shift: 'tarde',
    classroom: 'Auditório Darcy Ribeiro',
    currentLesson: 4,
    enrollmentDate: '2026-10-01',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'falta' },
      { lessonNumber: 3, date: '2026-10-17', status: 'falta' },
      { lessonNumber: 4, date: '2026-10-24', status: 'pendente' }
    ],
    whatsappStatus: 'nao_contatado',
    certificate: {
      id: 'cert-005',
      studentId: 'std-5',
      status: 'nao_elegivel',
      feeAmount: 35.00,
      feePaid: false
    },
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-01'
  },
  {
    id: 'std-6',
    registrationNumber: 'UNB-2026-006',
    name: 'Enzo Leonardo Pinheiro',
    email: 'enzo.pinheiro@email.com',
    phone: '11932109876',
    birthDate: '2007-06-15',
    isUnderage: true,
    guardian: {
      id: 'grd-6',
      name: 'Marcos Pinheiro',
      relationship: 'Pai',
      phone: '11932108877'
    },
    cycleId: 'cycle-2026-out-tarde',
    cycleName: 'Turma Outubro 2026 - Tarde',
    shift: 'tarde',
    classroom: 'Auditório Darcy Ribeiro',
    currentLesson: 4,
    enrollmentDate: '2026-10-02',
    saturdays: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'],
    attendance: [
      { lessonNumber: 1, date: '2026-10-03', status: 'presente' },
      { lessonNumber: 2, date: '2026-10-10', status: 'presente' },
      { lessonNumber: 3, date: '2026-10-17', status: 'presente' },
      { lessonNumber: 4, date: '2026-10-24', status: 'presente' }
    ],
    whatsappStatus: 'confirmado',
    certificate: {
      id: 'cert-006',
      studentId: 'std-6',
      status: 'pendente_pagamento',
      feeAmount: 35.00,
      feePaid: false
    },
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-10-02'
  }
];

export const defaultKpis: DashboardKpis = {
  studentsScheduledThisSaturday: {
    total: 48,
    shiftMorning: 26,
    shiftAfternoon: 22,
    trendPercentage: 12
  },
  overallAttendanceRate: {
    percentage: 92,
    presentCount: 44,
    totalExpected: 48,
    trendPercentage: 4
  },
  whatsappConfirmations: {
    confirmedRate: 85,
    confirmedCount: 41,
    pendingCount: 7,
    trendPercentage: 18
  },
  completedCertificates: {
    totalReadyOrIssued: 14,
    issuedThisMonth: 12,
    trendPercentage: 25
  }
};

export const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: 'lembrete_sabado',
    title: 'Lembrete de Aula do Sábado',
    description: 'Enviado 24h antes do sábado com dados de local, horário e etapa.',
    text: `Olá, {nome_responsavel}! Aqui é da Coordenação do Treinamento Social UNIBE. 📚

Lembramos que o(a) aluno(a) *{nome_aluno}* está agendado(a) para a *{numero_aula}* neste *{data_aula}*, no turno da {turno}.

📍 Local: {local}
⏰ Horário: Chegar com 10 min de antecedência.

⚠️ *Importante*: Para garantir o Certificado Oficial de Conclusão, a presença nas 4 aulas de sábado é indispensável (100% de frequência).

Por favor, responda esta mensagem com *CONFIRMO* para validarmos a presença na lista de chamada.`
  },
  {
    id: 'alerta_falta',
    title: 'Aviso de Ausência e Risco de Certificado',
    description: 'Notifica falta e esclarece a regra estrita de 100% para o certificado.',
    text: `Olá, {nome_responsavel}. Notamos que *{nome_aluno}* não esteve presente na {numero_aula} do Treinamento Social UNIBE realizada em {data_aula}.

Informamos que a regulamentação do curso exige 100% de assiduidade para emissão do Certificado Oficial de 16 horas.

Caso haja justificativa médica ou de força maior, entre em contato imediatamente com nossa coordenação pedagógica.`
  },
  {
    id: 'boas_vindas_matricula',
    title: 'Boas-Vindas e Confirmação de Matrícula',
    description: 'Enviado logo após a matrícula com as 4 datas consecutivas de sábado.',
    text: `Parabéns, {nome_responsavel}! A inscrição de *{nome_aluno}* no Treinamento Social UNIBE foi confirmada com sucesso! 🎉

O ciclo completo é composto rigidamente por 4 sábados consecutivos:
• Aula 1: {sabado_1}
• Aula 2: {sabado_2}
• Aula 3: {sabado_3}
• Aula 4: {sabado_4}

Turno: {turno} | {local}

Aguardamos você para essa jornada de transformação e aprendizado!`
  },
  {
    id: 'certificado_liberado',
    title: 'Conclusão 100% e Liberação do Certificado',
    description: 'Aviso de cumprimento das 4 aulas e instruções da taxa de emissão.',
    text: `Parabéns, {nome_responsavel}! 🎓

O(a) aluno(a) *{nome_aluno}* completou com êxito 100% de frequência (4 de 4 sábados) no Treinamento Social UNIBE!

O Certificado Oficial de Formação Cívica e Social (16 Horas) está apto para emissão.
Chave de Validação: {codigo_certificado}
Taxa de Emissão e Registro: R$ 35,00

Você pode retirar a via impressa no polo ou baixar a versão digital autenticada.`
  }
];
