import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { DashboardView } from '../../views/DashboardView';
import { AttendanceView } from '../../views/AttendanceView';
import { StudentsView } from '../../views/StudentsView';
import { WhatsAppView } from '../../views/WhatsAppView';
import { CertificatesView } from '../../views/CertificatesView';
import { SettingsView } from '../../views/SettingsView';
import { WhatsAppModal } from '../modals/WhatsAppModal';
import { EnrollmentModal } from '../modals/EnrollmentModal';
import { CertificateModal } from '../modals/CertificateModal';

import { 
  Student, 
  DashboardKpis, 
  AttendanceStatus, 
  WhatsAppContactStatusType 
} from '../../types';
import { evaluateCertificateEligibility, calculateFourSaturdays, formatDateIso } from '../../lib/social-training';
import { 
  fetchStudentsFromSupabase, 
  updateAttendanceInSupabase, 
  updateCertificatePaymentInSupabase, 
  logWhatsAppSentInSupabase, 
  createEnrollmentInSupabase 
} from '../../lib/supabase';

export const SocialTrainingDashboard: React.FC = () => {
  // Navigation & UI States
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return true;
      return localStorage.getItem('unibe_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Ensure tablet & mobile start collapsed
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('unibe_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleNavigate = (path: string) => {
    setCurrentRoute(path);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };

  // Data States (Operação 100% com Dados Reais do Supabase)
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [dbSyncStatus, setDbSyncStatus] = useState<'synced' | 'connecting' | 'fallback'>('connecting');
  const [selectedSaturday, setSelectedSaturday] = useState<string>(() => {
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const dates = calculateFourSaturdays(todayIso, { includeSameDaySaturday: true });
      return formatDateIso(dates[0]);
    } catch {
      return '2026-10-24';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      try {
        const remoteStudents = await fetchStudentsFromSupabase();
        if (isMounted) {
          setStudents(remoteStudents || []);
          setDbSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do Supabase:', err);
        if (isMounted) setDbSyncStatus('fallback');
      } finally {
        if (isMounted) setIsLoadingDb(false);
      }
    }

    loadFromSupabase();
    return () => { isMounted = false; };
  }, []);

  // Modal States
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedStudentForWhatsApp, setSelectedStudentForWhatsApp] = useState<Student | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Available Saturdays calculated dynamically from real student cycles or current calendar
  const availableSaturdays = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => s.saturdays.forEach(d => { if (d) set.add(d); }));
    if (set.size > 0) {
      return Array.from(set).sort();
    }
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const dates = calculateFourSaturdays(todayIso, { includeSameDaySaturday: true });
      return dates.map(d => formatDateIso(d));
    } catch {
      return ['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14'];
    }
  }, [students]);

  // Keep selectedSaturday aligned with available list
  useEffect(() => {
    if (availableSaturdays.length > 0 && !availableSaturdays.includes(selectedSaturday)) {
      setSelectedSaturday(availableSaturdays[0]);
    }
  }, [availableSaturdays, selectedSaturday]);

  // Recalculate KPIs dynamically from 100% real data
  const dynamicKpis: DashboardKpis = useMemo(() => {
    const totalStudents = students.length;
    const morningCount = students.filter(s => s.shift === 'manha').length;
    const afternoonCount = students.filter(s => s.shift === 'tarde').length;

    let totalPresent = 0;
    let totalRecorded = 0;
    students.forEach(s => {
      s.attendance.forEach(a => {
        if (a.status === 'presente') totalPresent++;
        if (a.status === 'presente' || a.status === 'falta') totalRecorded++;
      });
    });
    const attendancePercentage = totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 0;

    const confirmedCount = students.filter(s => s.whatsappStatus === 'confirmado').length;
    const pendingContact = students.filter(s => s.whatsappStatus !== 'confirmado').length;
    const confirmedRate = totalStudents > 0 ? Math.round((confirmedCount / totalStudents) * 100) : 0;

    const eligibleForCert = students.filter(
      s => s.attendance.filter(a => a.status === 'presente').length === 4
    ).length;

    return {
      studentsScheduledThisSaturday: {
        total: totalStudents,
        shiftMorning: morningCount,
        shiftAfternoon: afternoonCount,
        trendPercentage: 0
      },
      overallAttendanceRate: {
        percentage: attendancePercentage,
        presentCount: totalPresent,
        totalExpected: totalRecorded,
        trendPercentage: 0
      },
      whatsappConfirmations: {
        confirmedRate,
        confirmedCount,
        pendingCount: pendingContact,
        trendPercentage: 0
      },
      completedCertificates: {
        totalReadyOrIssued: eligibleForCert,
        issuedThisMonth: students.filter(s => s.certificate.status === 'pago_liberado').length,
        trendPercentage: 0
      }
    };
  }, [students]);

  // Attendance Toggle with Strict Certification Evaluation + Supabase sync
  const handleToggleAttendance = (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => {
    let nextAttendanceStatus: AttendanceStatus = 'presente';

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const updatedAttendance = student.attendance.map((rec) => {
          if (rec.lessonNumber !== lessonNumber) return rec;

          let nextStatus: AttendanceStatus = 'presente';
          if (rec.status === 'presente') nextStatus = 'falta';
          else if (rec.status === 'falta') nextStatus = 'pendente';
          else nextStatus = 'presente';

          nextAttendanceStatus = nextStatus;
          return { ...rec, status: nextStatus };
        });

        // Evaluate eligibility strictly using domain rule
        const attendanceList = updatedAttendance.map(a => a.status.toUpperCase() as 'PRESENTE' | 'FALTA' | 'PENDENTE');
        const evalResult = evaluateCertificateEligibility(attendanceList, student.certificate.feePaid);

        let flagStatus: 'nao_elegivel' | 'em_andamento' | 'pendente_pagamento' | 'pago_liberado';
        if (evalResult.status === 'NAO_ELEGIVEL') {
          flagStatus = 'nao_elegivel';
        } else if (evalResult.status === 'PAGO_LIBERADO') {
          flagStatus = 'pago_liberado';
        } else if (evalResult.status === 'PENDENTE_PAGAMENTO') {
          flagStatus = 'pendente_pagamento';
        } else {
          flagStatus = 'em_andamento';
        }

        return {
          ...student,
          attendance: updatedAttendance,
          certificate: {
            ...student.certificate,
            status: flagStatus,
            code: flagStatus === 'pago_liberado' 
              ? (student.certificate.code || `UNIBE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`) 
              : undefined
          }
        };
      })
    );

    // Sync to Supabase in background
    updateAttendanceInSupabase(studentId, lessonNumber, nextAttendanceStatus).catch(err => {
      console.warn('Sync de presença falhou (Supabase):', err);
    });
  };

  // Toggle or confirm payment for student certificate fee (Pure organizational toggle) + Supabase sync
  const handleToggleFeePayment = (studentId: string) => {
    let targetPaid = false;

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        const newPaid = !student.certificate.feePaid;
        targetPaid = newPaid;
        const presences = student.attendance.filter(a => a.status === 'presente').length;
        const isEligible = presences === 4;

        return {
          ...student,
          certificate: {
            ...student.certificate,
            feePaid: newPaid,
            status: isEligible 
              ? (newPaid ? 'pago_liberado' : 'pendente_pagamento')
              : student.certificate.status,
            issuedAt: newPaid ? new Date().toISOString().split('T')[0] : undefined,
            code: newPaid ? (student.certificate.code || `UNIBE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`) : undefined
          }
        };
      })
    );

    // Sync to Supabase in background
    updateCertificatePaymentInSupabase(studentId, targetPaid).catch(err => {
      console.warn('Sync de pagamento da taxa falhou (Supabase):', err);
    });
  };

  // Handle WhatsApp Status Update + Supabase log
  const handleUpdateWhatsAppStatus = (studentId: string, status: WhatsAppContactStatusType) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        // Sync to Supabase log
        logWhatsAppSentInSupabase(
          studentId,
          s.guardian?.phone || s.phone,
          `Contato via WhatsApp atualizado para: ${status}`,
          status === 'confirmado' ? 'confirmado' : 'mensagem_enviada'
        ).catch(console.warn);

        return { ...s, whatsappStatus: status };
      })
    );
  };

  // Open WhatsApp Modal
  const handleOpenWhatsApp = (student: Student) => {
    setSelectedStudentForWhatsApp(student);
    setIsWhatsAppOpen(true);
  };

  // Open Certificate Modal
  const handleOpenCertificate = (student: Student) => {
    setSelectedStudentForCert(student);
    setIsCertOpen(true);
  };

  // Handle New Student Enrollment + Supabase insertion
  const handleEnrollStudent = async (newStudentData: Partial<Student>) => {
    const saturdays = newStudentData.saturdays || ['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14'];
    
    // Try to persist to Supabase
    try {
      const createdStudent = await createEnrollmentInSupabase({
        studentName: newStudentData.name || 'Novo Aluno',
        guardianName: newStudentData.guardian?.name || 'Responsável Legal',
        guardianPhone: newStudentData.guardian?.phone || '11999999999',
        guardianRelationship: newStudentData.guardian?.relationship || 'Mãe',
        shift: newStudentData.shift || 'manha',
        enrollmentDate: newStudentData.enrollmentDate || new Date().toISOString().split('T')[0],
        saturdays
      });

      if (createdStudent) {
        setStudents((prev) => [createdStudent, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Erro ao salvar no Supabase, aplicando localmente:', err);
    }

    // Fallback local
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      registrationNumber: `UNB-2026-00${students.length + 1}`,
      name: newStudentData.name || 'Novo Aluno',
      email: newStudentData.email,
      phone: newStudentData.phone || '11999999999',
      birthDate: newStudentData.birthDate || '2008-01-01',
      isUnderage: true,
      guardian: newStudentData.guardian,
      cycleId: 'cycle-2026-out-manha',
      cycleName: 'Turma Outubro 2026 - Manhã',
      shift: newStudentData.shift || 'manha',
      classroom: newStudentData.classroom || 'Lab 102',
      currentLesson: 1,
      enrollmentDate: newStudentData.enrollmentDate || '2026-10-21',
      saturdays,
      attendance: newStudentData.attendance || saturdays.map((date, idx) => ({
        lessonNumber: (idx + 1) as 1 | 2 | 3 | 4,
        date,
        status: 'pendente'
      })),
      whatsappStatus: 'nao_contatado',
      certificate: {
        id: `cert-${Date.now()}`,
        studentId: '',
        status: 'em_andamento',
        feeAmount: 35.00,
        feePaid: false
      },
      createdAt: new Date().toISOString()
    };

    setStudents((prev) => [newStudent, ...prev]);
  };

  // Render Active Route Component
  const renderCurrentRouteView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <DashboardView 
            students={students}
            kpis={dynamicKpis}
            onNavigate={setCurrentRoute}
            onOpenEnrollment={() => setIsEnrollmentOpen(true)}
            selectedSaturday={selectedSaturday}
          />
        );

      case 'attendance':
        return (
          <AttendanceView 
            students={students}
            selectedSaturday={selectedSaturday}
            onSelectSaturday={setSelectedSaturday}
            availableSaturdays={availableSaturdays}
            onToggleAttendance={handleToggleAttendance}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenCertificate={handleOpenCertificate}
          />
        );

      case 'students':
        return (
          <StudentsView 
            students={students}
            onOpenEnrollment={() => setIsEnrollmentOpen(true)}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenCertificate={handleOpenCertificate}
          />
        );

      case 'whatsapp':
        return (
          <WhatsAppView 
            students={students}
            onOpenWhatsApp={handleOpenWhatsApp}
            onUpdateStatus={handleUpdateWhatsAppStatus}
          />
        );

      case 'certificates':
        return (
          <CertificatesView 
            students={students}
            onOpenCertificate={handleOpenCertificate}
            onToggleFeePayment={handleToggleFeePayment}
          />
        );

      case 'settings':
        return <SettingsView />;

      default:
        return (
          <DashboardView 
            students={students}
            kpis={dynamicKpis}
            onNavigate={setCurrentRoute}
            onOpenEnrollment={() => setIsEnrollmentOpen(true)}
            selectedSaturday={selectedSaturday}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile/Tablet Backdrop Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* 1. Left Sidebar Navigation (Deep Navy #0B192C) */}
      <Sidebar 
        currentPath={currentRoute}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 2. Top Header with universal search & user profile */}
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenEnrollmentModal={() => setIsEnrollmentOpen(true)}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        {/* 3. Dedicated Route View (No clutter, single task focus) */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {renderCurrentRouteView()}
        </main>
      </div>

      {/* WhatsApp Modal with Editable Pre-Filled Template */}
      <WhatsAppModal 
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        student={selectedStudentForWhatsApp}
        onUpdateStatus={handleUpdateWhatsAppStatus}
        selectedSaturdayDate={selectedSaturday}
      />

      {/* Enrollment Modal with Live Calculation of the 4 Saturdays */}
      <EnrollmentModal 
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        onEnrollStudent={handleEnrollStudent}
      />

      {/* Certificate Modal with Diploma view, Authenticity Key and Payment Confirmation */}
      <CertificateModal 
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        student={selectedStudentForCert}
        onConfirmPayment={handleToggleFeePayment}
      />
    </div>
  );
};
