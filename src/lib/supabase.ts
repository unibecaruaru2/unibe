import { createClient } from '@supabase/supabase-js';
import { Student, AttendanceRecord, CertificateInfo, TrainingCycle, WhatsAppContactStatusType } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijwzwxtfugwvabqlvipa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rerKXa81cy7ylheEuqxOsQ_a2ka6ZIU';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Carrega todos os alunos do Supabase com suas relações completas
 */
export async function fetchStudentsFromSupabase(): Promise<Student[]> {
  try {
    const { data: studentsData, error } = await supabase
      .from('students')
      .select(`
        id,
        registration_number,
        name,
        phone,
        email,
        birth_date,
        is_underage,
        shift,
        classroom,
        enrollment_date,
        avatar_url,
        notes,
        created_at,
        guardian:guardians (
          id,
          name,
          phone_raw,
          phone_formatted,
          relationship
        ),
        training_cycles (
          id,
          cohort_name,
          start_date,
          expected_end_date,
          status
        ),
        class_sessions (
          lesson_number,
          scheduled_date,
          attendance_status
        ),
        certificate_records (
          id,
          status,
          fee_amount,
          fee_paid,
          certificate_code,
          issued_at
        ),
        whatsapp_logs (
          status,
          sent_at
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar alunos do Supabase:', error);
      return [];
    }

    if (!studentsData || studentsData.length === 0) {
      return [];
    }

    return studentsData.map((s: any): Student => {
      const cycle = s.training_cycles?.[0];
      const sessions = (s.class_sessions || []).sort((a: any, b: any) => a.lesson_number - b.lesson_number);
      
      const attendance: AttendanceRecord[] = sessions.map((sess: any) => ({
        lessonNumber: sess.lesson_number,
        date: sess.scheduled_date,
        status: sess.attendance_status
      }));

      const saturdays = sessions.map((sess: any) => sess.scheduled_date);

      const cert = s.certificate_records?.[0];
      const certificate: CertificateInfo = cert ? {
        id: cert.id,
        studentId: s.id,
        status: cert.status,
        feeAmount: Number(cert.fee_amount || 35.0),
        feePaid: Boolean(cert.fee_paid),
        code: cert.certificate_code || undefined,
        issuedAt: cert.issued_at || undefined
      } : {
        id: `cert-${s.id}`,
        studentId: s.id,
        status: 'em_andamento',
        feeAmount: 35.0,
        feePaid: false
      };

      const lastWaLog = (s.whatsapp_logs || []).sort(
        (a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      )[0];

      let whatsappStatus: WhatsAppContactStatusType = 'nao_contatado';
      if (lastWaLog?.status === 'confirmado') whatsappStatus = 'confirmado';
      else if (lastWaLog?.status === 'mensagem_enviada') whatsappStatus = 'mensagem_enviada';

      return {
        id: s.id,
        registrationNumber: s.registration_number,
        name: s.name,
        email: s.email || '',
        phone: s.phone,
        birthDate: s.birth_date,
        isUnderage: Boolean(s.is_underage),
        guardian: s.guardian ? {
          id: s.guardian.id,
          name: s.guardian.name,
          relationship: s.guardian.relationship || 'Responsavel',
          phone: s.guardian.phone_formatted || s.guardian.phone_raw
        } : undefined,
        cycleId: cycle?.id || 'cycle-default',
        cycleName: cycle?.cohort_name || 'Treinamento Social',
        shift: s.shift || 'manha',
        classroom: s.classroom || 'Sala 102',
        currentLesson: sessions.filter((sess: any) => sess.attendance_status !== 'pendente').length + 1,
        enrollmentDate: s.enrollment_date,
        saturdays: saturdays.length === 4 ? saturdays : [cycle?.start_date, '', '', cycle?.expected_end_date],
        attendance,
        whatsappStatus,
        certificate,
        avatarUrl: s.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        createdAt: s.created_at
      };
    });
  } catch (err) {
    console.error('Falha na comunicação com Supabase:', err);
    return [];
  }
}

/**
 * Atualiza presença de uma aula no Supabase
 */
export async function updateAttendanceInSupabase(
  studentId: string,
  lessonNumber: number,
  status: 'presente' | 'falta' | 'pendente'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('class_sessions')
      .update({
        attendance_status: status,
        recorded_at: status !== 'pendente' ? new Date().toISOString() : null
      })
      .match({ student_id: studentId, lesson_number: lessonNumber });

    if (error) {
      console.error('Erro ao atualizar presença no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro de conexão com Supabase:', err);
    return false;
  }
}

/**
 * Atualiza status da taxa de certificado no Supabase
 */
export async function updateCertificatePaymentInSupabase(
  studentId: string,
  feePaid: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('certificate_records')
      .update({
        fee_paid: feePaid,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId);

    if (error) {
      console.error('Erro ao atualizar taxa no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro de conexão ao atualizar taxa:', err);
    return false;
  }
}

/**
 * Registra envio de mensagem WhatsApp no Supabase
 */
export async function logWhatsAppSentInSupabase(
  studentId: string,
  recipientPhone: string,
  messageText: string,
  status: 'mensagem_enviada' | 'confirmado'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('whatsapp_logs')
      .insert({
        student_id: studentId,
        recipient_phone: recipientPhone,
        message_text: messageText,
        status: status,
        sent_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar log de WhatsApp:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao gravar log WhatsApp:', err);
    return false;
  }
}

/**
 * Cria nova matrícula completa no Supabase
 */
export async function createEnrollmentInSupabase(data: {
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  shift: 'manha' | 'tarde';
  enrollmentDate: string;
  saturdays: string[];
  feePaid?: boolean;
}): Promise<Student | null> {
  try {
    // 1. Cadastrar Guardian
    const { data: guardianData, error: gError } = await supabase
      .from('guardians')
      .insert({
        name: data.guardianName,
        phone_raw: data.guardianPhone.replace(/\D/g, ''),
        phone_formatted: data.guardianPhone,
        relationship: data.guardianRelationship
      })
      .select()
      .single();

    if (gError) {
      console.error('Erro ao cadastrar responsável:', gError);
      return null;
    }

    const regNumber = `UNB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Cadastrar Aluno
    const { data: studentData, error: sError } = await supabase
      .from('students')
      .insert({
        registration_number: regNumber,
        name: data.studentName,
        phone: data.guardianPhone,
        birth_date: '2008-01-01',
        is_underage: true,
        guardian_id: guardianData.id,
        shift: data.shift,
        classroom: 'Rua Silva Jardim, 99',
        enrollment_date: data.enrollmentDate,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`
      })
      .select()
      .single();

    if (sError) {
      console.error('Erro ao cadastrar aluno:', sError);
      return null;
    }

    const sId = studentData.id;

    // 3. Cadastrar Ciclo
    const { data: cycleData } = await supabase
      .from('training_cycles')
      .insert({
        student_id: sId,
        cohort_name: `Turma ${data.shift === 'manha' ? 'Manhã' : 'Tarde'} - ${data.saturdays[0].substring(0, 7)}`,
        start_date: data.saturdays[0],
        expected_end_date: data.saturdays[3],
        status: 'EM_ANDAMENTO'
      })
      .select()
      .single();

    // 4. Cadastrar 4 Sessões de Aula
    const sessions = [
      { student_id: sId, training_cycle_id: cycleData?.id, lesson_number: 1, scheduled_date: data.saturdays[0], attendance_status: 'pendente' },
      { student_id: sId, training_cycle_id: cycleData?.id, lesson_number: 2, scheduled_date: data.saturdays[1], attendance_status: 'pendente' },
      { student_id: sId, training_cycle_id: cycleData?.id, lesson_number: 3, scheduled_date: data.saturdays[2], attendance_status: 'pendente' },
      { student_id: sId, training_cycle_id: cycleData?.id, lesson_number: 4, scheduled_date: data.saturdays[3], attendance_status: 'pendente' }
    ];

    await supabase.from('class_sessions').insert(sessions);

    // 5. Cadastrar Certificado Inicial
    const isPaid = Boolean(data.feePaid);
    await supabase.from('certificate_records').insert({
      student_id: sId,
      status: 'em_andamento',
      fee_amount: 35.0,
      fee_paid: isPaid
    });

    const newStudent: Student = {
      id: sId,
      registrationNumber: regNumber,
      name: data.studentName,
      email: '',
      phone: data.guardianPhone,
      birthDate: '2008-01-01',
      isUnderage: true,
      guardian: {
        id: guardianData.id,
        name: guardianData.name,
        relationship: guardianData.relationship,
        phone: guardianData.phone_formatted
      },
      cycleId: cycleData?.id || 'cycle-new',
      cycleName: `Turma ${data.shift === 'manha' ? 'Manhã' : 'Tarde'}`,
      shift: data.shift,
      classroom: 'Rua Silva Jardim, 99',
      currentLesson: 1,
      enrollmentDate: data.enrollmentDate,
      saturdays: data.saturdays,
      attendance: [
        { lessonNumber: 1, date: data.saturdays[0], status: 'pendente' },
        { lessonNumber: 2, date: data.saturdays[1], status: 'pendente' },
        { lessonNumber: 3, date: data.saturdays[2], status: 'pendente' },
        { lessonNumber: 4, date: data.saturdays[3], status: 'pendente' }
      ],
      whatsappStatus: 'nao_contatado',
      certificate: {
        id: `cert-${sId}`,
        studentId: sId,
        status: 'em_andamento',
        feeAmount: 35.0,
        feePaid: isPaid
      },
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      createdAt: new Date().toISOString()
    };

    return newStudent;
  } catch (err) {
    console.error('Falha ao criar matrícula:', err);
    return null;
  }
}

/**
 * Exclui aluno e seus registros vinculados
 */
export async function deleteStudentFromSupabase(studentId: string): Promise<boolean> {
  try {
    await supabase.from('certificate_records').delete().eq('student_id', studentId);
    await supabase.from('whatsapp_logs').delete().eq('student_id', studentId);
    await supabase.from('class_sessions').delete().eq('student_id', studentId);
    await supabase.from('training_cycles').delete().eq('student_id', studentId);
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      console.warn('Erro ao excluir aluno do banco:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Falha na exclusão do aluno:', err);
    return false;
  }
}
