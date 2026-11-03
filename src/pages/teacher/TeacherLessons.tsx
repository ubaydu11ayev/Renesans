import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { formatDate } from '../../utils/formatters';
import { BookOpen, FileText, Calendar, CheckCircle2 } from 'lucide-react';

export const TeacherLessons: React.FC = () => {
  const { currentUser } = useAuth();
  const { groups, attendanceRecords } = useData();

  const teacherId = currentUser?.teacherId;
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');
  const myGroupIds = myGroups.map(g => g.id);

  const [selectedGroupId, setSelectedGroupId] = useState('');

  const filteredRecords = attendanceRecords
    .filter(r => myGroupIds.includes(r.groupId))
    .filter(r => (selectedGroupId ? r.groupId === selectedGroupId : true))
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Darslar va Uyga vazifalar jurnali
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          O‘tilgan dars mavzulari, sanalar va topshirilgan uyga vazifalar tarixi
        </p>
      </div>

      <NeumorphicCard className="p-4 sm:p-5">
        <NeumorphicSelect
          label="Guruh bo‘yicha filtr"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          options={[
            { value: '', label: 'Barcha guruhlarim' },
            ...myGroups.map(g => ({ value: g.id, label: g.name })),
          ]}
        />
      </NeumorphicCard>

      {filteredRecords.length === 0 ? (
        <NeumorphicCard className="p-8 text-center text-xs text-day-muted dark:text-night-muted">
          Hozircha darslar yoki uyga vazifalar tarixi mavjud emas. Davomat sahifasida dars o‘tganda mavzu va vazifalarni kiritishingiz mumkin.
        </NeumorphicCard>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((rec) => {
            const grp = myGroups.find(g => g.id === rec.groupId);
            return (
              <NeumorphicCard key={rec.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-day-text dark:text-night-text text-base">
                      {grp?.name} ({grp?.courseName})
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-lg neu-surface text-day-muted dark:text-night-muted font-mono">
                      {formatDate(rec.lessonDate)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Qatnashdi: {rec.records.filter(r => r.status === 'keldi').length} nafar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl neu-surface">
                    <span className="text-day-muted dark:text-night-muted font-bold flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-day-accent dark:text-night-accent" />
                      Dars mavzusi:
                    </span>
                    <p className="text-day-text dark:text-night-text font-medium leading-relaxed">
                      {rec.topic || 'Mavzu kiritilmagan'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl neu-surface">
                    <span className="text-day-muted dark:text-night-muted font-bold flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Uyga vazifa:
                    </span>
                    <p className="text-day-text dark:text-night-text font-medium leading-relaxed">
                      {rec.homework || 'Uyga vazifa biriktirilmagan'}
                    </p>
                  </div>
                </div>
              </NeumorphicCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

