import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { ClipboardCheck, Calendar, Users, Eye } from 'lucide-react';

export const ManagerAttendance: React.FC = () => {
  const { attendanceRecords, groups, students } = useData();

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredRecords = attendanceRecords.filter(r => {
    const matchGroup = selectedGroup ? r.groupId === selectedGroup : true;
    const matchDate = selectedDate ? r.lessonDate === selectedDate : true;
    return matchGroup && matchDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Davomat nazorati
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Guruhlar bo‘yicha o‘quvchilarning darslarga qatnashish qaydnomasi
        </p>
      </div>

      {/* Filters */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NeumorphicSelect
            label="Guruh bo‘yicha filtr"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={[
              { value: '', label: 'Barcha guruhlar' },
              ...groups.map(g => ({ value: g.id, label: g.name })),
            ]}
          />

          <NeumorphicInput
            label="Sana bo‘yicha filtr"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </NeumorphicCard>

      {/* Records list */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="Davomat yozuvlari topilmadi"
          description="Tanlangan parametrlar bo‘yicha hech qanday dars davomati saqlanmagan."
        />
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const grp = groups.find(g => g.id === record.groupId);
            const presentCount = record.records.filter(r => r.status === 'keldi').length;
            const absentCount = record.records.filter(r => r.status === 'kelmadi').length;

            return (
              <NeumorphicCard key={record.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 gap-2 mb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                      {grp?.name} ({grp?.courseName})
                    </h4>
                    <p className="text-xs text-day-muted dark:text-night-muted">
                      O‘qituvchi: {grp?.teacherName} • Dars sanasi: {formatDate(record.lessonDate)}
                    </p>
                    {record.topic && (
                      <p className="text-xs font-medium text-day-accent dark:text-night-accent mt-1">
                        Mavzu: {record.topic}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
                      Keldi: {presentCount}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600 font-bold">
                      Kelmadi: {absentCount}
                    </span>
                  </div>
                </div>

                {/* Students attendance grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {record.records.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl neu-surface flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-day-text dark:text-night-text truncate mr-2">
                        {item.studentName}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </NeumorphicCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

