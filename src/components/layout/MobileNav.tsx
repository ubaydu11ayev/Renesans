import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  CreditCard,
  BarChart3,
  UserCog,
  History,
  Settings,
  AlertCircle,
  ClipboardCheck,
  FileText,
  Award,
  User,
  LogOut,
  TrendingUp,
  PhoneCall,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const { currentUser, logout } = useAuth();

  if (!isOpen || !currentUser) return null;

  const adminNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'students', label: 'O‘quvchilar', icon: Users },
    { id: 'teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
    { id: 'courses', label: 'Kurslar', icon: BookOpen },
    { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
    { id: 'payments', label: 'To‘lovlar', icon: CreditCard },
    { id: 'reports', label: 'Hisobotlar', icon: BarChart3 },
    { id: 'users', label: 'Foydalanuvchilar', icon: UserCog },
    { id: 'audit', label: 'Amallar tarixi', icon: History },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  const managerNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'leads', label: 'Lidlar va Qabul (CRM)', icon: TrendingUp },
    { id: 'communications', label: 'Ota-onalar bilan aloqa', icon: PhoneCall },
    { id: 'students', label: 'O‘quvchilar', icon: Users },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
    { id: 'teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
    { id: 'payments', label: 'To‘lovlar', icon: CreditCard },
    { id: 'debtors', label: 'Qarzdorlik', icon: AlertCircle },
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
    { id: 'users', label: 'Foydalanuvchilar va Loginlar', icon: UserCog },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'my-groups', label: 'Mening guruhlarim', icon: Layers },
    { id: 'my-schedule', label: 'Dars jadvalim', icon: Calendar },
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
    { id: 'lessons', label: 'Darslar va vazifalar', icon: FileText },
    { id: 'results', label: 'Natijalar', icon: Award },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const navItems =
    currentUser.role === 'admin'
      ? adminNav
      : currentUser.role === 'manager'
      ? managerNav
      : teacherNav;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-72 max-w-[85vw] h-full bg-[#E9EDF2] dark:bg-[#171E2B] neu-card rounded-r-[24px] flex flex-col z-10 border-r border-white/20 dark:border-white/5">
        {/* Drawer Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl neu-surface overflow-hidden ring-1 ring-[#D4AF37]/40 flex-shrink-0 p-0.5 shadow-sm">
              <img src="/renessans-logo.jpg" alt="Renessans" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-day-accent dark:text-night-accent leading-none">
                Renessans
              </h2>
              <p className="text-[10px] text-day-muted dark:text-night-muted mt-1 uppercase font-semibold">
                {currentUser.role} paneli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neu-icon-btn w-9 h-9 rounded-xl text-day-muted dark:text-night-muted"
            aria-label="Menyuni yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 text-left
                  ${
                    isActive
                      ? 'neu-tab-active font-bold text-day-accent dark:text-night-accent shadow-neu-pressed'
                      : 'text-day-muted dark:text-night-muted hover:text-day-text dark:hover:text-night-text'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-day-accent dark:text-night-accent' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout & Legal Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 space-y-3">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 neu-btn hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            Tizimdan chiqish
          </button>
          <div className="text-[10px] text-center text-day-muted dark:text-night-muted">
            “Sardoba language stars” MCHJ
          </div>
        </div>
      </div>
    </div>
  );
};
