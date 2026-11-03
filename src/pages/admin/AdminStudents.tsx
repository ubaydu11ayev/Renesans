import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Student, StudentGroupEnrollment } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate, exportToCSV, exportToExcel } from '../../utils/formatters';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Eye,
  Edit2,
  Phone,
  Layers,
  Calendar,
  CreditCard,
  ClipboardCheck,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const {
    students,
    groups,
    courses,
    payments,
    attendanceRecords,
    addStudent,
    updateStudent,
    enrollStudentInGroup,
    removeStudentFromGroup,
    transferStudentGroup,
    getStudentDebtForMonth,
  } = useData();

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedDebtFilter, setSelectedDebtFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'umumiy' | 'guruhlar' | 'tolovlar' | 'davomat'>('umumiy');

  // Group enrollment / transfer modals
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedEnrollGroupId, setSelectedEnrollGroupId] = useState('');
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState('');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFromGroupId, setTransferFromGroupId] = useState('');
  const [transferToGroupId, setTransferToGroupId] = useState('');

  // Form state for add/edit student
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'faol' | 'muzlatilgan' | 'ketgan'>('faol');
  const [formInitialGroupId, setFormInitialGroupId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAddModal = () => {
    setFormFullName('');
    setFormPhone('');
    setFormParentPhone('');
    setFormNotes('');
    setFormStatus('faol');
    setFormInitialGroupId('');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (s: Student) => {
    setSelectedStudentForEdit(s);
    setFormFullName(s.fullName);
    setFormPhone(s.phone);
    setFormParentPhone(s.parentPhone || '');
    setFormNotes(s.notes || '');
    setFormStatus(s.status);
    const activeEnr = s.enrollments.find(e => e.isActive);
    setFormInitialGroupId(activeEnr ? activeEnr.groupId : '');
    setFormErrors({});
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formFullName.trim()) errors.fullName = 'F.I.Sh. kiritilishi shart';
    if (!formPhone.trim()) errors.phone = 'Telefon raqami kiritilishi shart';
    if (!formParentPhone.trim()) errors.parentPhone = 'Ota-ona telefon raqami kiritilishi shart (aloqa uchun)';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (selectedStudentForEdit) {
      const currentActive = selectedStudentForEdit.enrollments.find(e => e.isActive);
      const currentActiveGroupId = currentActive ? currentActive.groupId : '';

      let updatedEnrollments = [...selectedStudentForEdit.enrollments];

      if (formInitialGroupId !== currentActiveGroupId) {
        if (!formInitialGroupId) {
          // Guruhdan chiqarish (biriktirilmagan)
          updatedEnrollments = updatedEnrollments.map(e =>
            e.isActive ? { ...e, isActive: false, leftDate: new Date().toISOString().split('T')[0] } : e
          );
        } else {
          // Eski faol guruhni faolsizlantirish
          updatedEnrollments = updatedEnrollments.map(e =>
            e.isActive ? { ...e, isActive: false, leftDate: new Date().toISOString().split('T')[0] } : e
          );

          // Yangi guruhni biriktirish
          const targetGrp = groups.find(g => g.id === formInitialGroupId);
          if (targetGrp) {
            const existingIdx = updatedEnrollments.findIndex(e => e.groupId === targetGrp.id);
            if (existingIdx !== -1) {
              updatedEnrollments[existingIdx] = {
                ...updatedEnrollments[existingIdx],
                groupName: targetGrp.name,
                isActive: true,
                leftDate: undefined,
              };
            } else {
              updatedEnrollments.push({
                groupId: targetGrp.id,
                groupName: targetGrp.name,
                joinedDate: new Date().toISOString().split('T')[0],
                isActive: true,
                customDiscount: currentActive?.customDiscount || 0,
                discountReason: currentActive?.discountReason,
              });
            }
          }
        }
      }

      await updateStudent(selectedStudentForEdit.id, {
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        parentPhone: formParentPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
        status: formStatus,
        enrollments: updatedEnrollments,
      });

      if (selectedStudentForProfile && selectedStudentForProfile.id === selectedStudentForEdit.id) {
        setSelectedStudentForProfile(prev => prev ? {
          ...prev,
          fullName: formFullName.trim(),
          phone: formPhone.trim(),
          parentPhone: formParentPhone.trim() || undefined,
          notes: formNotes.trim() || undefined,
          status: formStatus,
          enrollments: updatedEnrollments,
        } : null);
      }

      setSelectedStudentForEdit(null);
    } else {
      const newEnrollments: StudentGroupEnrollment[] = [];
      if (formInitialGroupId) {
        const grp = groups.find(g => g.id === formInitialGroupId);
        if (grp) {
          newEnrollments.push({
            groupId: grp.id,
            groupName: grp.name,
            joinedDate: new Date().toISOString().split('T')[0],
            isActive: true,
            customDiscount: 0,
          });
        }
      }

      await addStudent({
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        parentPhone: formParentPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
        status: formStatus,
        enrollments: newEnrollments,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleEnrollSave = () => {
    if (!selectedStudentForProfile || !selectedEnrollGroupId) return;
    const grp = groups.find(g => g.id === selectedEnrollGroupId);
    if (!grp) return;

    enrollStudentInGroup(selectedStudentForProfile.id, {
      groupId: grp.id,
      groupName: grp.name,
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true,
      customDiscount: Number(customDiscount) || 0,
      discountReason: discountReason.trim() || undefined,
    });

    setIsEnrollModalOpen(false);
    setSelectedEnrollGroupId('');
    setCustomDiscount(0);
    setDiscountReason('');

    // Refresh selected profile
    const updated = students.find(s => s.id === selectedStudentForProfile.id);
    if (updated) setSelectedStudentForProfile(updated);
  };

  const handleTransferSave = () => {
    if (!selectedStudentForProfile || !transferFromGroupId || !transferToGroupId) return;
    const toGrp = groups.find(g => g.id === transferToGroupId);
    if (!toGrp) return;

    transferStudentGroup(selectedStudentForProfile.id, transferFromGroupId, {
      id: toGrp.id,
      name: toGrp.name,
    });

    setIsTransferModalOpen(false);
    setTransferFromGroupId('');
    setTransferToGroupId('');

    // Refresh selected profile
    const updated = students.find(s => s.id === selectedStudentForProfile.id);
    if (updated) setSelectedStudentForProfile(updated);
  };

  // Filter logic
  const filteredStudents = students.filter(student => {
    const matchesQuery =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter ? student.status === selectedStatusFilter : true;

    const matchesGroup = selectedGroupFilter
      ? student.enrollments.some(e => e.isActive && e.groupId === selectedGroupFilter)
      : true;

    const matchesCourse = selectedCourseFilter
      ? student.enrollments.some(e => {
          if (!e.isActive) return false;
          const grp = groups.find(g => g.id === e.groupId);
          return grp && grp.courseId === selectedCourseFilter;
        })
      : true;

    const debt = getStudentDebtForMonth(student.id, currentMonth);
    const matchesDebt =
      selectedDebtFilter === 'debt'
        ? debt > 0
        : selectedDebtFilter === 'no_debt'
        ? debt === 0
        : true;

    return matchesQuery && matchesStatus && matchesGroup && matchesCourse && matchesDebt;
  });

  const handleExportExcel = () => {
    const headers = [
      'F.I.Sh.',
      'Telefon',
      'Ota-ona telefoni',
      'Holati',
      'Guruhlari',
      'Joriy oy qarzi',
      'Ro‘yxatdan o‘tgan sana',
    ];
    const rows = filteredStudents.map(s => [
      s.fullName,
      s.phone,
      s.parentPhone || '',
      s.status === 'faol' ? 'Faol' : s.status === 'muzlatilgan' ? 'Muzlatilgan' : 'Ketgan',
      s.enrollments.filter(e => e.isActive).map(e => e.groupName).join('; ') || 'Guruhsiz',
      formatCurrency(getStudentDebtForMonth(s.id, currentMonth)),
      formatDate(s.registeredDate),
    ]);
    exportToExcel(
      `Renessans_Oquvchilar_${currentMonth}`,
      headers,
      rows,
      `“Renessans” O‘quv Markazi — O‘quvchilar ro‘yxati (${currentMonth})`
    );
  };

  const handleExportCSV = () => {
    const headers = ['F.I.Sh.', 'Telefon', 'Ota-ona telefoni', 'Holati', 'Guruhlari', 'Joriy oy qarzi', 'Ro‘yxatdan o‘tgan sana'];
    const rows = filteredStudents.map(s => [
      s.fullName,
      s.phone,
      s.parentPhone || '',
      s.status,
      s.enrollments.filter(e => e.isActive).map(e => e.groupName).join('; '),
      formatCurrency(getStudentDebtForMonth(s.id, currentMonth)),
      formatDate(s.registeredDate),
    ]);
    exportToCSV(`Renessans_Oquvchilar_${currentMonth}`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            O‘quvchilar ro‘yxati ({filteredStudents.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Markazdagi barcha o‘quvchilar, guruh biriktiruvi va to‘lov holatlari
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <NeumorphicButton
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportExcel}
            title="Excel jadval yuklab olish"
          >
            Excel (.xls)
          </NeumorphicButton>
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            O‘quvchi qo‘shish
          </NeumorphicButton>
        </div>
      </div>

      {/* Search & Filters Card */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="lg:col-span-2">
            <NeumorphicInput
              placeholder="F.I.Sh. yoki telefon orqali qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <NeumorphicSelect
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            options={[
              { value: '', label: 'Barcha kurslar' },
              ...courses.map(c => ({ value: c.id, label: c.name })),
            ]}
          />

          <NeumorphicSelect
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            options={[
              { value: '', label: 'Barcha guruhlar' },
              ...groups.map(g => ({ value: g.id, label: g.name })),
            ]}
          />

          <NeumorphicSelect
            value={selectedDebtFilter}
            onChange={(e) => setSelectedDebtFilter(e.target.value)}
            options={[
              { value: '', label: 'Moliyaviy holat: Barchasi' },
              { value: 'debt', label: 'Faqat qarzdorlar' },
              { value: 'no_debt', label: 'Qarzi yo‘qlar' },
            ]}
          />
        </div>
      </NeumorphicCard>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="O‘quvchilar topilmadi"
          description={
            students.length === 0
              ? 'Hali tizimga o‘quvchilar qo‘shilmagan. Birinchi o‘quvchini ro‘yxatga oling.'
              : 'Qidiruv bo‘yicha hech qanday o‘quvchi mos kelmadi.'
          }
          actionText={students.length === 0 ? 'O‘quvchi qo‘shish' : undefined}
          onAction={students.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">F.I.Sh.</th>
                  <th className="py-4 px-4">Telefon</th>
                  <th className="py-4 px-4">Guruhlar</th>
                  <th className="py-4 px-4">Holati</th>
                  <th className="py-4 px-4">Joriy oy qoldig‘i</th>
                  <th className="py-4 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {filteredStudents.map((student) => {
                  const debt = getStudentDebtForMonth(student.id, currentMonth);
                  const activeEnrollments = student.enrollments.filter(e => e.isActive);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-day-text dark:text-night-text">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-day-muted dark:text-night-muted">
                          Ro‘yxatdan o‘tdi: {formatDate(student.registeredDate)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-day-text dark:text-night-text font-mono text-xs">
                          {student.phone}
                        </div>
                        {student.parentPhone && (
                          <div className="text-[11px] text-day-muted dark:text-night-muted">
                            Vasiy: {student.parentPhone}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {activeEnrollments.length === 0 ? (
                          <span className="text-xs text-day-muted dark:text-night-muted italic">
                            Guruhga biriktirilmagan
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {activeEnrollments.map((e) => (
                              <span
                                key={e.groupId}
                                className="text-xs px-2.5 py-1 rounded-lg neu-surface font-semibold text-day-accent dark:text-night-accent"
                              >
                                {e.groupName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={student.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {debt > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            - {formatCurrency(debt)}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            To‘langan
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                          title="Profilni ko‘rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-text"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}

      {/* Modal: O'quvchi qo'shish / tahrirlash */}
      <NeumorphicModal
        isOpen={isAddModalOpen || Boolean(selectedStudentForEdit)}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStudentForEdit(null);
        }}
        title={selectedStudentForEdit ? 'O‘quvchi ma’lumotlarini tahrirlash' : 'Yangi o‘quvchi ro‘yxatga olish'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <NeumorphicInput
            label="Familiya, Ism, Otasining ismi"
            placeholder="Masalan: Rustamov Jasur Anvar o‘g‘li"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            error={formErrors.fullName}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Telefon raqami"
              placeholder="+998 90 123 45 67"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              error={formErrors.phone}
              required
            />
            <NeumorphicInput
              label="Ota-onasi / Vasiy telefoni *"
              placeholder="+998 91 987 65 43"
              value={formParentPhone}
              onChange={(e) => setFormParentPhone(e.target.value)}
              error={formErrors.parentPhone}
              required
            />
          </div>

          <NeumorphicSelect
            label={
              selectedStudentForEdit
                ? 'Guruhga biriktirish / Guruhni o‘zgartirish'
                : 'Boshlang‘ich guruhga biriktirish (ixtiyoriy)'
            }
            value={formInitialGroupId}
            onChange={(e) => setFormInitialGroupId(e.target.value)}
            options={[
              { value: '', label: selectedStudentForEdit ? 'Guruhga biriktirilmagan' : 'Keyinroq biriktirish' },
              ...groups
                .filter(g => g.status === 'faol')
                .map(g => ({
                  value: g.id,
                  label: `${g.name} (${g.courseName} — ${g.teacherName})`,
                })),
            ]}
            helperText={
              selectedStudentForEdit
                ? 'O‘quvchini ushbu guruhga biriktirish yoki boshqa guruhga ko‘chirish'
                : 'Keyinroq ham o‘zgartirish mumkin'
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="O‘quvchi holati"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              options={[
                { value: 'faol', label: 'Faol' },
                { value: 'muzlatilgan', label: 'Muzlatilgan' },
                { value: 'ketgan', label: 'Ketgan' },
              ]}
            />
            <NeumorphicInput
              label="Qo‘shimcha izoh / Maqsad"
              placeholder="Masalan: IELTS 7.5 olish"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedStudentForEdit(null);
              }}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              {selectedStudentForEdit ? 'Saqlash' : 'O‘quvchini qo‘shish'}
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>

      {/* Modal: O'quvchi profili (Umumiy, Guruhlar, To'lovlar, Davomat) */}
      {selectedStudentForProfile && (
        <NeumorphicModal
          isOpen={Boolean(selectedStudentForProfile)}
          onClose={() => setSelectedStudentForProfile(null)}
          title={`O‘quvchi profili: ${selectedStudentForProfile.fullName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Profile Tab Navigation */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl neu-surface">
              <button
                onClick={() => setProfileActiveTab('umumiy')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  profileActiveTab === 'umumiy' ? 'neu-tab-active text-day-accent dark:text-night-accent' : 'text-day-muted dark:text-night-muted'
                }`}
              >
                Umumiy
              </button>
              <button
                onClick={() => setProfileActiveTab('guruhlar')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  profileActiveTab === 'guruhlar' ? 'neu-tab-active text-day-accent dark:text-night-accent' : 'text-day-muted dark:text-night-muted'
                }`}
              >
                Guruhlar ({selectedStudentForProfile.enrollments.filter(e => e.isActive).length})
              </button>
              <button
                onClick={() => setProfileActiveTab('tolovlar')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  profileActiveTab === 'tolovlar' ? 'neu-tab-active text-day-accent dark:text-night-accent' : 'text-day-muted dark:text-night-muted'
                }`}
              >
                To‘lovlar
              </button>
              <button
                onClick={() => setProfileActiveTab('davomat')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  profileActiveTab === 'davomat' ? 'neu-tab-active text-day-accent dark:text-night-accent' : 'text-day-muted dark:text-night-muted'
                }`}
              >
                Davomat
              </button>
            </div>

            {/* Tab 1: Umumiy */}
            {profileActiveTab === 'umumiy' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl neu-surface">
                    <span className="text-xs text-day-muted dark:text-night-muted">F.I.Sh.</span>
                    <p className="font-bold text-base text-day-text dark:text-night-text mt-1">
                      {selectedStudentForProfile.fullName}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl neu-surface">
                    <span className="text-xs text-day-muted dark:text-night-muted">Holati</span>
                    <div className="mt-1">
                      <StatusBadge status={selectedStudentForProfile.status} />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl neu-surface">
                    <span className="text-xs text-day-muted dark:text-night-muted">Telefon</span>
                    <p className="font-bold text-sm text-day-text dark:text-night-text font-mono mt-1">
                      {selectedStudentForProfile.phone}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl neu-surface">
                    <span className="text-xs text-day-muted dark:text-night-muted">Ota-ona telefoni</span>
                    <p className="font-bold text-sm text-day-text dark:text-night-text font-mono mt-1">
                      {selectedStudentForProfile.parentPhone || 'Kiritilmagan'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl neu-surface">
                  <span className="text-xs text-day-muted dark:text-night-muted">Izoh va maqsadlar</span>
                  <p className="text-sm font-medium text-day-text dark:text-night-text mt-1">
                    {selectedStudentForProfile.notes || 'Qo‘shimcha izoh kiritilmagan.'}
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Guruhlar */}
            {profileActiveTab === 'guruhlar' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                    A’zo bo‘lgan guruhlar
                  </h5>
                  <NeumorphicButton
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsEnrollModalOpen(true)}
                  >
                    Guruhga qo‘shish
                  </NeumorphicButton>
                </div>

                {selectedStudentForProfile.enrollments.length === 0 ? (
                  <p className="p-4 rounded-xl neu-surface text-center text-xs text-day-muted dark:text-night-muted">
                    Hozirda hech qanday guruhga a’zo emas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedStudentForProfile.enrollments.map((en) => {
                      const grp = groups.find(g => g.id === en.groupId);
                      return (
                        <div
                          key={en.groupId}
                          className="p-4 rounded-2xl neu-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h6 className="font-bold text-sm text-day-text dark:text-night-text">
                                {en.groupName}
                              </h6>
                              <StatusBadge status={en.isActive ? 'faol' : 'ketgan'} />
                            </div>
                            <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                              O‘qituvchi: {grp?.teacherName || '—'} • Oylik to‘lov: {grp ? formatCurrency(grp.monthlyPrice) : '—'}
                            </p>
                            {en.customDiscount > 0 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                                Chegirma: -{formatCurrency(en.customDiscount)} ({en.discountReason || 'Maxsus chegirma'})
                              </p>
                            )}
                          </div>

                          {en.isActive && (
                            <div className="flex items-center gap-2">
                              <NeumorphicButton
                                variant="secondary"
                                size="sm"
                                icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  setTransferFromGroupId(en.groupId);
                                  setIsTransferModalOpen(true);
                                }}
                              >
                                O‘tkazish
                              </NeumorphicButton>
                              <NeumorphicButton
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  removeStudentFromGroup(selectedStudentForProfile.id, en.groupId);
                                  const updated = students.find(s => s.id === selectedStudentForProfile.id);
                                  if (updated) setSelectedStudentForProfile(updated);
                                }}
                              >
                                Chiqarish
                              </NeumorphicButton>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: To'lovlar */}
            {profileActiveTab === 'tolovlar' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                    To‘lovlar tarixi
                  </h5>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Joriy oy qarzi: {formatCurrency(getStudentDebtForMonth(selectedStudentForProfile.id, currentMonth))}
                  </div>
                </div>

                {payments.filter(p => p.studentId === selectedStudentForProfile.id).length === 0 ? (
                  <p className="p-4 rounded-xl neu-surface text-center text-xs text-day-muted dark:text-night-muted">
                    Bu o‘quvchi bo‘yicha to‘lovlar tarixi mavjud emas.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {payments
                      .filter(p => p.studentId === selectedStudentForProfile.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-day-text dark:text-night-text">
                              {p.receiptNumber} — {p.groupName}
                            </span>
                            <div className="text-day-muted dark:text-night-muted">
                              Davr: {p.billingMonth} • Sana: {formatDate(p.paymentDate)} • {p.paymentMethod}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              +{formatCurrency(p.paidAmount)}
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Davomat */}
            {profileActiveTab === 'davomat' && (
              <div className="space-y-4">
                <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                  Darslardagi ishtirok tarixi
                </h5>
                {attendanceRecords.filter(r => r.records.some(rec => rec.studentId === selectedStudentForProfile.id)).length === 0 ? (
                  <p className="p-4 rounded-xl neu-surface text-center text-xs text-day-muted dark:text-night-muted">
                    Ushbu o‘quvchi bo‘yicha davomat yozuvlari hali kiritilmagan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attendanceRecords
                      .filter(r => r.records.some(rec => rec.studentId === selectedStudentForProfile.id))
                      .map((r) => {
                        const rec = r.records.find(rec => rec.studentId === selectedStudentForProfile.id);
                        const grp = groups.find(g => g.id === r.groupId);
                        return (
                          <div key={r.id} className="p-3 rounded-xl neu-surface flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-day-text dark:text-night-text">
                                {formatDate(r.lessonDate)} — {grp?.name}
                              </span>
                              {r.topic && <p className="text-[11px] text-day-muted dark:text-night-muted">{r.topic}</p>}
                            </div>
                            <StatusBadge status={rec?.status || 'keldi'} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </NeumorphicModal>
      )}

      {/* Enroll Modal */}
      <NeumorphicModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Guruhga biriktirish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <NeumorphicSelect
            label="Guruhni tanlang"
            value={selectedEnrollGroupId}
            onChange={(e) => setSelectedEnrollGroupId(e.target.value)}
            options={[
              { value: '', label: 'Guruhni tanlang...' },
              ...groups
                .filter(g => g.status === 'faol')
                .map(g => ({
                  value: g.id,
                  label: `${g.name} (${formatCurrency(g.monthlyPrice)})`,
                })),
            ]}
          />

          <NeumorphicInput
            label="Maxsus chegirma summasi (so‘m)"
            type="text"
            inputMode="numeric"
            value={customDiscount === 0 ? '' : customDiscount}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCustomDiscount(val ? Number(val) : 0);
            }}
            placeholder="Masalan: 50000"
            helperText={customDiscount > 0 ? `${formatCurrency(customDiscount)} chegirma` : 'Chegirma mavjud bo‘lmasa bo‘sh qoldiring'}
          />

          {customDiscount > 0 && (
            <NeumorphicInput
              label="Chegirma sababi"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              placeholder="Masalan: Ikkinchi farzand"
            />
          )}

          <div className="flex justify-end gap-3 pt-3">
            <NeumorphicButton variant="secondary" onClick={() => setIsEnrollModalOpen(false)}>
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton variant="primary" onClick={handleEnrollSave}>
              Biriktirish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>

      {/* Transfer Modal */}
      <NeumorphicModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Boshqa guruhga o‘tkazish"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-day-muted dark:text-night-muted leading-relaxed">
            O‘quvchi eski guruhdan chiqarilib, yangi guruhga o‘tkaziladi. Oldingi to‘lovlar va davomat tarixi saqlanib qoladi.
          </p>

          <NeumorphicSelect
            label="Yangi guruhni tanlang"
            value={transferToGroupId}
            onChange={(e) => setTransferToGroupId(e.target.value)}
            options={[
              { value: '', label: 'Yangi guruhni tanlang...' },
              ...groups
                .filter(g => g.status === 'faol' && g.id !== transferFromGroupId)
                .map(g => ({
                  value: g.id,
                  label: `${g.name} (${g.courseName})`,
                })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3">
            <NeumorphicButton variant="secondary" onClick={() => setIsTransferModalOpen(false)}>
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton variant="primary" onClick={handleTransferSave}>
              O‘tkazish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>
    </div>
  );
};

