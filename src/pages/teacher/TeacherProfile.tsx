import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { formatDate } from '../../utils/formatters';
import { fileToDataUrl } from '../../utils/imageUtils';
import { User, KeyRound, Phone, MapPin, CheckCircle2, Shield, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { teachers, updateTeacher } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const teacherId = currentUser?.teacherId;
  const currentTeacher = teachers.find(t => t.id === teacherId);

  // States
  const [phone, setPhone] = useState(currentTeacher?.phone || '');
  const [address, setAddress] = useState(currentTeacher?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || currentTeacher?.avatarUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Rasm yuklashda xatolik yuz berdi');
    }
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    const trimmedAvatar = avatarUrl.trim() || undefined;

    updateTeacher(currentTeacher.id, {
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      avatarUrl: trimmedAvatar,
    });

    if (currentUser) {
      updateUser(currentUser.id, {
        avatarUrl: trimmedAvatar,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          O‘qituvchi profili va Sozlamalar
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Shaxsiy aloqa ma’lumotlari va akkaunt xavfsizligi
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Ma’lumotlar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <NeumorphicCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl neu-surface overflow-hidden ring-2 ring-black/5 dark:ring-white/10 shrink-0 shadow-sm">
              <img
                src={avatarUrl || currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || '')}&background=4361EE&color=fff`}
                alt={currentUser?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl neu-surface text-day-accent dark:text-night-accent shadow-md hover:scale-110 transition-transform"
              title="Kompyuter yoki galereyadan rasm tanlash"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg font-black text-day-text dark:text-night-text">
                {currentTeacher?.fullName || currentUser?.name}
              </h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl neu-surface text-day-accent dark:text-night-accent hover:opacity-90"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galereyadan rasm yuklash</span>
              </button>
            </div>
            <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
              Login: <strong className="font-mono text-day-text dark:text-night-text">@{currentUser?.username}</strong> • Ishga qabul sanasi: {formatDate(currentTeacher?.joinedDate)}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentTeacher?.subjects.map((sub, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 rounded-lg neu-surface font-semibold text-day-accent dark:text-night-accent">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hidden File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileSelect}
        />

        {uploadError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
            {uploadError}
          </div>
        )}

        {/* Contact info form */}
        <form onSubmit={handleUpdateContact} className="mt-6 space-y-4">
          <h5 className="font-bold text-sm text-day-text dark:text-night-text">
            Aloqa va Profil ma’lumotlari
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Telefon raqamingiz"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />

            <NeumorphicInput
              label="Yashash manzilingiz"
              placeholder="Toshkent sh., Yunusobod tumani"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <NeumorphicInput
                label="Profil rasmi (Galereyadan tanlang yoki URL kiriting)"
                placeholder="Rasm yuklash tugmasini bosing yoki havola kiriting"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                helperText="Surat kompyuter yoki telefon galereyasidan to‘g‘ridan-to‘g‘ri yuklanadi"
              />
            </div>
            {avatarUrl && (
              <NeumorphicButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setAvatarUrl('')}
                className="text-rose-500 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Olib tashlash</span>
              </NeumorphicButton>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <NeumorphicButton type="submit" variant="primary">
              Aloqa ma’lumotlarini saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicCard>

      {/* Xavfsizlik va Login/Parol ma’lumoti */}
      <NeumorphicCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-base text-day-text dark:text-night-text">
              Login va Parol xavfsizligi
            </h5>
            <p className="text-xs text-day-muted dark:text-night-muted mt-1 leading-relaxed">
              O‘quv markazi ichki tartibiga ko‘ra, o‘qituvchilarning login va parollari markaziy tizimda faqat <strong>Katta Menejer</strong> tomonidan boshqariladi va o‘zgartiriladi.
            </p>
            <div className="mt-3 p-3 rounded-xl neu-surface inline-flex items-center gap-2 text-xs font-mono text-day-text dark:text-night-text">
              <span className="text-day-muted dark:text-night-muted">Sizning amaldagi loginingiz:</span>
              <span className="font-bold text-day-accent dark:text-night-accent">@{currentUser?.username}</span>
            </div>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

