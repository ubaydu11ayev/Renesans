import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  Layers,
  Users,
  ClipboardCheck,
  Clock,
  DoorClosed,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAttendanceForGroup?: (groupId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onOpenAttendanceForGroup,
}) => {
  const { currentUser } = useAuth();
  const { groups, students, attendanceRecords, teachers } = useData();

  // Find linked teacher
  const teacherId = currentUser?.teacherId;
  const currentTeacher = teachers.find(t => t.id === teacherId);

  // My groups only!
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');

  // Active students in my groups
  const myGroupIds = myGroups.map(g => g.id);
  const myActiveStudents = students.filter(s =>
    s.status === 'faol' && s.enrollments.some(e => e.isActive && myGroupIds.includes(e.groupId))
  );

  // Today's lessons for this teacher
  const dayOfWeekToday = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayLessons = myGroups
    .flatMap(g =>
      g.schedule
        .filter(s => s.dayOfWeek === dayOfWeekToday)
        .map(s => ({ group: g, schedule: s }))
    )
    .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  const nextLesson = todayLessons[0];

  // My recent attendance records
  const myAttendance = attendanceRecords.filter(r => myGroupIds.includes(r.groupId));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 rounded-[26px] neu-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl neu-surface overflow-hidden ring-2 ring-black/5 dark:ring-white/10 shrink-0 shadow-sm">
            <img
              src={currentUser?.avatarUrl || currentTeacher?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || '')}&background=4361EE&color=fff`}
              alt={currentUser?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full neu-surface text-day-accent dark:text-night-accent">
                O‘qituvchi ish kabineti
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-day-text dark:text-night-text mt-1">
              Xush kelibsiz, {currentUser?.name}!
            </h3>
            <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted mt-0.5">
              Fanlaringiz: <strong className="text-day-text dark:text-night-text">{currentTeacher?.subjects.join(', ') || 'Fan biriktirilmagan'}</strong>
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<ClipboardCheck className="w-4 h-4" />}
            onClick={() => onNavigate('attendance')}
          >
            Davomat belgilash
          </NeumorphicButton>
        </div>
      </div>

      {/* Primary Teacher KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-day-muted dark:text-night-muted uppercase">Mening guruhlarim</span>
              <div className="text-2xl font-black text-day-text dark:text-night-text mt-1">
                {myGroups.length} ta
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Faol o‘quvchilarim</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {myActiveStudents.length} nafar
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">O‘tkazilgan darslar</span>
              <div className="text-2xl font-black text-day-text dark:text-night-text mt-1">
                {myAttendance.length} ta
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-indigo-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Next Lesson Today Highlight */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-day-accent dark:text-night-accent" />
            Bugungi eng yaqin darsingiz
          </h4>
          <span className="text-xs font-bold text-day-muted dark:text-night-muted">
            Bugun {todayLessons.length} ta dars rejalashtirilgan
          </span>
        </div>

        {nextLesson ? (
          <div className="p-5 rounded-2xl neu-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-day-accent/10 text-day-accent dark:text-night-accent font-mono font-bold text-xs">
                  {nextLesson.schedule.startTime} - {nextLesson.schedule.endTime}
                </span>
                <span className="flex items-center gap-1 text-xs text-day-muted dark:text-night-muted font-semibold">
                  <DoorClosed className="w-3.5 h-3.5" />
                  {nextLesson.schedule.room}
                </span>
              </div>
              <h5 className="font-black text-lg text-day-text dark:text-night-text mt-2">
                {nextLesson.group.name} ({nextLesson.group.courseName})
              </h5>
              <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                Guruhda {students.filter(s => s.enrollments.some(e => e.groupId === nextLesson.group.id && e.isActive)).length} nafar o‘quvchi ta’lim olmoqda.
              </p>
            </div>

            <NeumorphicButton
              variant="primary"
              size="md"
              icon={<ClipboardCheck className="w-4 h-4" />}
              onClick={() => onNavigate('attendance')}
            >
              Ushbu darsga davomat olish
            </NeumorphicButton>
          </div>
        ) : (
          <div className="p-6 rounded-2xl neu-surface text-center text-xs text-day-muted dark:text-night-muted">
            Bugungi kunda boshqa darslar rejalashtirilmagan.
          </div>
        )}
      </NeumorphicCard>

      {/* My Groups Overview */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
            <Layers className="w-5 h-5 text-day-accent dark:text-night-accent" />
            Mening guruhlarim ({myGroups.length})
          </h4>
          <NeumorphicButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('my-groups')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Barchasi
          </NeumorphicButton>
        </div>

        {myGroups.length === 0 ? (
          <div className="p-6 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
            Sizga hali guruh biriktirilmagan. Administrator yoki Menejer tomonidan guruh biriktirilishi kutilmoqda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myGroups.map((group) => {
              const count = students.filter(s => s.enrollments.some(e => e.groupId === group.id && e.isActive)).length;
              return (
                <div key={group.id} className="p-4 rounded-2xl neu-surface space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg neu-tab-active text-day-accent dark:text-night-accent">
                      {group.courseName}
                    </span>
                    <StatusBadge status={group.status} />
                  </div>
                  <h5 className="font-bold text-base text-day-text dark:text-night-text">{group.name}</h5>
                  <p className="text-xs text-day-muted dark:text-night-muted">
                    Xona: {group.room} • {count} o‘quvchi
                  </p>
                  <div className="pt-2">
                    <NeumorphicButton
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => onNavigate('attendance')}
                    >
                      Davomat belgilash
                    </NeumorphicButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
};

