import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { EmptyState } from '../../components/common/EmptyState';
import { UZ_DAYS, checkScheduleConflict } from '../../utils/formatters';
import { Calendar, Clock, DoorClosed, DoorOpen, AlertTriangle, Filter, CheckCircle2, Plus, Trash2, Users, Edit2 } from 'lucide-react';

export const AdminSchedule: React.FC = () => {
  const { groups, teachers, rooms, addRoom, updateRoom, deleteRoom, updateGroup } = useData();

  // Filters
  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(0); // 0 = barcha kunlar
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
  const [viewMode, setViewMode] = useState<'haftalik' | 'kunlik'>('haftalik');

  // Rooms management modal
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('16');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [roomError, setRoomError] = useState<string | null>(null);

  // Edit room modal
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<any | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomCapacity, setEditRoomCapacity] = useState('16');
  const [editRoomDesc, setEditRoomDesc] = useState('');
  const [editRoomError, setEditRoomError] = useState<string | null>(null);

  const handleOpenEditRoom = (r: any) => {
    setSelectedRoomForEdit(r);
    setEditRoomName(r.name);
    setEditRoomCapacity(String(r.capacity || 16));
    setEditRoomDesc(r.description || '');
    setEditRoomError(null);
  };

  const handleSaveEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForEdit) return;
    setEditRoomError(null);

    const trimmedName = editRoomName.trim();
    if (!trimmedName) {
      setEditRoomError('Xona nomini kiriting.');
      return;
    }

    const oldName = selectedRoomForEdit.name;
    const capacityNum = Number(editRoomCapacity) || 16;

    await updateRoom(selectedRoomForEdit.id, {
      name: trimmedName,
      capacity: capacityNum,
      description: editRoomDesc.trim(),
    });

    // If room name changed, also update groups assigned to this room!
    if (oldName !== trimmedName) {
      const affectedGroups = groups.filter(g => g.room === oldName);
      for (const g of affectedGroups) {
        await updateGroup(g.id, { room: trimmedName });
      }
    }

    setSelectedRoomForEdit(null);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError(null);
    if (!newRoomName.trim()) {
      setRoomError('Xona nomini kiriting.');
      return;
    }
    const res = await addRoom({
      name: newRoomName.trim(),
      capacity: Number(newRoomCapacity) || 16,
      description: newRoomDesc.trim(),
      isActive: true,
    });
    if (res.success) {
      setNewRoomName('');
      setNewRoomCapacity('16');
      setNewRoomDesc('');
      setIsAddRoomModalOpen(false);
    } else {
      setRoomError(res.error || 'Xona qo‘shishda xatolik');
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (!confirm(`Haqiqatan ham "${name}"ni o‘chirmoqchimisiz?`)) return;
    const res = await deleteRoom(id);
    if (!res.success) {
      alert(res.error || 'Xonani o‘chirib bo‘lmadi.');
    }
  };

  // Filtered schedules
  const allScheduleItems = groups
    .filter(g => g.status === 'faol')
    .flatMap(group =>
      group.schedule.map(sched => ({
        group,
        schedule: sched,
      }))
    );

  const filteredItems = allScheduleItems.filter(item => {
    const matchesDay = selectedDayFilter === 0 || item.schedule.dayOfWeek === selectedDayFilter;
    const matchesTeacher = selectedTeacherFilter ? item.group.teacherId === selectedTeacherFilter : true;
    const matchesRoom = selectedRoomFilter ? item.schedule.room === selectedRoomFilter : true;
    return matchesDay && matchesTeacher && matchesRoom;
  });

  // Sort by start time
  filteredItems.sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Dars jadvali
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Haftalik va kunlik darslar, xonalar bandligi va o‘qituvchilar taqsimoti
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <NeumorphicButton
            variant="secondary"
            size="sm"
            icon={<DoorOpen className="w-4 h-4 text-day-accent dark:text-night-accent" />}
            onClick={() => setIsRoomsModalOpen(true)}
          >
            Auditoriyalar (1-7 xonalar)
          </NeumorphicButton>

          {/* View mode toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl neu-surface">
            <button
              onClick={() => { setViewMode('haftalik'); setSelectedDayFilter(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'haftalik' ? 'neu-tab-active text-day-accent dark:text-night-accent font-extrabold shadow-neu-pressed' : 'text-day-muted dark:text-night-muted'
              }`}
            >
              Haftalik
            </button>
            <button
              onClick={() => { setViewMode('kunlik'); setSelectedDayFilter(new Date().getDay() === 0 ? 7 : new Date().getDay()); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kunlik' ? 'neu-tab-active text-day-accent dark:text-night-accent font-extrabold shadow-neu-pressed' : 'text-day-muted dark:text-night-muted'
              }`}
            >
              Kunlik
            </button>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {viewMode === 'kunlik' && (
            <NeumorphicSelect
              label="Hafta kuni"
              value={String(selectedDayFilter)}
              onChange={(e) => setSelectedDayFilter(Number(e.target.value))}
              options={UZ_DAYS.map(d => ({ value: String(d.id), label: d.name }))}
            />
          )}

          <NeumorphicSelect
            label="O‘qituvchi bo‘yicha filtr"
            value={selectedTeacherFilter}
            onChange={(e) => setSelectedTeacherFilter(e.target.value)}
            options={[
              { value: '', label: 'Barcha o‘qituvchilar' },
              ...teachers.map(t => ({ value: t.id, label: t.fullName })),
            ]}
          />

          <NeumorphicSelect
            label="Xona bo‘yicha filtr"
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            options={[
              { value: '', label: 'Barcha xonalar' },
              ...rooms.map(r => ({ value: r.name, label: `${r.name} (${r.capacity} o‘rin)` })),
            ]}
          />
        </div>
      </NeumorphicCard>

      {/* Weekday view */}
      {viewMode === 'haftalik' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UZ_DAYS.map(day => {
            const dayItems = filteredItems.filter(item => item.schedule.dayOfWeek === day.id);
            return (
              <NeumorphicCard key={day.id} className="p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 mb-4">
                  <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                    {day.name}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-lg neu-surface font-bold text-day-accent dark:text-night-accent">
                    {dayItems.length} ta dars
                  </span>
                </div>

                {dayItems.length === 0 ? (
                  <div className="my-auto py-6 text-center text-xs text-day-muted dark:text-night-muted italic">
                    Darslar rejalashtirilmagan
                  </div>
                ) : (
                  <div className="space-y-3 flex-1">
                    {dayItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl neu-surface hover:translate-x-1 transition-transform"
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
                        <p className="text-xs text-day-muted dark:text-night-muted mt-0.5 truncate">
                          {item.group.teacherName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </NeumorphicCard>
            );
          })}
        </div>
      ) : (
        /* Daily View */
        <NeumorphicCard className="p-6">
          <div className="mb-4 pb-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
              {UZ_DAYS.find(d => d.id === selectedDayFilter)?.name || 'Tanlangan kun'} jadvali
            </h4>
            <span className="text-xs font-bold text-day-accent dark:text-night-accent">
              Jami {filteredItems.length} ta dars
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-day-muted dark:text-night-muted">
              Ushbu kunga darslar rejalashtirilmagan.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl neu-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl neu-tab-active font-mono font-bold text-xs text-day-accent dark:text-night-accent">
                      {item.schedule.startTime} - {item.schedule.endTime}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                        {item.group.name} ({item.group.courseName})
                      </h5>
                      <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                        O‘qituvchi: {item.group.teacherName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-day-muted dark:text-night-muted">
                    <DoorClosed className="w-4 h-4" />
                    <span>{item.schedule.room}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>
      )}

      {/* Auditoriyalar va Xonalar (1-7 xonalar) Modal */}
      <NeumorphicModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        title="O‘quv markazi auditoriyalari (1-dan 7-gacha xonalar)"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <p className="text-xs text-day-muted dark:text-night-muted">
                Dars xonalari soni: <strong>{rooms.length} ta</strong>. Har bir auditoriya dars jadvaliga avtomatik biriktiriladi.
              </p>
            </div>
            <NeumorphicButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddRoomModalOpen(true)}
            >
              Yangi xona qo‘shish
            </NeumorphicButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[60vh] overflow-y-auto p-1">
            {rooms.map((r) => {
              const assignedGroups = groups.filter(g => g.room === r.name || g.schedule?.some(s => s.room === r.name));
              return (
                <div key={r.id} className="p-4 rounded-2xl neu-surface flex flex-col justify-between relative group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-day-text dark:text-night-text flex items-center gap-1.5">
                        <DoorOpen className="w-4 h-4 text-day-accent dark:text-night-accent" />
                        {r.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-day-accent/15 text-day-accent dark:text-night-accent">
                        {r.capacity} o‘rin
                      </span>
                    </div>

                    <p className="text-xs text-day-muted dark:text-night-muted leading-relaxed">
                      {r.description || 'Dars mashg‘ulotlari xonasi'}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 text-[11px] text-day-muted dark:text-night-muted">
                      <span>Bandlik: </span>
                      {assignedGroups.length > 0 ? (
                        <span className="font-bold text-day-accent dark:text-night-accent">
                          {assignedGroups.length} ta guruh dars o‘tadi
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Bo‘sh</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-1.5 pt-2 mt-2">
                    <button
                      onClick={() => handleOpenEditRoom(r)}
                      className="p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 text-day-accent dark:text-night-accent hover:bg-day-accent/10 cursor-pointer"
                      title="Xonani tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(r.id, r.name)}
                      disabled={assignedGroups.length > 0}
                      className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                        assignedGroups.length > 0
                          ? 'opacity-30 cursor-not-allowed text-day-muted'
                          : 'text-rose-500 hover:bg-rose-500/10 cursor-pointer'
                      }`}
                      title={assignedGroups.length > 0 ? 'Xonada guruhlar mavjud, o‘chirib bo‘lmaydi' : 'Xonani o‘chirish'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              variant="secondary"
              onClick={() => setIsRoomsModalOpen(false)}
            >
              Yopish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>

      {/* Edit Room Modal */}
      {selectedRoomForEdit && (
        <NeumorphicModal
          isOpen={Boolean(selectedRoomForEdit)}
          onClose={() => setSelectedRoomForEdit(null)}
          title={`Auditoriyani tahrirlash: ${selectedRoomForEdit.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveEditRoom} className="space-y-4">
            {editRoomError && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
                {editRoomError}
              </div>
            )}

            <NeumorphicInput
              label="Xona nomi yoki raqami *"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              placeholder="Masalan: 4-xona yoki IELTS zali"
              required
              autoFocus
            />

            <NeumorphicInput
              label="Xona sig‘imi (o‘quvchi o‘rni) *"
              type="number"
              value={editRoomCapacity}
              onChange={(e) => setEditRoomCapacity(e.target.value)}
              placeholder="16"
              required
            />

            <NeumorphicInput
              label="Xona tavsifi (ixtiyoriy)"
              value={editRoomDesc}
              onChange={(e) => setEditRoomDesc(e.target.value)}
              placeholder="Masalan: IELTS / CEFR xonasi"
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
              <NeumorphicButton
                type="button"
                variant="secondary"
                onClick={() => setSelectedRoomForEdit(null)}
              >
                Bekor qilish
              </NeumorphicButton>
              <NeumorphicButton type="submit" variant="primary">
                Saqlash
              </NeumorphicButton>
            </div>
          </form>
        </NeumorphicModal>
      )}

      {/* Add Room Modal */}
      <NeumorphicModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Yangi auditoriya (xona) qo‘shish"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {roomError && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
              {roomError}
            </div>
          )}

          <NeumorphicInput
            label="Xona nomi yoki raqami *"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Masalan: 8-xona yoki Rus tili zali"
            required
            autoFocus
          />

          <NeumorphicInput
            label="Xona sig‘imi (o‘quvchi o‘rni) *"
            type="number"
            value={newRoomCapacity}
            onChange={(e) => setNewRoomCapacity(e.target.value)}
            placeholder="16"
            required
          />

          <NeumorphicInput
            label="Xona tavsifi (ixtiyoriy)"
            value={newRoomDesc}
            onChange={(e) => setNewRoomDesc(e.target.value)}
            placeholder="Masalan: Maxsus texnik jihozlar bilan ta’minlangan"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => setIsAddRoomModalOpen(false)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              Xonani saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>
    </div>
  );
};

