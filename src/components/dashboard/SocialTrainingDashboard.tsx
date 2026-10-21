import React, { useState, useMemo } from 'react';
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
import { mockStudents, defaultKpis } from '../../data/mockData';
import { evaluateCertificateEligibility } from '../../lib/social-training';

export const SocialTrainingDashboard: React.FC = () => {
  // Navigation & UI States
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data States
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedSaturday, setSelectedSaturday] = useState<string>('2026-10-24');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedStudentForWhatsApp, setSelectedStudentForWhatsApp] = useState<Student | null>(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Available Saturdays in active cycle
  const availableSaturdays = useMemo(() => {
    return ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'];
  }, []);

  // Recalculate KPIs dynamically
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
    const attendancePercentage = totalRecorded > 0 ? Math.round((totalPresent / totalRecorded) * 100) : 92;

    const confirmedCount = students.filter(s => s.whatsappStatus === 'confirmado').length;
    const pendingContact = students.filter(s => s.whatsappStatus !== 'confirmado').length;
    const confirmedRate = totalStudents > 0 ? Math.round((confirmedCount / totalStudents) * 100) : 85;

    const eligibleForCert = students.filter(
      s => s.attendance.filter(a => a.status === 'presente').length === 4
    ).length;

    return {
      studentsScheduledThisSaturday: {
        total: totalStudents,
        shiftMorning: morningCount,
        shiftAfternoon: afternoonCount,
        trendPercentage: 12
      },
      overallAttendanceRate: {
        percentage: attendancePercentage,
        presentCount: totalPresent,
        totalExpected: totalRecorded || 48,
        trendPercentage: 4
      },
      whatsappConfirmations: {
        confirmedRate,
        confirmedCount,
        pendingCount: pendingContact,
        trendPercentage: 18
      },
      completedCertificates: {
        totalReadyOrIssued: eligibleForCert,
        issuedThisMonth: students.filter(s => s.certificate.status === 'pago_liberado').length,
        trendPercentage: 25
      }
    };
  }, [students]);

  // Attendance Toggle with Strict Certification Evaluation
  const handleToggleAttendance = (studentId: string, lessonNumber: 1 | 2 | 3 | 4) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        const updatedAttendance = student.attendance.map((rec) => {
          if (rec.lessonNumber !== lessonNumber) return rec;

          let nextStatus: AttendanceStatus = 'presente';
          if (rec.status === 'presente') nextStatus = 'falta';
          else if (rec.status === 'falta') nextStatus = 'pendente';
          else nextStatus = 'presente';

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
  };

  // Toggle or confirm payment for student certificate fee (Pure organizational toggle)
  const handleToggleFeePayment = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;
        const newPaid = !student.certificate.feePaid;
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
  };

  // Handle WhatsApp Status Update
  const handleUpdateWhatsAppStatus = (studentId: string, status: WhatsAppContactStatusType) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, whatsappStatus: status } : s))
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

  // Handle New Student Enrollment
  const handleEnrollStudent = (newStudentData: Partial<Student>) => {
    const saturdays = newStudentData.saturdays || ['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14'];
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

    setStudents([newStudent, ...students]);
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
      {/* 1. Left Sidebar Navigation (Deep Navy #0B192C) */}
      <Sidebar 
        currentPath={currentRoute}
        onNavigate={setCurrentRoute}
        collapsed={sidebarCollapsed}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 2. Top Header with universal search & user profile */}
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenEnrollmentModal={() => setIsEnrollmentOpen(true)}
        />

        {/* 3. Dedicated Route View (No clutter, single task focus) */}
        <main className="p-6 sm:p-8 flex-1">
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
