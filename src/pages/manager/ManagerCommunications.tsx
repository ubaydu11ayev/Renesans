import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import {
  ParentCommunication,
  CommunicationType,
  CommunicationPurpose,
} from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  PhoneCall,
  MessageSquare,
  Users,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Send,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

const PURPOSE_LABELS: Record<CommunicationPurpose, { label: string; color: string }> = {
  tolov_eslatmasi: { label: 'To‘lov eslatmasi', color: 'text-rose-500 bg-rose-500/10' },
  davomat_haqida: { label: 'Davomat / Dars qoldirish', color: 'text-amber-500 bg-amber-500/10' },
  imtihon_natijasi: { label: 'Imtihon natijalari', color: 'text-blue-500 bg-blue-500/10' },
  odob_axloq: { label: 'Odob-axloq va tartib', color: 'text-purple-500 bg-purple-500/10' },
  umumiy: { label: 'Umumiy muloqot', color: 'text-emerald-500 bg-emerald-500/10' },
};

const TYPE_ICONS: Record<CommunicationType, { label: string; icon: string }> = {
  qongiroq: { label: 'Qo‘ng‘iroq', icon: '📞' },
  sms: { label: 'SMS', icon: '💬' },
  yuzma_yuz: { label: 'Yuzma-yuz', icon: '🤝' },
  telegram: { label: 'Telegram', icon: '✈️' },
};

export const ManagerCommunications: React.FC = () => {
  const { communications, students, addCommunication, deleteCommunication } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [commToDelete, setCommToDelete] = useState<ParentCommunication | null>(null);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [contactType, setContactType] = useState<CommunicationType>('qongiroq');
  const [purpose, setPurpose] = useState<CommunicationPurpose>('tolov_eslatmasi');
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [resultStatus, setResultStatus] = useState<'ijobiy' | 'kutilmoqda' | 'muammo_hal_qilindi'>('kutilmoqda');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    if (!sId) {
      setStudentName('');
      setParentPhone('');
      return;
    }
    const st = students.find(s => s.id === sId);
    if (st) {
      setStudentName(st.fullName);
      setParentPhone(st.parentPhone || st.phone || '');
    }
  };

  const handleOpenAdd = (presetStudentId?: string, presetPurpose?: CommunicationPurpose) => {
    if (presetStudentId) {
      handleStudentSelect(presetStudentId);
    } else {
      setSelectedStudentId('');
      setStudentName('');
      setParentPhone('');
    }
    setContactType('qongiroq');
    setPurpose(presetPurpose || 'tolov_eslatmasi');
    setDiscussionNotes('');
    setResultStatus('kutilmoqda');
    setNextFollowUpDate('');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentPhone.trim() || !discussionNotes.trim()) return;

    await addCommunication({
      studentId: selectedStudentId || undefined,
      studentName: studentName.trim(),
      parentPhone: parentPhone.trim(),
      contactType,
      purpose,
      discussionNotes: discussionNotes.trim(),
      resultStatus,
      nextFollowUpDate: nextFollowUpDate || undefined,
      managerName: currentUser?.name || 'Menejer',
    });

    setIsAddModalOpen(false);
  };

  const handleDelete = async () => {
    if (!commToDelete) return;
    await deleteCommunication(commToDelete.id);
    setCommToDelete(null);
  };

  // Filtered Communications
  const filteredList = communications.filter(c => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parentPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discussionNotes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPurpose = filterPurpose === 'all' || c.purpose === filterPurpose;
    const matchesType = filterType === 'all' || c.contactType === filterType;
    const matchesStatus = filterStatus === 'all' || c.resultStatus === filterStatus;
    return matchesSearch && matchesPurpose && matchesType && matchesStatus;
  });

  // KPI Metrics
  const totalCalls = communications.length;
  const pendingFollowUps = communications.filter(
    c => c.resultStatus === 'kutilmoqda' || (c.nextFollowUpDate && c.nextFollowUpDate <= todayStr)
  ).length;
  const resolvedCount = communications.filter(c => c.resultStatus === 'muammo_hal_qilindi' || c.resultStatus === 'ijobiy').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-[24px] neu-card bg-gradient-to-r from-day-accent/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-day-accent/10 text-day-accent dark:text-night-accent uppercase tracking-wider">
            Menejer vositalari • Ota-onalar bilan ishlash
          </span>
          <h2 className="text-2xl font-black text-day-text dark:text-night-text mt-1.5 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-day-accent dark:text-night-accent" />
            Ota-onalar bilan aloqa jurnali
          </h2>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted mt-0.5">
            To‘lov eslatmalari, dars qoldirish sabablari, imtihon natijalari va qayta qo‘ng‘iroqlar nazorati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => handleOpenAdd()}
          >
            Yangi muloqot qayd etish
          </NeumorphicButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-day-muted dark:text-night-muted uppercase">Jami muloqotlar</span>
              <div className="text-2xl font-black text-day-text dark:text-night-text mt-1">
                {totalCalls} ta
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-2">
            Barcha qo‘ng‘iroq va xabarlar
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Qayta aloqa kutilmoqda</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {pendingFollowUps} ta
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-2">
            Javob yoki qo‘ng‘iroq kutilayotganlar
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Ijobiy hal bo‘lgan</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {resolvedCount} ta
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl neu-surface flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-2">
            Kelishilgan va to‘lov qilingan
          </p>
        </NeumorphicCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NeumorphicInput
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="O‘quvchi ismi, telefon yoki izoh..."
          icon={<Search className="w-4 h-4 text-day-muted dark:text-night-muted" />}
        />

        <NeumorphicSelect
          value={filterPurpose}
          onChange={e => setFilterPurpose(e.target.value)}
          options={[
            { value: 'all', label: 'Barcha mavzular' },
            { value: 'tolov_eslatmasi', label: 'To‘lov eslatmasi' },
            { value: 'davomat_haqida', label: 'Davomat / Sabab' },
            { value: 'imtihon_natijasi', label: 'Imtihon natijalari' },
            { value: 'odob_axloq', label: 'Odob-axloq va tartib' },
            { value: 'umumiy', label: 'Umumiy muloqot' },
          ]}
        />

        <NeumorphicSelect
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          options={[
            { value: 'all', label: 'Barcha aloqa turlari' },
            { value: 'qongiroq', label: '📞 Telefon qo‘ng‘irog‘i' },
            { value: 'sms', label: '💬 SMS xabarnoma' },
            { value: 'yuzma_yuz', label: '🤝 Yuzma-yuz (ofisda)' },
            { value: 'telegram', label: '✈️ Telegram' },
          ]}
        />

        <NeumorphicSelect
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'Barcha holatlar' },
            { value: 'kutilmoqda', label: 'Kutilmoqda / Qayta aloqa' },
            { value: 'ijobiy', label: 'Kelishildi / Ijobiy' },
            { value: 'muammo_hal_qilindi', label: 'Muammo hal bo‘ldi' },
          ]}
        />
      </div>

      {/* Communications Journal List */}
      <NeumorphicCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 text-day-muted dark:text-night-muted uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3.5 px-4">Sana va vaqt</th>
                <th className="py-3.5 px-4">O‘quvchi</th>
                <th className="py-3.5 px-4">Ota-ona telefoni</th>
                <th className="py-3.5 px-4">Mavzu</th>
                <th className="py-3.5 px-4">Muloqot tafsilotlari</th>
                <th className="py-3.5 px-4">Holat / Natija</th>
                <th className="py-3.5 px-4">Qayta aloqa</th>
                <th className="py-3.5 px-4">Menejer</th>
                <th className="py-3.5 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium text-day-text dark:text-night-text">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-day-muted dark:text-night-muted">
                    Hozircha hech qanday muloqot qaydnomasi yo‘q.
                  </td>
                </tr>
              ) : (
                filteredList.map(comm => {
                  const purposeInfo = PURPOSE_LABELS[comm.purpose] || PURPOSE_LABELS.umumiy;
                  const typeInfo = TYPE_ICONS[comm.contactType] || TYPE_ICONS.qongiroq;

                  return (
                    <tr key={comm.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap text-day-muted dark:text-night-muted">
                        {formatDateTime(comm.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                        {comm.studentName}
                      </td>
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${comm.parentPhone}`}
                            className="font-bold text-day-accent hover:underline flex items-center gap-1"
                            title="Qo‘ng‘iroq qilish"
                          >
                            <span>{typeInfo.icon}</span>
                            <span>{comm.parentPhone}</span>
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${purposeInfo.color}`}>
                          {purposeInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="line-clamp-2 text-day-text dark:text-night-text">
                          {comm.discussionNotes}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {comm.resultStatus === 'ijobiy' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Kelishildi
                          </span>
                        ) : comm.resultStatus === 'muammo_hal_qilindi' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Hal bo‘ldi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        {comm.nextFollowUpDate ? (
                          <span className={`px-2 py-0.5 rounded-lg ${comm.nextFollowUpDate <= todayStr ? 'bg-rose-500/10 text-rose-600 font-bold' : 'text-day-muted'}`}>
                            {formatDate(comm.nextFollowUpDate)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-day-muted dark:text-night-muted">
                        {comm.managerName}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setCommToDelete(comm)}
                          className="p-1.5 rounded-xl neu-surface hover:text-rose-500 transition-colors"
                          title="Qaydnomani o‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>

      {/* ADD COMMUNICATION MODAL */}
      <NeumorphicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ota-ona bilan muloqotni qayd etish"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <NeumorphicSelect
            label="O‘quvchini tanlang (yoki quyida yangi ism kiriting)"
            value={selectedStudentId}
            onChange={e => handleStudentSelect(e.target.value)}
            options={[
              { value: '', label: 'Ro‘yxatdan tanlash (ixtiyoriy)...' },
              ...students.map(s => ({
                value: s.id,
                label: `${s.fullName} (${s.parentPhone || s.phone})`,
              })),
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="O‘quvchi F.I.Sh."
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Masalan: Toirov Sardor"
              required
            />
            <NeumorphicInput
              label="Ota-ona telefon raqami"
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="Muloqot turi"
              value={contactType}
              onChange={e => setContactType(e.target.value as CommunicationType)}
              options={[
                { value: 'qongiroq', label: '📞 Telefon qo‘ng‘irog‘i' },
                { value: 'sms', label: '💬 SMS xabarnoma' },
                { value: 'yuzma_yuz', label: '🤝 Markazda yuzma-yuz uchrashuv' },
                { value: 'telegram', label: '✈️ Telegram orqali yozishma' },
              ]}
              required
            />
            <NeumorphicSelect
              label="Muloqot sababi / Mavzusi"
              value={purpose}
              onChange={e => setPurpose(e.target.value as CommunicationPurpose)}
              options={[
                { value: 'tolov_eslatmasi', label: 'To‘lov eslatmasi (qarzdorlik)' },
                { value: 'davomat_haqida', label: 'Davomat / Dars qoldirish sababi' },
                { value: 'imtihon_natijasi', label: 'Imtihon natijalari haqida' },
                { value: 'odob_axloq', label: 'Odob-axloq va tartib' },
                { value: 'umumiy', label: 'Umumiy fikr-mulohaza' },
              ]}
              required
            />
          </div>

          <NeumorphicInput
            label="Suhbat tafsilotlari va kelishuv natijasi"
            value={discussionNotes}
            onChange={e => setDiscussionNotes(e.target.value)}
            placeholder="Otasiga qo‘ng‘iroq qilindi, oylik to‘lovni 5-sanagacha to‘lashga va’da berdi..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="Natija holati"
              value={resultStatus}
              onChange={e => setResultStatus(e.target.value as any)}
              options={[
                { value: 'kutilmoqda', label: 'Kutilmoqda / Qayta aloqa kerak' },
                { value: 'ijobiy', label: 'Kelishildi / Ijobiy' },
                { value: 'muammo_hal_qilindi', label: 'Muammo to‘liq hal qilindi' },
              ]}
              required
            />
            <NeumorphicInput
              type="date"
              label="Keyingi eslatma / Qayta qo‘ng‘iroq sanasi"
              value={nextFollowUpDate}
              onChange={e => setNextFollowUpDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              Muloqotni saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>

      {/* DELETE CONFIRMATION MODAL */}
      <NeumorphicModal
        isOpen={!!commToDelete}
        onClose={() => setCommToDelete(null)}
        title="Muloqot qaydnomasini o‘chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-day-text dark:text-night-text">
            Ushbu qaydnomani o‘chirmoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              variant="secondary"
              onClick={() => setCommToDelete(null)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton
              variant="danger"
              onClick={handleDelete}
            >
              O‘chirish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>
    </div>
  );
};
