import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Group } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import { Layers, Users, Clock, DoorClosed, Eye, Calendar } from 'lucide-react';

interface TeacherGroupsProps {
  onNavigateAttendance: () => void;
}

export const TeacherGroups: React.FC<TeacherGroupsProps> = ({ onNavigateAttendance }) => {
  const { currentUser } = useAuth();
  const { groups, students } = useData();

  const teacherId = currentUser?.teacherId;
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Mening guruhlarim ({myGroups.length})
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Sizga biriktirilgan faol o‘quv guruhlari va ulardagi o‘quvchilar ro‘yxati
        </p>
      </div>

      {myGroups.length === 0 ? (
        <EmptyState
          title="Guruhlar mavjud emas"
          description="Hozirda sizga biriktirilgan o‘quv guruhi topilmadi. Ma’muriyat tomonidan guruh biriktirilishi bilan bu yerda paydo bo‘ladi."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGroups.map((group) => {
            const groupStudents = students.filter(
              s => s.status === 'faol' && s.enrollments.some(e => e.groupId === group.id && e.isActive)
            );

            return (
              <NeumorphicCard
                key={group.id}
                className="p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl neu-tab-active text-day-accent dark:text-night-accent">
                      {group.courseName}
                    </span>
                    <StatusBadge status={group.status} />
                  </div>

                  <h4 className="font-extrabold text-lg text-day-text dark:text-night-text">
                    {group.name}
                  </h4>

                  <div className="mt-3 space-y-1.5 text-xs text-day-muted dark:text-night-muted">
                    <div className="flex items-center gap-1.5">
                      <DoorClosed className="w-3.5 h-3.5" />
                      <span>{group.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {group.schedule.map(s => s.dayName.slice(0, 4)).join(', ')} ({group.schedule[0]?.startTime} - {group.schedule[0]?.endTime})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="font-bold text-xs text-day-muted dark:text-night-muted">
                    {groupStudents.length} nafar o‘quvchi
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedGroup(group)}
                      className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                      title="O‘quvchilar ro‘yxati"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <NeumorphicButton
                      variant="primary"
                      size="sm"
                      onClick={onNavigateAttendance}
                    >
                      Davomat
                    </NeumorphicButton>
                  </div>
                </div>
              </NeumorphicCard>
            );
          })}
        </div>
      )}

      {/* Group Students Modal */}
      {selectedGroup && (
        <NeumorphicModal
          isOpen={Boolean(selectedGroup)}
          onClose={() => setSelectedGroup(null)}
          title={`${selectedGroup.name} — O‘quvchilar tarkibi`}
          maxWidth="md"
        >
          <div className="space-y-3">
            {students
              .filter(s => s.enrollments.some(e => e.groupId === selectedGroup.id && e.isActive))
              .map((st, idx) => (
                <div key={st.id} className="p-3 rounded-xl neu-surface flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-day-muted dark:text-night-muted">{idx + 1}.</span>
                    <div>
                      <p className="font-bold text-day-text dark:text-night-text">{st.fullName}</p>
                      <p className="text-[11px] text-day-muted dark:text-night-muted">{st.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={st.status} />
                </div>
              ))}
          </div>
        </NeumorphicModal>
      )}
    </div>
  );
};

