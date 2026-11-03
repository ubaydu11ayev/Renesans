import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttendanceStatus } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  CheckCheck,
  History,
  BookOpen,
} from 'lucide-react';

export const TeacherAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const { groups, students, saveAttendance, attendanceRecords } = useData();

  const teacherId = currentUser?.teacherId;
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');

  const [selectedGroupId, setSelectedGroupId] = useState(myGroups[0]?.id || '');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [homework, setHomework] = useState('');

  // Attendance state: Map of studentId -> status
  const currentGroupStudents = students.filter(
    s => s.status === 'faol' && s.enrollments.some(e => e.groupId === selectedGroupId && e.isActive)
  );

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize or load existing records for this group and date
  React.useEffect(() => {
    if (!selectedGroupId) return;
    const existing = attendanceRecords.find(
      r => r.groupId === selectedGroupId && r.lessonDate === lessonDate
    );

    if (existing) {
      const map: Record<string, AttendanceStatus> = {};
      existing.records.forEach(rec => {
        map[rec.studentId] = rec.status;
      });
      setAttendanceMap(map);
      setTopic(existing.topic || '');
      setHomework(existing.homework || '');
    } else {
      // Default to empty or keep present
      const map: Record<string, AttendanceStatus> = {};
      currentGroupStudents.forEach(st => {
        map[st.id] = 'keldi'; // standard friendly default
      });
      setAttendanceMap(map);
      setTopic('');
      setHomework('');
    }
  }, [selectedGroupId, lessonDate, attendanceRecords]);

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const map: Record<string, AttendanceStatus> = {};
    currentGroupStudents.forEach(st => {
      map[st.id] = 'keldi';
    });
    setAttendanceMap(map);
  };

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewModalOpen(true);
  };

  const handleFinalSave = () => {
    if (!selectedGroupId || !teacherId) return;

    const records = currentGroupStudents.map(st => ({
      studentId: st.id,
      studentName: st.fullName,
      status: attendanceMap[st.id] || 'keldi',
    }));

    saveAttendance({
      groupId: selectedGroupId,
      lessonDate,
      teacherId,
      topic: topic.trim() || undefined,
      homework: homework.trim() || undefined,
      records,
    });

    setIsReviewModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Summary counts
  const presentCount = Object.values(attendanceMap).filter(s => s === 'keldi').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'kelmadi').length;
  const lateCount = Object.values(attendanceMap).filter(s => s === 'kechikdi').length;
  const excusedCount = Object.values(attendanceMap).filter(s => s === 'sababli').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Dars davomati va vazifalar
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Darsga qatnashgan o‘quvchilarni belgilash, mavzu va uyga vazifani kiritish
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Davomat va dars ma’lumotlari muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {myGroups.length === 0 ? (
        <EmptyState
          title="Guruhlar mavjud emas"
          description="Sizga hali birorta faol guruh biriktirilmagan. Guruh biriktirilgach, davomat olishingiz mumkin."
        />
      ) : (
        <form onSubmit={handleOpenReview} className="space-y-6">
          {/* Controls Bar */}
          <NeumorphicCard className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeumorphicSelect
                label="Guruhni tanlang"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                options={myGroups.map(g => ({
                  value: g.id,
                  label: `${g.name} (${g.courseName})`,
                }))}
                required
              />

              <NeumorphicInput
                label="Dars sanasi"
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <NeumorphicInput
                label="Dars mavzusi (ixtiyoriy)"
                placeholder="Masalan: Unit 4 - Present Perfect Tense"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              <NeumorphicInput
                label="Uyga vazifa (ixtiyoriy)"
                placeholder="Masalan: Workbook 45-sahifa, 1-4 mashqlar"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
              />
            </div>
          </NeumorphicCard>

          {/* Quick Actions & Attendance Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl neu-surface">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600">
                Keldi: {presentCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-600">
                Kelmadi: {absentCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600">
                Kechikdi: {lateCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-600">
                Sababli: {excusedCount}
              </span>
            </div>

            <NeumorphicButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<CheckCheck className="w-4 h-4 text-emerald-500" />}
              onClick={handleMarkAllPresent}
            >
              Barchasi keldi
            </NeumorphicButton>
          </div>

          {/* Student attendance list - Mobile optimized */}
          {currentGroupStudents.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
              Ushbu guruhda o‘quvchilar ro‘yxatga olinmagan.
            </div>
          ) : (
            <div className="space-y-3">
              {currentGroupStudents.map((st, idx) => {
                const currentStatus = attendanceMap[st.id] || 'keldi';

                return (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl neu-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:translate-x-0.5 transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg neu-surface flex items-center justify-center font-bold text-xs text-day-muted dark:text-night-muted">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                          {st.fullName}
                        </h5>
                        <p className="text-xs text-day-muted dark:text-night-muted font-mono">
                          {st.phone}
                        </p>
                      </div>
                    </div>

                    {/* Quick status selector buttons */}
                    <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(st.id, 'keldi')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'keldi'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'neu-btn text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                      >
                        Keldi
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(st.id, 'kelmadi')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'kelmadi'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'neu-btn text-rose-600 hover:bg-rose-500/10'
                        }`}
                      >
                        Kelmadi
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(st.id, 'kechikdi')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'kechikdi'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'neu-btn text-amber-600 hover:bg-amber-500/10'
                        }`}
                      >
                        Kechikdi
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetStatus(st.id, 'sababli')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          currentStatus === 'sababli'
                            ? 'bg-sky-500 text-white shadow-md'
                            : 'neu-btn text-sky-600 hover:bg-sky-500/10'
                        }`}
                      >
                        Sababli
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          {currentGroupStudents.length > 0 && (
            <div className="flex justify-end pt-2">
              <NeumorphicButton type="submit" variant="primary" size="lg" icon={<Save className="w-5 h-5" />}>
                Tekshirish va Saqlash
              </NeumorphicButton>
            </div>
          )}
        </form>
      )}

      {/* Review Modal before final save */}
      <NeumorphicModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Davomatni tekshirish va tasdiqlash"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl neu-surface text-xs space-y-1">
            <div><strong>Guruh:</strong> {selectedGroup?.name}</div>
            <div><strong>Sana:</strong> {formatDate(lessonDate)}</div>
            {topic && <div><strong>Mavzu:</strong> {topic}</div>}
            {homework && <div><strong>Uyga vazifa:</strong> {homework}</div>}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {currentGroupStudents.map((st) => (
              <div key={st.id} className="p-2.5 rounded-xl neu-surface flex items-center justify-between text-xs">
                <span className="font-semibold text-day-text dark:text-night-text">{st.fullName}</span>
                <StatusBadge status={attendanceMap[st.id] || 'keldi'} />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton variant="secondary" onClick={() => setIsReviewModalOpen(false)}>
              Tahrirlashga qaytish
            </NeumorphicButton>
            <NeumorphicButton variant="primary" onClick={handleFinalSave}>
              Yakuniy saqlash
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>
    </div>
  );
};

