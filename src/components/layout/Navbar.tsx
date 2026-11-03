import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  UserCircle,
  Bell,
  Plus,
  Shield,
  CheckCircle2,
  CreditCard,
  UserPlus,
  GraduationCap,
  Info,
  CheckCheck,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { NeumorphicButton } from '../common/NeumorphicButton';
import { formatDateTime } from '../../utils/formatters';

interface NavbarProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  onOpenMobileMenu: () => void;
  onNavigate?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  primaryAction,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadNotificationsCount, markAllNotificationsAsRead, deleteNotification } = useData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleNameMap: Record<string, string> = {
    admin: 'Bosh Administrator',
    manager: 'Katta Menejer',
    teacher: 'O‘qituvchi',
  };

  const handleNotificationClick = (tab?: string) => {
    setShowNotifications(false);
    if (tab && onNavigate) {
      onNavigate(tab);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'lead':
        return <UserPlus className="w-4 h-4 text-amber-500" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-day-accent dark:text-night-accent" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-20 px-4 sm:px-8 bg-[#E9EDF2]/90 dark:bg-[#171E2B]/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between transition-colors">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden neu-icon-btn w-10 h-10 rounded-xl text-day-text dark:text-night-text"
          aria-label="Menyu ochish"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-day-text dark:text-night-text tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-day-muted dark:text-night-muted">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Primary Page Action (e.g. O'quvchi qo'shish) */}
        {primaryAction && (
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={primaryAction.icon || <Plus className="w-4 h-4" />}
            onClick={primaryAction.onClick}
            className="hidden sm:inline-flex"
          >
            {primaryAction.label}
          </NeumorphicButton>
        )}

        {/* Bildirishnomalar (Notifications) */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="neu-icon-btn w-10 h-10 rounded-xl text-day-text dark:text-night-text relative"
            aria-label="Bildirishnomalar"
            title="Bildirishnomalar"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 sm:-right-8 mt-2 w-80 sm:w-96 rounded-2xl neu-card bg-[#E9EDF2] dark:bg-[#1C2534] z-40 border border-white/40 dark:border-white/10 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 overflow-hidden">
                {/* Popover Header */}
                <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-day-accent dark:text-night-accent" />
                    <h4 className="font-extrabold text-sm text-day-text dark:text-night-text">
                      Bildirishnomalar
                    </h4>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {unreadNotificationsCount} yangi
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-bold text-day-accent dark:text-night-accent hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Barchasi o‘qildi
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-day-muted dark:text-night-muted">
                      Hozircha hech qanday bildirishnoma yo‘q.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.linkTab)}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${
                          !notif.isRead ? 'bg-day-accent/5 dark:bg-night-accent/5' : ''
                        }`}
                      >
                        <div className="mt-0.5 p-2 rounded-xl neu-surface shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-day-text dark:text-night-text truncate">
                              {notif.title}
                            </h5>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-day-accent shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-day-muted dark:text-night-muted font-mono">
                            <span>{formatDateTime(notif.createdAt)}</span>
                            {notif.linkTab && (
                              <span className="text-day-accent dark:text-night-accent font-bold flex items-center gap-0.5">
                                Ko‘rish <ArrowRight className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 rounded-lg text-day-muted hover:text-rose-500 transition-colors opacity-60 hover:opacity-100"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle (Day / Night) */}
        <button
          onClick={toggleTheme}
          className="neu-icon-btn w-10 h-10 rounded-xl text-day-text dark:text-night-text"
          aria-label={theme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
          title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500 animate-in spin-in-90 duration-300" />
          )}
        </button>

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl neu-surface text-day-text dark:text-night-text hover:shadow-neu-card-hover transition-all outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-day-accent to-indigo-600 dark:from-night-accent dark:to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shrink-0">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.name.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold leading-tight truncate max-w-[130px]">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-day-muted dark:text-night-muted font-medium">
                {roleNameMap[currentUser?.role || 'admin']}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl neu-card bg-[#E9EDF2] dark:bg-[#1C2534] z-40 border border-white/40 dark:border-white/10 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="p-3 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden neu-surface ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                    <img
                      src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || '')}&background=4361EE&color=fff`}
                      alt={currentUser?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-xs font-bold text-day-text dark:text-night-text truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] text-day-accent dark:text-night-accent font-medium truncate">
                      @{currentUser?.username}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md neu-surface text-[9px] font-bold uppercase text-day-muted dark:text-night-muted">
                      {roleNameMap[currentUser?.role || 'admin']}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 space-y-1">
                  {onNavigate && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-day-text dark:text-night-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <UserCircle className="w-4 h-4 text-day-accent dark:text-night-accent" />
                      Mening profilim
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Tizimdan chiqish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

