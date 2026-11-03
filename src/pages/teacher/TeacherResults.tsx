import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { formatDate } from '../../utils/formatters';
import { Award, Plus, CheckCircle2 } from 'lucide-react';

export const TeacherResults: React.FC = () => {
  const { currentUser } = useAuth();
  const { groups, students, studentResults, saveStudentResult } = useData();

  const teacherId = currentUser?.teacherId;
  const myGroups = groups.filter(g => g.teacherId === teacherId && g.status === 'faol');
  const myGroupIds = myGroups.map(g => g.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(myGroups[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [score, setScore] = useState<number>(85);
  const [title, setTitle] = useState('Oylik nazorat imtihoni');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Students in selected group
  const groupStudents = students.filter(
    s => s.status === 'faol' && s.enrollments.some(e => e.groupId === selectedGroupId && e.isActive)
  );

  const myResults = studentResults.filter(r => myGroupIds.includes(r.groupId));

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedGroupId) return;

    saveStudentResult({
      studentId: selectedStudentId,
      groupId: selectedGroupId,
      score: Number(score),
      title: title.trim(),
      notes: notes.trim() || undefined,
      date,
    });

    setIsAddModalOpen(false);
    setScore(85);
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            O‘quvchilar natijalari va Baholash
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Oraliq va yakuniy imtihon ballari, mock-test natijalari
          </p>
        </div>

        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedStudentId(groupStudents[0]?.id || '');
            setIsAddModalOpen(true);
          }}
          disabled={myGroups.length === 0}
        >
          Natija kiritish
        </NeumorphicButton>
      </div>

      {myResults.length === 0 ? (
        <NeumorphicCard className="p-8 text-center text-xs text-day-muted dark:text-night-muted">
          Hozircha o‘quvchilarning imtihon natijalari kiritilmagan. "Natija kiritish" tugmasi orqali ballarni saqlang.
        </NeumorphicCard>
      ) : (
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">O‘quvchi</th>
                  <th className="py-4 px-4">Guruh</th>
                  <th className="py-4 px-4">Imtihon nomi</th>
                  <th className="py-4 px-4">Sana</th>
                  <th className="py-4 px-5 text-right">Ball (100 dan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {myResults.map((res) => {
                  const student = students.find(s => s.id === res.studentId);
                  const grp = myGroups.find(g => g.id === res.groupId);
                  return (
                    <tr key={res.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 font-bold text-day-text dark:text-night-text">
                        {student?.fullName || 'O‘quvchi'}
                      </td>
                      <td className="py-3 px-4 text-xs text-day-muted dark:text-night-muted">
                        {grp?.name}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-day-text dark:text-night-text">
                        {res.title}
                        {res.notes && <p className="text-[11px] text-day-muted dark:text-night-muted">{res.notes}</p>}
                      </td>
                      <td className="py-3 px-4 text-xs text-day-muted dark:text-night-muted">
                        {formatDate(res.date)}
                      </td>
                      <td className="py-3 px-5 text-right font-black text-base">
                        <span className={`px-2.5 py-1 rounded-xl neu-surface ${res.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : res.score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {res.score} ball
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}

      {/* Modal: Add Result */}
      <NeumorphicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="O‘quvchi natijasini kiritish"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <NeumorphicSelect
            label="Guruhni tanlang"
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              const sts = students.filter(
                s => s.status === 'faol' && s.enrollments.some(en => en.groupId === e.target.value && en.isActive)
              );
              setSelectedStudentId(sts[0]?.id || '');
            }}
            options={myGroups.map(g => ({ value: g.id, label: g.name }))}
            required
          />

          <NeumorphicSelect
            label="O‘quvchini tanlang"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            options={groupStudents.map(s => ({ value: s.id, label: s.fullName }))}
            required
          />

          <NeumorphicInput
            label="Imtihon / Nazorat nomi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Mid-term exam"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <NeumorphicInput
              label="Ball (0 - 100)"
              type="text"
              inputMode="numeric"
              value={score === 0 ? '' : score}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setScore(val ? Math.min(100, Number(val)) : 0);
              }}
              placeholder="Masalan: 85"
              required
            />

            <NeumorphicInput
              label="Sana"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <NeumorphicInput
            label="O‘qituvchi izohi / Tavsiya"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Masalan: Listening bo‘yicha yaxshi natija"
          />

          <div className="flex justify-end gap-3 pt-2">
            <NeumorphicButton variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              Saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>
    </div>
  );
};

