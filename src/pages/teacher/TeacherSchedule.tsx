import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { UZ_DAYS } from '../../utils/formatters';
import { Calendar, Clock, DoorClosed } from 'lucide-react';

export const TeacherSchedule: React.FC = () => {
  const { currentUser } = useAuth();
  const { groups } = useData();

  const teacherId = currentUser?.teacherId;
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');

  const myScheduleItems = myGroups.flatMap(group =>
    group.schedule.map(sched => ({
      group,
      schedule: sched,
    }))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Mening dars jadvalim
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Haftalik dars soatlari va belgilangan xonalar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {UZ_DAYS.map(day => {
          const itemsForDay = myScheduleItems
            .filter(item => item.schedule.dayOfWeek === day.id)
            .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

          return (
            <NeumorphicCard key={day.id} className="p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-4">
                <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                  {day.name}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-lg neu-surface font-bold text-day-accent dark:text-night-accent">
                  {itemsForDay.length} ta dars
                </span>
              </div>

              {itemsForDay.length === 0 ? (
                <div className="my-auto py-6 text-center text-xs text-day-muted dark:text-night-muted italic">
                  Darslar mavjud emas
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {itemsForDay.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl neu-surface hover:translate-x-1 transition-transform"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-day-accent dark:text-night-accent">
                          {item.schedule.startTime} - {item.schedule.endTime}
                        </span>
                        <span className="font-semibold text-day-muted dark:text-night-muted flex items-center gap-1">
                          <DoorClosed className="w-3 h-3" />
                          {item.schedule.room}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                        {item.group.name}
                      </h5>
                      <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                        {item.group.courseName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </NeumorphicCard>
          );
        })}
      </div>
    </div>
  );
};

