import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { fileToDataUrl } from '../../utils/imageUtils';
import {
  User,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Users,
  GraduationCap,
  Layers,
  CreditCard,
  Building,
  Lock,
  Calendar,
} from 'lucide-react';

export const AdminProfile: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { students, teachers, groups, payments } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.name || 'Bosh Administrator');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [phone, setPhone] = useState('+998 77 342 69 01');
  const [telegram, setTelegram] = useState('@renessans_admin');
  const [address, setAddress] = useState('Toshkent sh., Sardoba o‘quv markazi binosi');
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await updateUser(currentUser.id, {
      name: name.trim() || currentUser.name,
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const activeStudents = students.filter(s => s.status === 'faol').length;
  const activeTeachers = teachers.filter(t => t.isActive).length;
  const activeGroups = groups.filter(g => g.status === 'faol').length;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Administrator Profili
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          “Sardoba language stars” MCHJ • Renessans o‘quv markazi bosh boshqaruv hisobi
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Administrator ma’lumotlari muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <NeumorphicCard className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-black/5 dark:border-white/5">
          {/* Avatar with Upload button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl neu-surface overflow-hidden ring-2 ring-[#4361EE]/30 shrink-0 shadow-md">
              <img
                src={
                  avatarUrl ||
                  currentUser?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser?.name || 'Administrator'
                  )}&background=4361EE&color=fff`
                }
                alt={currentUser?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl neu-surface text-day-accent dark:text-night-accent shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Kompyuter yoki galereyadan rasm tanlash"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-day-text dark:text-night-text">
                    {name}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4361EE]/10 text-[#4361EE] border border-[#4361EE]/20">
                    Bosh Administrator
                  </span>
                </div>
                <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                  Tizimdagi loginingiz:{' '}
                  <strong className="font-mono text-day-text dark:text-night-text">
                    @{currentUser?.username}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl neu-surface text-day-accent dark:text-night-accent hover:opacity-90 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Galereyadan rasm yuklash</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-xs text-day-muted dark:text-night-muted">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg neu-surface font-medium">
                <Building className="w-3.5 h-3.5 text-day-accent dark:text-night-accent" />
                “Sardoba language stars” MCHJ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg neu-surface font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Tizim egasi (Root huquqlari)
              </span>
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

        {/* Quick System Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3.5 rounded-2xl neu-surface">
            <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase">
              O‘quvchilar
            </span>
            <div className="text-xl font-black text-day-text dark:text-night-text mt-0.5">
              {activeStudents} ta
            </div>
          </div>
          <div className="p-3.5 rounded-2xl neu-surface">
            <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase">
              O‘qituvchilar
            </span>
            <div className="text-xl font-black text-day-text dark:text-night-text mt-0.5">
              {activeTeachers} ta
            </div>
          </div>
          <div className="p-3.5 rounded-2xl neu-surface">
            <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase">
              Faol guruhlar
            </span>
            <div className="text-xl font-black text-day-text dark:text-night-text mt-0.5">
              {activeGroups} ta
            </div>
          </div>
          <div className="p-3.5 rounded-2xl neu-surface">
            <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase">
              Kassa to‘lovlari
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {payments.length} ta
            </div>
          </div>
        </div>

        {/* Form to edit Profile */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
          <h5 className="font-bold text-sm text-day-text dark:text-night-text">
            Shaxsiy ma’lumotlarni tahrirlash
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="F.I.SH. (To‘liq ism-sharifingiz)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Bosh Administrator"
              required
            />

            <NeumorphicInput
              label="Telefon raqamingiz"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 77 342 69 01"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Telegram / Rasmiy aloqa"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@renessans_admin"
              icon={<Mail className="w-4 h-4" />}
            />

            <NeumorphicInput
              label="Manzil / Ofis"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Toshkent sh., Sardoba markazi"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <NeumorphicInput
                label="Profil rasmi (Havola yoki kompyuterdan tanlangan fayl)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Rasm yuklash tugmasini bosing yoki havola kiriting"
                helperText="Yuqoridagi 'Galereyadan rasm yuklash' tugmasi orqali rasm tanlashingiz mumkin"
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
                <span>Rasmni olib tashlash</span>
              </NeumorphicButton>
            )}
          </div>

          <div className="flex justify-end pt-3">
            <NeumorphicButton type="submit" variant="primary">
              O‘zgarishlarni saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicCard>

      {/* Security & Access Card */}
      <NeumorphicCard className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent shrink-0">
            <Shield className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h5 className="font-bold text-base text-day-text dark:text-night-text">
              Tizim boshqaruvi va Xavfsizlik
            </h5>
            <p className="text-xs text-day-muted dark:text-night-muted mt-1 leading-relaxed">
              Siz markazning <strong>Bosh Administratori</strong> sifatida barcha ma’lumotlar bazasi, auditoriyalar, guruhlar, to‘lovlar va xodimlar vakolatlari ustidan to‘liq huquqqa egasiz. Tizimdagi xodimlarning login va parollarini o‘zgartirish tartibini chap menyudagi <strong>“Foydalanuvchilar”</strong> bo‘limida ko‘rishingiz mumkin.
            </p>
          </div>
        </div>
      </NeumorphicCard>
    </div>
  );
};

