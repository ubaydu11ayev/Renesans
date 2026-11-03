import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Teacher } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { fileToDataUrl } from '../../utils/imageUtils';
import {
  GraduationCap,
  Layers,
  Users,
  Phone,
  MapPin,
  Edit2,
  Plus,
  BookOpen,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

export const AdminTeachers: React.FC = () => {
  const {
    teachers,
    groups,
    updateTeacher,
    addTeacher,
    getTeacherActiveGroupsCount,
    getTeacherActiveStudentsCount,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTeacherForEdit, setSelectedTeacherForEdit] = useState<Teacher | null>(null);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  // Form
  const [fullName, setFullName] = useState('');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleTeacherImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Rasm yuklashda xatolik yuz berdi');
    }
  };

  const handleOpenEdit = (t: Teacher) => {
    setSelectedTeacherForEdit(t);
    setFullName(t.fullName);
    setSubjectsStr(t.subjects.join(', '));
    setPhone(t.phone || '');
    setAddress(t.address || '');
    setAvatarUrl(t.avatarUrl || '');
    setIsActive(t.isActive);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (selectedTeacherForEdit) {
      updateTeacher(selectedTeacherForEdit.id, {
        fullName: fullName.trim(),
        subjects,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        isActive,
      });
      setSelectedTeacherForEdit(null);
    } else {
      addTeacher({
        fullName: fullName.trim(),
        subjects,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        isActive,
      });
      setIsAddTeacherOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            O‘qituvchilar tarkibi ({teachers.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Renessans o‘quv markazining malakali pedagog xodimlari
          </p>
        </div>
        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedTeacherForEdit(null);
            setFullName('');
            setSubjectsStr('');
            setPhone('');
            setAddress('');
            setIsActive(true);
            setIsAddTeacherOpen(true);
          }}
        >
          O‘qituvchi qo‘shish
        </NeumorphicButton>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher, index) => {
          const activeGroups = getTeacherActiveGroupsCount(teacher.id);
          const activeStudents = getTeacherActiveStudentsCount(teacher.id);

          return (
            <NeumorphicCard
              key={teacher.id}
              className="p-6 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform"
            >
              <div>
                {/* Top Badge, Avatar & Number */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl neu-surface overflow-hidden ring-2 ring-black/5 dark:ring-white/10 shrink-0">
                      <img
                        src={teacher.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName)}&background=4361EE&color=fff`}
                        alt={teacher.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-day-muted dark:text-night-muted neu-surface px-2 py-0.5 rounded-lg inline-block">
                        №{index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={teacher.isActive ? 'faol' : 'muzlatilgan'} />
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h4 className="font-extrabold text-base text-day-text dark:text-night-text leading-snug">
                  {teacher.fullName}
                </h4>

                {/* Subjects tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {teacher.subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-xl neu-tab-active font-semibold text-day-accent dark:text-night-accent"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Contact info or unentered notice */}
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-1.5 text-xs text-day-muted dark:text-night-muted">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-day-muted dark:text-night-muted flex-shrink-0" />
                    <span>{teacher.phone || <em className="opacity-60">Telefon kiritilmagan</em>}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-day-muted dark:text-night-muted flex-shrink-0" />
                    <span className="truncate">{teacher.address || <em className="opacity-60">Manzil kiritilmagan</em>}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Active Groups & Students count */}
              <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl neu-surface text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-day-muted dark:text-night-muted font-semibold">
                    <Layers className="w-3 h-3 text-day-accent dark:text-night-accent" />
                    <span>Guruhlar</span>
                  </div>
                  <div className="font-black text-lg text-day-text dark:text-night-text mt-0.5">
                    {activeGroups}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl neu-surface text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-day-muted dark:text-night-muted font-semibold">
                    <Users className="w-3 h-3 text-emerald-500" />
                    <span>O‘quvchilar</span>
                  </div>
                  <div className="font-black text-lg text-day-text dark:text-night-text mt-0.5">
                    {activeStudents}
                  </div>
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>

      {/* Edit / Add Teacher Modal */}
      <NeumorphicModal
        isOpen={Boolean(selectedTeacherForEdit) || isAddTeacherOpen}
        onClose={() => {
          setSelectedTeacherForEdit(null);
          setIsAddTeacherOpen(false);
        }}
        title={selectedTeacherForEdit ? 'O‘qituvchi ma’lumotlarini tahrirlash' : 'Yangi o‘qituvchi kiritish'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <NeumorphicInput
            label="Familiya, Ism, Sharif"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masalan: Berdiqulov Erali Asatullayevich"
            required
          />

          <NeumorphicInput
            label="Dars beradigan fanlari (vergul bilan)"
            value={subjectsStr}
            onChange={(e) => setSubjectsStr(e.target.value)}
            placeholder="Masalan: Ingliz tili, IELTS"
            helperText="Bir nechta fanni vergul orqali yozing"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Telefon raqami"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 000 00 00"
            />
            <NeumorphicInput
              label="Yashash manzili"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masalan: Toshkent sh., Chilonzor"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-day-text dark:text-night-text uppercase tracking-wider">
                Profil rasmi
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl neu-surface text-day-accent dark:text-night-accent hover:opacity-90"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galereya / Fayldan tanlash</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleTeacherImageSelect}
            />

            <div className="flex items-center gap-3">
              {avatarUrl && (
                <div className="w-12 h-12 rounded-2xl neu-surface overflow-hidden ring-2 ring-day-accent/40 shrink-0">
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <NeumorphicInput
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Fayl tanlang yoki havola kiriting"
                  helperText="Kompyuter/galereyadan rasm yuklang yoki bo‘sh qoldiring"
                />
              </div>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10"
                  title="Rasmni tozalash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => {
                setSelectedTeacherForEdit(null);
                setIsAddTeacherOpen(false);
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

