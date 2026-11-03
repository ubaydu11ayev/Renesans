import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Course } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import { BookOpen, Edit2, Plus, Clock, Layers, Users, Info } from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const { courses, groups, students, updateCourse, addCourse } = useData();

  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<Course | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number>(320000);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [isActive, setIsActive] = useState(true);

  const handleOpenEdit = (c: Course) => {
    setSelectedCourseForEdit(c);
    setName(c.name);
    setDefaultPrice(c.defaultPrice);
    setDurationMonths(c.durationMonths);
    setIsActive(c.isActive);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (selectedCourseForEdit) {
      updateCourse(selectedCourseForEdit.id, {
        name: name.trim(),
        defaultPrice: Number(defaultPrice),
        durationMonths: Number(durationMonths),
        isActive,
      });
      setSelectedCourseForEdit(null);
    } else {
      addCourse({
        name: name.trim(),
        defaultPrice: Number(defaultPrice),
        durationMonths: Number(durationMonths),
        isActive,
      });
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            O‘quv kurslari va tariflar ({courses.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Markazning rasmiy fan yo‘nalishlari va oylik standart to‘lov miqdorlari
          </p>
        </div>
        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setName('');
            setDefaultPrice(320000);
            setDurationMonths(6);
            setIsActive(true);
            setIsAddModalOpen(true);
          }}
        >
          Yangi kurs qo‘shish
        </NeumorphicButton>
      </div>

      {/* Financial notice callout */}
      <div className="p-4 rounded-2xl neu-surface flex items-start gap-3 text-xs text-day-muted dark:text-night-muted">
        <Info className="w-4 h-4 text-day-accent dark:text-night-accent flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Qoida:</strong> Kurs narxi yangi ochiladigan guruhlar uchun standart qiymat bo‘lib xizmat qiladi. Guruh yaratishda yoki tahrirlashda narxni alohida belgilash mumkin. Kurs narxining o‘zgarishi avvalgi oylarning hisob-kitoblarini o‘zgartirmaydi.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const courseGroups = groups.filter(g => g.courseId === course.id);
          const courseStudentsCount = students.filter(s =>
            s.status === 'faol' && s.enrollments.some(e => e.isActive && courseGroups.some(cg => cg.id === e.groupId))
          ).length;

          return (
            <NeumorphicCard
              key={course.id}
              className="p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={course.isActive ? 'faol' : 'muzlatilgan'} />
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                      title="Narxni o‘zgartirish"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-extrabold text-lg text-day-text dark:text-night-text">
                  {course.name}
                </h4>

                <div className="mt-4 p-4 rounded-2xl neu-surface">
                  <span className="text-[11px] font-semibold text-day-muted dark:text-night-muted uppercase tracking-wider">
                    Oylik standart narx
                  </span>
                  <div className="text-2xl font-black text-day-accent dark:text-night-accent mt-1">
                    {formatCurrency(course.defaultPrice)}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-day-muted dark:text-night-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Davomiyligi: ~{course.durationMonths} oy</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-day-muted dark:text-night-muted">
                <span className="flex items-center gap-1 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-day-accent dark:text-night-accent" />
                  {courseGroups.length} ta guruh
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  {courseStudentsCount} ta o‘quvchi
                </span>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>

      {/* Edit / Add Course Modal */}
      <NeumorphicModal
        isOpen={Boolean(selectedCourseForEdit) || isAddModalOpen}
        onClose={() => {
          setSelectedCourseForEdit(null);
          setIsAddModalOpen(false);
        }}
        title={selectedCourseForEdit ? 'Kurs tarifini tahrirlash' : 'Yangi kurs qo‘shish'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <NeumorphicInput
            label="Kurs nomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: IELTS Intensive"
            required
          />

          <NeumorphicInput
            label="Oylik to‘lov miqdori (so‘mda)"
            type="text"
            inputMode="numeric"
            value={defaultPrice === 0 ? '' : defaultPrice}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setDefaultPrice(val ? Number(val) : 0);
            }}
            placeholder="320000"
            helperText={defaultPrice > 0 ? `${formatCurrency(defaultPrice)}` : 'Yangi guruhlar uchun boshlang‘ich taklif etiladigan narx'}
            required
          />

          <NeumorphicInput
            label="Dastur davomiyligi (oy)"
            type="number"
            value={durationMonths}
            onChange={(e) => setDurationMonths(Number(e.target.value))}
            placeholder="6"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => {
                setSelectedCourseForEdit(null);
                setIsAddModalOpen(false);
              }}
            >
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

