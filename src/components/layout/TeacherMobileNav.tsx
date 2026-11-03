import React from 'react';
import { LayoutDashboard, Layers, Calendar, ClipboardCheck, User } from 'lucide-react';

interface TeacherMobileNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const TeacherMobileNav: React.FC<TeacherMobileNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'my-groups', label: 'Guruhlar', icon: Layers },
    // Center item is Attendance
    { id: 'attendance', label: 'Davomat', icon: ClipboardCheck, isAction: true },
    { id: 'my-schedule', label: 'Jadval', icon: Calendar },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#E9EDF2]/95 dark:bg-[#171E2B]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isAction) {
            return (
              <div key={item.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`-top-5 w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-gradient-to-tr from-day-accent to-indigo-600 text-white shadow-xl scale-110 ring-4 ring-[#E9EDF2] dark:ring-[#171E2B]'
                      : 'neu-card bg-[#E9EDF2] dark:bg-[#1C2534] text-day-accent dark:text-night-accent ring-2 ring-black/5 dark:ring-white/5 hover:scale-105 active:scale-95'
                  }`}
                  aria-label="Davomat belgilash"
                  title="Davomat belgilash"
                >
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </button>
                <span className={`text-[10px] font-black tracking-tight mt-0.5 select-none ${isActive ? 'text-day-accent dark:text-night-accent' : 'text-day-muted dark:text-night-muted'}`}>
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 select-none ${
                isActive
                  ? 'text-day-accent dark:text-night-accent font-extrabold'
                  : 'text-day-muted dark:text-night-muted hover:text-day-text dark:hover:text-night-text active:scale-95'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'neu-surface' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

