import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { TeacherMobileNav } from './components/layout/TeacherMobileNav';

// Admin views
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminGroups } from './pages/admin/AdminGroups';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminSchedule } from './pages/admin/AdminSchedule';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProfile } from './pages/admin/AdminProfile';

// Manager views
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ManagerDebtors } from './pages/manager/ManagerDebtors';
import { ManagerAttendance } from './pages/manager/ManagerAttendance';
import { ManagerCommunications } from './pages/manager/ManagerCommunications';
import { ManagerProfile } from './pages/manager/ManagerProfile';

// Teacher views
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherGroups } from './pages/teacher/TeacherGroups';
import { TeacherSchedule } from './pages/teacher/TeacherSchedule';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance';
import { TeacherLessons } from './pages/teacher/TeacherLessons';
import { TeacherResults } from './pages/teacher/TeacherResults';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Global modal triggers
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  if (!currentUser) {
    return <Login />;
  }

  // Page titles and subtitles
  const getPageInfo = () => {
    switch (currentTab) {
      // Admin tabs
      case 'dashboard':
        return {
          title: 'Boshqaruv paneli',
          subtitle: 'Renessans o‘quv markazining asosiy ko‘rsatkichlari',
        };
      case 'students':
        return {
          title: 'O‘quvchilar',
          subtitle: 'Markaz o‘quvchilari bazasi va to‘lov holatlari',
        };
      case 'teachers':
        return {
          title: 'O‘qituvchilar',
          subtitle: 'O‘qituvchilar tarkibi va dars yo‘nalishlari',
        };
      case 'groups':
        return {
          title: 'Guruhlar',
          subtitle: 'O‘quv guruhlari, tariflar va xonalar taqsimoti',
        };
      case 'courses':
        return {
          title: 'Kurslar',
          subtitle: 'Markazning rasmiy fanlari va oylik standart narxlar',
        };
      case 'schedule':
        return {
          title: 'Dars jadvali',
          subtitle: 'Haftalik va kunlik darslar jadvali',
        };
      case 'payments':
        return {
          title: 'To‘lovlar',
          subtitle: 'Kassa kirimlari, kvitansiyalar va qarzdorliklar',
        };
      case 'reports':
        return {
          title: 'Hisobotlar',
          subtitle: 'Moliyaviy va o‘quv natijalari tahlili',
        };
      case 'users':
        return {
          title: 'Foydalanuvchilar',
          subtitle: 'Tizim foydalanuvchilari va menejer vakolatlari',
        };
      case 'audit':
        return {
          title: 'Amallar tarixi',
          subtitle: 'Xavfsizlik va audit qaydnomalari',
        };
      case 'settings':
        return {
          title: 'Sozlamalar',
          subtitle: 'Tizim parametrlari va ma’lumotlar bazasi',
        };

      // Manager extra tabs
      case 'leads':
        return {
          title: 'Lidlar va Qabul (CRM)',
          subtitle: 'Yangi arizalar, sinov darslari va mijozlar voronkasi',
        };
      case 'communications':
        return {
          title: 'Ota-onalar bilan aloqa',
          subtitle: 'Qo‘ng‘iroqlar, to‘lov eslatmalari va muloqot jurnali',
        };
      case 'debtors':
        return {
          title: 'Qarzdorlik',
          subtitle: 'Muddati kelgan va to‘lanmagan to‘lovlar',
        };
      case 'attendance':
        return {
          title: 'Davomat',
          subtitle: 'Darslardagi qatnashuv ko‘rsatkichlari',
        };

      // Teacher tabs
      case 'my-groups':
        return {
          title: 'Mening guruhlarim',
          subtitle: 'Biriktirilgan o‘quv guruhlari va talabalar',
        };
      case 'my-schedule':
        return {
          title: 'Dars jadvalim',
          subtitle: 'Shaxsiy haftalik dars soatlari',
        };
      case 'lessons':
        return {
          title: 'Darslar va vazifalar',
          subtitle: 'O‘tilgan mavzular va topshirilgan uyga vazifalar',
        };
      case 'results':
        return {
          title: 'O‘quvchilar natijalari',
          subtitle: 'Imtihon ballari va baholash jurnali',
        };
      case 'profile':
        return {
          title: 'Mening profilim',
          subtitle: 'Aloqa ma’lumotlari va parolni yangilash',
        };

      default:
        return { title: 'Bosh sahifa', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  // Role based screen rendering
  const renderContent = () => {
    // 1. ADMIN
    if (currentUser.role === 'admin') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <AdminDashboard
              onNavigate={setCurrentTab}
              onOpenAddStudent={() => setCurrentTab('students')}
              onOpenPaymentModal={() => {
                setCurrentTab('payments');
                setIsAddPaymentModalOpen(true);
              }}
            />
          );
        case 'students':
          return <AdminStudents />;
        case 'teachers':
          return <AdminTeachers />;
        case 'groups':
          return <AdminGroups />;
        case 'courses':
          return <AdminCourses />;
        case 'schedule':
          return <AdminSchedule />;
        case 'payments':
          return (
            <AdminPayments
              isAddPaymentOpenInitial={isAddPaymentModalOpen}
              onCloseAddPaymentInitial={() => setIsAddPaymentModalOpen(false)}
            />
          );
        case 'reports':
          return <AdminReports />;
        case 'users':
          return <AdminUsers />;
        case 'audit':
          return <AdminAuditLogs />;
        case 'settings':
          return <AdminSettings />;
        case 'profile':
          return <AdminProfile />;
        case 'attendance':
          return <ManagerAttendance />;
        case 'users':
          return <AdminUsers />;
        default:
          return (
            <AdminDashboard
              onNavigate={setCurrentTab}
              onOpenAddStudent={() => setCurrentTab('students')}
              onOpenPaymentModal={() => setIsAddPaymentModalOpen(true)}
            />
          );
      }
    }

    // 2. MANAGER
    if (currentUser.role === 'manager') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <ManagerDashboard
              onNavigate={setCurrentTab}
              onOpenAddStudent={() => setCurrentTab('students')}
              onOpenPaymentModal={() => {
                setCurrentTab('payments');
                setIsAddPaymentModalOpen(true);
              }}
            />
          );
        case 'profile':
          return <ManagerProfile />;
        case 'communications':
          return <ManagerCommunications />;
        case 'students':
          return <AdminStudents />;
        case 'groups':
          return <AdminGroups />;
        case 'teachers':
          return <AdminTeachers />;
        case 'schedule':
          return <AdminSchedule />;
        case 'payments':
          return (
            <AdminPayments
              isAddPaymentOpenInitial={isAddPaymentModalOpen}
              onCloseAddPaymentInitial={() => setIsAddPaymentModalOpen(false)}
            />
          );
        case 'debtors':
          return (
            <ManagerDebtors
              onOpenPaymentModal={() => {
                setCurrentTab('payments');
                setIsAddPaymentModalOpen(true);
              }}
            />
          );
        case 'attendance':
          return <ManagerAttendance />;
        case 'users':
          return <AdminUsers />;
        default:
          return (
            <ManagerDashboard
              onNavigate={setCurrentTab}
              onOpenAddStudent={() => setCurrentTab('students')}
              onOpenPaymentModal={() => {
                setCurrentTab('payments');
                setIsAddPaymentModalOpen(true);
              }}
            />
          );
      }
    }

    // 3. TEACHER
    if (currentUser.role === 'teacher') {
      switch (currentTab) {
        case 'dashboard':
          return <TeacherDashboard onNavigate={setCurrentTab} />;
        case 'my-groups':
          return <TeacherGroups onNavigateAttendance={() => setCurrentTab('attendance')} />;
        case 'my-schedule':
          return <TeacherSchedule />;
        case 'attendance':
          return <TeacherAttendance />;
        case 'lessons':
          return <TeacherLessons />;
        case 'results':
          return <TeacherResults />;
        case 'profile':
          return <TeacherProfile />;
        default:
          return <TeacherDashboard onNavigate={setCurrentTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen flex bg-[#E9EDF2] dark:bg-[#171E2B] text-day-text dark:text-night-text transition-colors duration-200">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={setCurrentTab}
        />

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto ${currentUser.role === 'teacher' ? 'pb-24 md:pb-16' : 'pb-16'}`}>
          {renderContent()}
        </main>

        {/* Dedicated Mobile Navigation for Teachers */}
        {currentUser.role === 'teacher' && (
          <TeacherMobileNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
          />
        )}

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-black/5 dark:border-white/5 text-center text-xs text-day-muted dark:text-night-muted transition-colors">
          <div className="font-semibold text-day-text dark:text-night-text">
            “Sardoba language stars” MCHJ
          </div>
          <div className="text-[11px] opacity-75 mt-0.5">
            Renessans o‘quv markazi boshqaruv tizimi &copy; 2026. Barcha huquqlar himoyalangan.
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
