import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Group, LessonSchedule, GroupStatus } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, UZ_DAYS } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  DoorClosed,
  Users,
  AlertTriangle,
} from 'lucide-react';

export const AdminGroups: React.FC = () => {
  const {
    groups,
    courses,
    teachers,
    students,
    rooms,
    addRoom,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupStudentCount,
  } = useData();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<Group | null>(null);
  const [selectedGroupForProfile, setSelectedGroupForProfile] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isQuickAddRoomOpen, setIsQuickAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('16');

  // Form state
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [room, setRoom] = useState('1-xona');
  const [status, setStatus] = useState<GroupStatus>('faol');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');

  // Conflict warning state
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    const defaultCourse = courses[0];
    setCourseId(defaultCourse?.id || '');
    setMonthlyPrice(defaultCourse?.defaultPrice || 320000);
    setTeacherId(teachers[0]?.id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setRoom(rooms[0]?.name || '1-xona');
    setStatus('faol');
    setSelectedDays([1, 3, 5]);
    setStartTime('09:00');
    setEndTime('10:30');
    setConflictError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (g: Group) => {
    setSelectedGroupForEdit(g);
    setName(g.name);
    setCourseId(g.courseId);
    setTeacherId(g.teacherId);
    setMonthlyPrice(g.monthlyPrice);
    setStartDate(g.startDate);
    setRoom(g.room);
    setStatus(g.status);
    setSelectedDays(g.schedule.map(s => s.dayOfWeek));
    setStartTime(g.schedule[0]?.startTime || '09:00');
    setEndTime(g.schedule[0]?.endTime || '10:30');
    setConflictError(null);
  };

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    const crs = courses.find(c => c.id === newCourseId);
    if (crs && !selectedGroupForEdit) {
      setMonthlyPrice(crs.defaultPrice);
    }
  };

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const crs = courses.find(c => c.id === courseId);
    const tch = teachers.find(t => t.id === teacherId);

    if (!name.trim()) {
      setConflictError('Guruh nomi kiritilishi shart');
      return;
    }
    if (!crs) {
      setConflictError('Kurs tanlanishi shart');
      return;
    }
    if (!tch) {
      setConflictError('O‘qituvchi tanlanishi shart');
      return;
    }

    const scheduleItems: LessonSchedule[] = selectedDays.map(dayId => {
      const dayObj = UZ_DAYS.find(d => d.id === dayId);
      return {
        dayOfWeek: dayId,
        dayName: dayObj?.name || 'Kun',
        startTime,
        endTime,
        room,
      };
    });

    if (selectedGroupForEdit) {
      const res = await updateGroup(selectedGroupForEdit.id, {
        name: name.trim(),
        courseId: crs.id,
        courseName: crs.name,
        teacherId: tch.id,
        teacherName: tch.fullName,
        monthlyPrice: Number(monthlyPrice),
        startDate,
        room,
        status,
        schedule: scheduleItems,
      });

      if (!res.success) {
        setConflictError(res.conflict?.message || 'Jadval to‘qnashuvi aniqlandi');
        return;
      }
      setSelectedGroupForEdit(null);
    } else {
      const res = await addGroup({
        name: name.trim(),
        courseId: crs.id,
        courseName: crs.name,
        teacherId: tch.id,
        teacherName: tch.fullName,
        monthlyPrice: Number(monthlyPrice),
        startDate,
        room,
        status,
        schedule: scheduleItems,
      });

      if (!res.success) {
        setConflictError(res.conflict?.message || 'Jadval to‘qnashuvi aniqlandi');
        return;
      }
      setIsAddModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    await deleteGroup(groupToDelete.id);
    setGroupToDelete(null);
  };

  const handleQuickAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    const res = await addRoom({
      name: newRoomName.trim(),
      capacity: Number(newRoomCapacity) || 16,
      isActive: true,
    });
    if (res.success) {
      setRoom(newRoomName.trim());
      setNewRoomName('');
      setIsQuickAddRoomOpen(false);
    } else {
      alert(res.error || 'Xona qo‘shishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Guruhlar boshqaruvi ({groups.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            O‘quv guruhlari, kurslar, biriktirilgan o‘qituvchilar va jadvallar
          </p>
        </div>
        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Yangi guruh ochish
        </NeumorphicButton>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <EmptyState
          title="Hali guruh yaratilmagan"
          description="O‘quv markazida darslarni boshlash uchun birinchi o‘quv guruhini qo‘shing."
          actionText="Birinchi guruhni qo‘shish"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const studentCount = getGroupStudentCount(group.id);

            return (
              <NeumorphicCard
                key={group.id}
                className="p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl neu-surface text-day-accent dark:text-night-accent">
                      {group.courseName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={group.status} />
                      <button
                        onClick={() => handleOpenEdit(group)}
                        className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* DELETE GROUP BUTTON (Fix for Image 2) */}
                      <button
                        onClick={() => setGroupToDelete(group)}
                        className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-rose-500"
                        title="Guruhni o‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Group Name */}
                  <h4 className="font-extrabold text-lg text-day-text dark:text-night-text">
                    {group.name}
                  </h4>

                  {/* Teacher & Room */}
                  <div className="mt-3 space-y-1.5 text-xs text-day-muted dark:text-night-muted">
                    <p className="font-medium text-day-text dark:text-night-text">
                      O‘qituvchi: <strong>{group.teacherName}</strong>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <DoorClosed className="w-3.5 h-3.5" />
                      <span>{group.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {group.schedule.map(s => s.dayName.slice(0, 4)).join(', ')} (
                        {group.schedule[0]?.startTime || '—'} - {group.schedule[0]?.endTime || '—'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Student count & price */}
                <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-day-muted dark:text-night-muted uppercase font-semibold">Oylik to‘lov</span>
                    <p className="font-black text-sm text-day-text dark:text-night-text">
                      {formatCurrency(group.monthlyPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => setSelectedGroupForProfile(group)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-day-accent dark:text-night-accent"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{studentCount} o‘quvchi</span>
                    </button>
                  </div>
                </div>
              </NeumorphicCard>
            );
          })}
        </div>
      )}

      {/* Add / Edit Group Modal */}
      <NeumorphicModal
        isOpen={isAddModalOpen || Boolean(selectedGroupForEdit)}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedGroupForEdit(null);
        }}
        title={selectedGroupForEdit ? 'Guruh ma’lumotlarini tahrirlash' : 'Yangi guruh ochish'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {conflictError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-in shake">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black">To‘qnashuv aniqlandi!</p>
                <p className="font-medium mt-0.5">{conflictError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Guruh nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: IELTS Intensive 1"
              required
            />

            <NeumorphicSelect
              label="Kurs yo‘nalishi"
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              options={courses.map(c => ({
                value: c.id,
                label: `${c.name} (${formatCurrency(c.defaultPrice)})`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="Biriktirilgan o‘qituvchi"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              options={teachers.map(t => ({
                value: t.id,
                label: `${t.fullName} (${t.subjects.join(', ')})`,
              }))}
              required
            />

            <NeumorphicInput
              label="Ushbu guruh uchun oylik narx (so‘m)"
              type="text"
              inputMode="numeric"
              value={monthlyPrice === 0 ? '' : monthlyPrice}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setMonthlyPrice(val ? Number(val) : 0);
              }}
              placeholder="320000"
              helperText={monthlyPrice > 0 ? `${formatCurrency(monthlyPrice)}` : 'Guruh narxini kiriting'}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-day-muted dark:text-night-muted">
                  Dars xonasi *
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickAddRoomOpen(true)}
                  className="text-[11px] font-bold text-day-accent dark:text-night-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Yangi xona
                </button>
              </div>
              <NeumorphicSelect
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                options={rooms.map((r) => ({
                  value: r.name,
                  label: `${r.name} (${r.capacity} o‘rin)`,
                }))}
              />
            </div>
            <NeumorphicInput
              label="Boshlanish sanasi"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <NeumorphicSelect
              label="Guruh holati"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'faol', label: 'Faol' },
                { value: 'rejalashtirilgan', label: 'Rejalashtirilgan' },
                { value: 'yakunlangan', label: 'Yakunlangan' },
              ]}
            />
          </div>

          {/* Schedule Picker */}
          <div className="p-4 rounded-2xl neu-surface space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-day-muted dark:text-night-muted">
              Hafta kunlari va Dars vaqti
            </label>
            <div className="flex flex-wrap gap-2">
              {UZ_DAYS.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'neu-tab-active text-day-accent dark:text-night-accent font-extrabold shadow-neu-pressed'
                        : 'neu-btn text-day-muted dark:text-night-muted'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <NeumorphicInput
                label="Boshlanish vaqti"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <NeumorphicInput
                label="Tugash vaqti"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedGroupForEdit(null);
              }}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              {selectedGroupForEdit ? 'Saqlash' : 'Guruhni yaratish'}
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>

      {/* Delete Confirmation Modal (Fix for Image 2) */}
      <ConfirmDialog
        isOpen={Boolean(groupToDelete)}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Guruhni o‘chirish"
        message={`Rostdan ham "${groupToDelete?.name}" guruhini o‘chirmoqchimisiz? Guruh o‘chirilgach, unga biriktirilgan dars jadvali ham tozalanadi.`}
        confirmText="Ha, o‘chirilsin"
        cancelText="Bekor qilish"
        isDanger={true}
      />

      {/* Group Detail / Profile Modal */}
      {selectedGroupForProfile && (
        <NeumorphicModal
          isOpen={Boolean(selectedGroupForProfile)}
          onClose={() => setSelectedGroupForProfile(null)}
          title={`Guruh tafsilotlari: ${selectedGroupForProfile.name}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl neu-surface">
                <span className="text-day-muted dark:text-night-muted">Kurs:</span>
                <p className="font-bold text-day-text dark:text-night-text mt-0.5">{selectedGroupForProfile.courseName}</p>
              </div>
              <div className="p-3 rounded-xl neu-surface">
                <span className="text-day-muted dark:text-night-muted">O‘qituvchi:</span>
                <p className="font-bold text-day-text dark:text-night-text mt-0.5">{selectedGroupForProfile.teacherName}</p>
              </div>
              <div className="p-3 rounded-xl neu-surface">
                <span className="text-day-muted dark:text-night-muted">Xona va Jadval:</span>
                <p className="font-bold text-day-text dark:text-night-text mt-0.5">
                  {selectedGroupForProfile.room} • {selectedGroupForProfile.schedule.map(s => s.dayName.slice(0, 4)).join(', ')} ({selectedGroupForProfile.schedule[0]?.startTime}-{selectedGroupForProfile.schedule[0]?.endTime})
                </p>
              </div>
              <div className="p-3 rounded-xl neu-surface">
                <span className="text-day-muted dark:text-night-muted">Oylik to‘lov:</span>
                <p className="font-black text-day-accent dark:text-night-accent mt-0.5">{formatCurrency(selectedGroupForProfile.monthlyPrice)}</p>
              </div>
            </div>

            {/* Enrolled Students List */}
            <div>
              <h5 className="font-bold text-sm text-day-text dark:text-night-text mb-3">
                Guruhdagi o‘quvchilar ro‘yxati ({getGroupStudentCount(selectedGroupForProfile.id)})
              </h5>

              {getGroupStudentCount(selectedGroupForProfile.id) === 0 ? (
                <p className="p-4 rounded-xl neu-surface text-center text-xs text-day-muted dark:text-night-muted">
                  Hozirda bu guruhda o‘quvchilar mavjud emas. "O‘quvchilar" sahifasidan biriktirishingiz mumkin.
                </p>
              ) : (
                <div className="space-y-2">
                  {students
                    .filter(s => s.enrollments.some(e => e.groupId === selectedGroupForProfile.id && e.isActive))
                    .map((st, idx) => (
                      <div key={st.id} className="p-3 rounded-xl neu-surface flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-day-muted dark:text-night-muted">{idx + 1}.</span>
                          <span className="font-bold text-day-text dark:text-night-text">{st.fullName}</span>
                        </div>
                        <span className="font-mono text-day-muted dark:text-night-muted">{st.phone}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </NeumorphicModal>
      )}

      {/* Quick Add Room Modal */}
      <NeumorphicModal
        isOpen={isQuickAddRoomOpen}
        onClose={() => setIsQuickAddRoomOpen(false)}
        title="Yangi dars xonasi qo‘shish"
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddRoom} className="space-y-4">
          <NeumorphicInput
            label="Xona nomi yoki raqami"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Masalan: 8-xona yoki IT-laboratoriya"
            required
            autoFocus
          />

          <NeumorphicInput
            label="Sig‘imi (o‘rinlar soni)"
            type="number"
            value={newRoomCapacity}
            onChange={(e) => setNewRoomCapacity(e.target.value)}
            placeholder="16"
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => setIsQuickAddRoomOpen(false)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              Qo‘shish
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>
    </div>
  );
};
