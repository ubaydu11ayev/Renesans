import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Role, User } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Plus, Shield, KeyRound, Check, X } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, createUser, updateUser, toggleUserStatus, currentUser } = useAuth();
  const { settings, updateSettings, teachers, addTeacher } = useData();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserForEditCredentials, setSelectedUserForEditCredentials] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSuccess, setCredentialsSuccess] = useState(false);

  // Add user form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [teacherSubjects, setTeacherSubjects] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate clean username from Full Name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === 'admin') {
      const parts = val.trim().toLowerCase().split(/\s+/);
      if (parts.length > 0 && parts[0]) {
        // e.g. Ubaydullayev Nodirjon -> nodirjon or ubaydullayev
        const suggested = parts[1] || parts[0];
        const cleanLogin = suggested.replace(/[^a-z0-9]/g, '');
        if (cleanLogin && cleanLogin !== 'admin') {
          setUsername(cleanLogin);
        }
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) {
      setFormError('F.I.SH. kiritilishi shart.');
      return;
    }
    if (!trimmedUsername) {
      setFormError('Foydalanuvchi logini kiritilishi shart.');
      return;
    }
    if (!password) {
      setFormError('Boshlang‘ich parol kiritilishi shart.');
      return;
    }

    const exists = users.some(u => u.username.toLowerCase() === trimmedUsername);
    if (exists) {
      setFormError(`"${trimmedUsername}" logini allaqachon band. Iltimos, boshqa login tanlang.`);
      return;
    }

    let linkedTeacherId: string | undefined = undefined;

    // If role is teacher, automatically handle teacher record
    if (role === 'teacher') {
      const existingTeacher = teachers.find(
        t => t.fullName.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingTeacher) {
        linkedTeacherId = existingTeacher.id;
      } else {
        const subjects = teacherSubjects.trim()
          ? teacherSubjects.split(',').map(s => s.trim()).filter(Boolean)
          : ['Umumiy fanlar'];

        const newTeacherId = `t-${Date.now()}`;
        await addTeacher({
          fullName: trimmedName,
          subjects,
          isActive: true,
        });
        linkedTeacherId = newTeacherId;
      }
    }

    createUser({
      name: trimmedName,
      username: trimmedUsername,
      passwordHash: password,
      role,
      teacherId: linkedTeacherId,
      isActive: true,
    });

    setIsAddUserModalOpen(false);
    setName('');
    setUsername('');
    setPassword('');
    setTeacherSubjects('');
  };

  const handleOpenEditCredentials = (u: User) => {
    if (currentUser?.role !== 'manager') return;
    setSelectedUserForEditCredentials(u);
    setEditUsername(u.username);
    setEditPassword(u.passwordHash || '');
    setCredentialsError(null);
    setCredentialsSuccess(false);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEditCredentials || currentUser?.role !== 'manager') return;
    setCredentialsError(null);

    const cleanUsername = editUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setCredentialsError('Login kiritilishi shart.');
      return;
    }
    if (!editPassword) {
      setCredentialsError('Parol kiritilishi shart.');
      return;
    }

    const collision = users.some(
      u => u.id !== selectedUserForEditCredentials.id && u.username.toLowerCase() === cleanUsername
    );
    if (collision) {
      setCredentialsError('Ushbu login bilan boshqa foydalanuvchi allaqachon mavjud.');
      return;
    }

    try {
      await updateUser(selectedUserForEditCredentials.id, {
        username: cleanUsername,
        passwordHash: editPassword,
      });
      setCredentialsSuccess(true);
      setTimeout(() => {
        setSelectedUserForEditCredentials(null);
      }, 700);
    } catch (err: any) {
      setCredentialsError('Xatolik yuz berdi.');
    }
  };

  const handleTogglePermission = (key: keyof typeof settings.managerPermissions) => {
    updateSettings({
      managerPermissions: {
        ...settings.managerPermissions,
        [key]: !settings.managerPermissions[key],
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Foydalanuvchilar va Vakolatlar
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Tizim foydalanuvchilari, o‘qituvchi akkauntlari va menejer huquqlari
          </p>
        </div>
        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setName('');
            setUsername('');
            setPassword('');
            setRole('teacher');
            setTeacherSubjects('');
            setFormError(null);
            setIsAddUserModalOpen(true);
          }}
        >
          Yangi hisob yaratish
        </NeumorphicButton>
      </div>

      {/* Manager Permissions Matrix Card (Only for Admin) */}
      {currentUser?.role === 'admin' && (
        <NeumorphicCard className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                Menejer vakolatlari sozlamalari
              </h4>
              <p className="text-xs text-day-muted dark:text-night-muted">
                Menejer roli uchun ruxsat etilgan maxsus moliyaviy va ma’muriy amallar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Permission 1: Chegirma berish */}
            <div className="p-4 rounded-2xl neu-surface flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-day-text dark:text-night-text">Chegirma belgilash</p>
                <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5">O‘quvchiga shaxsiy chegirma</p>
              </div>
              <button
                onClick={() => handleTogglePermission('canGiveDiscount')}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  settings.managerPermissions.canGiveDiscount ? 'bg-emerald-500 justify-end' : 'bg-slate-400/40 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm inline-block" />
              </button>
            </div>

            {/* Permission 2: Narxni o'zgartirish */}
            <div className="p-4 rounded-2xl neu-surface flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-day-text dark:text-night-text">Guruh narxini o‘zgartirish</p>
                <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5">Guruh to‘lovini moslash</p>
              </div>
              <button
                onClick={() => handleTogglePermission('canChangePrice')}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  settings.managerPermissions.canChangePrice ? 'bg-emerald-500 justify-end' : 'bg-slate-400/40 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm inline-block" />
              </button>
            </div>

            {/* Permission 3: To'lovni bekor qilish */}
            <div className="p-4 rounded-2xl neu-surface flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-day-text dark:text-night-text">To‘lovni bekor qilish</p>
                <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5">Kvitansiyani bekor qilish</p>
              </div>
              <button
                onClick={() => handleTogglePermission('canVoidPayment')}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  settings.managerPermissions.canVoidPayment ? 'bg-emerald-500 justify-end' : 'bg-slate-400/40 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm inline-block" />
              </button>
            </div>

            {/* Permission 4: Hisobotlarni eksport qilish */}
            <div className="p-4 rounded-2xl neu-surface flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-day-text dark:text-night-text">Hisobot eksporti</p>
                <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5">Excel/CSV yuklab olish</p>
              </div>
              <button
                onClick={() => handleTogglePermission('canExportReports')}
                className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  settings.managerPermissions.canExportReports ? 'bg-emerald-500 justify-end' : 'bg-slate-400/40 justify-start'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm inline-block" />
              </button>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* Users List Table */}
      <NeumorphicCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
            Barcha foydalanuvchilar ({users.length})
          </h4>
          {currentUser?.role === 'admin' ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-day-muted dark:text-night-muted px-3 py-1 rounded-xl neu-surface">
              <Shield className="w-3.5 h-3.5 text-day-accent dark:text-night-accent" />
              <span>Login va parollarni o‘zgartirish vakolati: <strong>Faqat Menejerda</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-day-accent dark:text-night-accent px-3 py-1 rounded-xl bg-day-accent/10 dark:bg-night-accent/10 border border-day-accent/20 font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Foydalanuvchilar login va parolini o‘zgartirishingiz mumkin</span>
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Ism va Familiya</th>
                <th className="py-4 px-4">Login</th>
                <th className="py-4 px-4">Tizimdagi roli</th>
                <th className="py-4 px-4">Holati</th>
                <th className="py-4 px-4">Yaratilgan sana</th>
                <th className="py-4 px-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 font-bold text-day-text dark:text-night-text">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4361EE&color=fff`}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0 neu-surface"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-day-accent/15 text-day-accent dark:text-night-accent font-semibold">
                              Siz
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-day-muted dark:text-night-muted">
                    @{user.username}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-xl neu-surface font-bold uppercase text-[10px] ${
                      user.role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : user.role === 'manager' ? 'text-day-accent dark:text-night-accent' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Menejer' : 'O‘qituvchi'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={user.isActive ? 'faol' : 'muzlatilgan'} />
                  </td>
                  <td className="py-3.5 px-4 text-xs text-day-muted dark:text-night-muted">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    {/* Faqat Menejer foydalanuvchilar login va parolini o'zgartira oladi */}
                    {currentUser?.role === 'manager' && (
                      <button
                        onClick={() => handleOpenEditCredentials(user)}
                        className="neu-icon-btn w-8 h-8 rounded-lg text-day-accent dark:text-night-accent hover:brightness-110"
                        title="Login va parolni yangilash (Faqat Menejer vakolati)"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`neu-icon-btn w-8 h-8 rounded-lg ${user.isActive ? 'text-day-muted dark:text-night-muted hover:text-rose-500' : 'text-emerald-600 hover:text-emerald-500'}`}
                        title={user.isActive ? 'Faolsizlantirish' : 'Faollashtirish'}
                      >
                        {user.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>

      {/* Modal: Create User (Fixed per Image 1) */}
      <NeumorphicModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Yangi foydalanuvchi hisobi yaratish"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in">
              {formError}
            </div>
          )}

          <NeumorphicInput
            label="F.I.SH."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Masalan: Ubaydullayev Nodirjon"
            required
          />

          <NeumorphicSelect
            label="Tizimdagi roli"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={[
              { value: 'teacher', label: 'O‘qituvchi' },
              { value: 'manager', label: 'Menejer' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          {role === 'teacher' && (
            <NeumorphicInput
              label="Dars beradigan fanlari (ixtiyoriy)"
              value={teacherSubjects}
              onChange={(e) => setTeacherSubjects(e.target.value)}
              placeholder="Masalan: Ingliz tili, IELTS"
              helperText="Yozilmasa, 'Umumiy fanlar' deb belgilanadi"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <NeumorphicInput
              label="Foydalanuvchi logini"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              placeholder="Masalan: nodirjon"
              helperText="Harflar va raqamlar"
              required
            />
            <NeumorphicInput
              label="Boshlang‘ich parol"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol kiriting"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton type="button" variant="secondary" onClick={() => setIsAddUserModalOpen(false)}>
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              Yaratish
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>

      {/* Modal: Edit Credentials (Login & Parol yangilash) */}
      {selectedUserForEditCredentials && (
        <NeumorphicModal
          isOpen={Boolean(selectedUserForEditCredentials)}
          onClose={() => setSelectedUserForEditCredentials(null)}
          title={`Login va Parolni yangilash (Menejer): ${selectedUserForEditCredentials.name}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            {credentialsError && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-semibold">
                {credentialsError}
              </div>
            )}
            {credentialsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                Login va parol muvaffaqiyatli saqlandi!
              </div>
            )}

            <NeumorphicInput
              label="Foydalanuvchi logini"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value.toLowerCase().trim())}
              placeholder="Masalan: erali"
              required
            />

            <NeumorphicInput
              label="Yangi maxfiy parol"
              type="text"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Yangi parolni kiriting"
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-black/5 dark:border-white/5">
              <NeumorphicButton type="button" variant="secondary" onClick={() => setSelectedUserForEditCredentials(null)}>
                Bekor qilish
              </NeumorphicButton>
              <NeumorphicButton type="submit" variant="primary">
                Saqlash
              </NeumorphicButton>
            </div>
          </form>
        </NeumorphicModal>
      )}
    </div>
  );
};
