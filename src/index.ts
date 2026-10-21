// UNIBE - Módulo Treinamento Social Component Library

export * from './types';
export * from './utils/dateUtils';
export * from './data/mockData';

// Layout Components
export { Sidebar } from './components/layout/Sidebar';
export { Header } from './components/layout/Header';

// Dashboard Components
export { KpiCards } from './components/dashboard/KpiCards';
export { SaturdaySelector } from './components/dashboard/SaturdaySelector';
export { StudentsTable } from './components/dashboard/StudentsTable';
export { MiniCalendar } from './components/dashboard/MiniCalendar';
export { SocialTrainingDashboard } from './components/dashboard/SocialTrainingDashboard';

// Modals
export { WhatsAppModal } from './components/modals/WhatsAppModal';
export { EnrollmentModal } from './components/modals/EnrollmentModal';
export { CertificateModal } from './components/modals/CertificateModal';

// Main App
export { App } from './App';
export { default } from './App';
