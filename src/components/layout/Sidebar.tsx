import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PhoneCall,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Role based navigation definitions
  const adminNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'students', label: 'O‘quvchilar', icon: Users },
    { id: 'teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
    { id: 'courses', label: 'Kurslar', icon: BookOpen },
    { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
    { id: 'payments', label: 'To‘lovlar', icon: CreditCard },
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
    { id: 'reports', label: 'Hisobotlar', icon: BarChart3 },
    { id: 'users', label: 'Foydalanuvchilar', icon: UserCog },
    { id: 'audit', label: 'Amallar tarixi', icon: History },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
    { id: 'profile', label: 'Mening profilim', icon: User },
  ];

  const managerNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'communications', label: 'Ota-onalar bilan aloqa', icon: PhoneCall },
    { id: 'students', label: 'O‘quvchilar', icon: Users },
    { id: 'groups', label: 'Guruhlar', icon: Layers },
    { id: 'teachers', label: 'O‘qituvchilar', icon: GraduationCap },
    { id: 'schedule', label: 'Dars jadvali', icon: Calendar },
    { id: 'payments', label: 'To‘lovlar', icon: CreditCard },
    { id: 'debtors', label: 'Qarzdorlik', icon: AlertCircle },
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
    { id: 'users', label: 'Foydalanuvchilar va Loginlar', icon: UserCog },
    { id: 'profile', label: 'Mening profilim', icon: User },
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'my-groups', label: 'Mening guruhlarim', icon: Layers },
    { id: 'my-schedule', label: 'Dars jadvalim', icon: Calendar },
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
    { id: 'lessons', label: 'Darslar va vazifalar', icon: FileText },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const navItems =
    currentUser.role === 'admin'
      ? adminNav
      : currentUser.role === 'manager'
      ? managerNav
      : teacherNav;

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Menejer',
    teacher: 'O‘qituvchi',
  };

  return (
    <aside
      className={`
        hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 select-none
        bg-[#E9EDF2] dark:bg-[#171E2B] border-r border-black/5 dark:border-white/5
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Brand Header */}
      <div className={`h-20 flex items-center border-b border-black/5 dark:border-white/5 relative ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'overflow-hidden'}`}>
          <div
            onClick={isCollapsed ? onToggleCollapse : undefined}
            className={`w-10 h-10 rounded-2xl neu-surface overflow-hidden ring-1 ring-[#D4AF37]/40 flex-shrink-0 p-0.5 shadow-sm ${
              isCollapsed ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all' : ''
            }`}
            title={isCollapsed ? 'Menyuni kengaytirish' : undefined}
          >
            <img
              src="/renessans-logo.jpg"
              alt="Renessans"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-lg tracking-tight text-day-accent dark:text-night-accent leading-none">
                Renessans
              </h1>
              <p className="text-[11px] font-semibold text-day-muted dark:text-night-muted tracking-wide mt-1">
                {roleLabels[currentUser.role]}
              </p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className={`neu-icon-btn rounded-xl text-day-muted dark:text-night-muted hover:text-day-accent transition-all cursor-pointer ${
            isCollapsed
              ? 'absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full neu-surface shadow-md ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center bg-[#E9EDF2] dark:bg-[#171E2B] z-30 hover:scale-110'
              : 'w-8 h-8 rounded-lg'
          }`}
          title={isCollapsed ? 'Kengaytirish' : 'Yig‘ish'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[16px] text-sm font-semibold transition-all duration-150 text-left
                ${
                  isActive
                    ? 'neu-tab-active font-bold text-day-accent dark:text-night-accent shadow-neu-pressed'
                    : 'text-day-muted dark:text-night-muted hover:text-day-text dark:hover:text-night-text hover:bg-black/5 dark:hover:bg-white/5'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-day-accent dark:text-night-accent' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile Mini Card in Sidebar */}
      <div className="px-3 py-2 border-t border-black/5 dark:border-white/5">
        <div className={`flex items-center gap-2.5 p-2 rounded-xl neu-surface ${isCollapsed ? 'justify-center p-1.5' : ''}`}>
          <img
            src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=4361EE&color=fff`}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0"
          />
          {!isCollapsed && (
            <div className="truncate flex-1 min-w-0">
              <p className="font-bold text-xs text-day-text dark:text-night-text truncate">{currentUser.name}</p>
              <p className="text-[10px] text-day-muted dark:text-night-muted truncate">@{currentUser.username}</p>
            </div>
          )}
        </div>
      </div>

      {/* Official Legal Footer */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-black/5 dark:border-white/5 text-[11px] text-center text-day-muted dark:text-night-muted">
          <div className="font-semibold text-day-text dark:text-night-text truncate">“Sardoba language stars” MCHJ</div>
          <div className="text-[10px] opacity-75 mt-0.5">Renessans o‘quv markazi</div>
        </div>
      )}
    </aside>
  );
};
