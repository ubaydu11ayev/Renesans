import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { Lead, LeadSource, LeadStage } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  UserPlus,
  Phone,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Share2,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

const STAGES: { id: LeadStage; label: string; color: string; badgeBg: string }[] = [
  { id: 'yangi', label: 'Yangi arizalar', color: 'text-blue-500', badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'aloqada', label: 'Aloqada / Maslahat', color: 'text-amber-500', badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'sinov_darsi', label: 'Sinov darsi', color: 'text-purple-500', badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'qabul_qilindi', label: 'Qabul qilindi', color: 'text-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'rad_etildi', label: 'Rad etildi', color: 'text-rose-500', badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
];

const SOURCE_LABELS: Record<LeadSource, { label: string; icon: string }> = {
  instagram: { label: 'Instagram', icon: '📸' },
  telegram: { label: 'Telegram', icon: '✈️' },
  banner: { label: 'Tashqi banner', icon: '🏙️' },
  tavsiya: { label: 'Tavsiya (og‘zaki)', icon: '🤝' },
  boshqa: { label: 'Boshqa manba', icon: '🌐' },
};

export const ManagerLeads: React.FC = () => {
  const { leads, courses, groups, addLead, updateLead, deleteLead, convertLeadToStudent } = useData();
  const { currentUser } = useAuth();

  // Filters & Views
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Form State for Add / Edit
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [targetCourse, setTargetCourse] = useState('');
  const [source, setSource] = useState<LeadSource>('instagram');
  const [stage, setStage] = useState<LeadStage>('yangi');
  const [trialLessonDate, setTrialLessonDate] = useState('');
  const [notes, setNotes] = useState('');

  // Conversion Form State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [customDiscountStr, setCustomDiscountStr] = useState('');
  const [discountReason, setDiscountReason] = useState('');

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setParentPhone('');
    setTargetCourse(courses[0]?.name || 'Ingliz tili');
    setSource('instagram');
    setStage('yangi');
    setTrialLessonDate('');
    setNotes('');
    setEditingLead(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFullName(lead.fullName);
    setPhone(lead.phone);
    setParentPhone(lead.parentPhone || '');
    setTargetCourse(lead.targetCourse);
    setSource(lead.source);
    setStage(lead.stage);
    setTrialLessonDate(lead.trialLessonDate || '');
    setNotes(lead.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !parentPhone.trim() || !targetCourse) return;

    if (editingLead) {
      await updateLead(editingLead.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim() || undefined,
        targetCourse,
        source,
        stage,
        trialLessonDate: trialLessonDate || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim() || undefined,
        targetCourse,
        source,
        stage,
        trialLessonDate: trialLessonDate || undefined,
        notes: notes.trim() || undefined,
        assignedManager: currentUser?.name || 'Menejer',
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    await updateLead(leadId, { stage: newStage });
  };

  const handleOpenConvert = (lead: Lead) => {
    setConvertingLead(lead);
    // Find groups corresponding to lead's target course
    const matchingGroups = groups.filter(g => g.courseName.toLowerCase() === lead.targetCourse.toLowerCase());
    setSelectedGroupId(matchingGroups[0]?.id || groups[0]?.id || '');
    setCustomDiscountStr('');
    setDiscountReason('');
  };

  const handleConfirmConvert = async () => {
    if (!convertingLead) return;
    const discountNum = customDiscountStr ? parseInt(customDiscountStr, 10) : 0;
    await convertLeadToStudent(
      convertingLead.id,
      selectedGroupId || undefined,
      discountNum > 0 ? discountNum : undefined,
      discountReason.trim() || undefined
    );
    setConvertingLead(null);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    await deleteLead(leadToDelete.id);
    setLeadToDelete(null);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = selectedSource === 'all' || l.source === selectedSource;
    const matchesCourse = selectedCourse === 'all' || l.targetCourse === selectedCourse;
    return matchesSearch && matchesSource && matchesCourse;
  });

  // Source distribution metrics
  const sourceStats = (['instagram', 'telegram', 'banner', 'tavsiya', 'boshqa'] as LeadSource[]).map(s => ({
    source: s,
    count: leads.filter(l => l.source === s).length,
    label: SOURCE_LABELS[s].label,
    icon: SOURCE_LABELS[s].icon,
  }));

  const totalLeadsCount = leads.length;
  const enrolledCount = leads.filter(l => l.stage === 'qabul_qilindi').length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((enrolledCount / totalLeadsCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="p-6 rounded-[24px] neu-card bg-gradient-to-r from-day-accent/5 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-day-accent/10 text-day-accent dark:text-night-accent uppercase tracking-wider">
            Menejer vositalari • CRM & Qabul
          </span>
          <h2 className="text-2xl font-black text-day-text dark:text-night-text mt-1.5 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-day-accent dark:text-night-accent" />
            Lidlar va Qabul Voronkasi
          </h2>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted mt-0.5">
            Markazni rivojlantirish, yangi arizalarni qabul qilish va ularni guruhlarga yozish
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl neu-surface p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-day-accent text-white shadow-sm'
                  : 'text-day-muted dark:text-night-muted hover:text-day-text dark:hover:text-night-text'
              }`}
            >
              Voronka (Kanban)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-day-accent text-white shadow-sm'
                  : 'text-day-muted dark:text-night-muted hover:text-day-text dark:hover:text-night-text'
              }`}
            >
              Jadval ro‘yxati
            </button>
          </div>

          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Yangi lid qo‘shish
          </NeumorphicButton>
        </div>
      </div>

      {/* KPI Cards: Marketing & Conversion */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <NeumorphicCard className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
            Jami arizalar
          </span>
          <div className="text-2xl font-black text-day-text dark:text-night-text mt-1">
            {totalLeadsCount} ta
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Barcha kelib tushgan qiziqishlar
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Sinov darsidagi
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {leads.filter(l => l.stage === 'sinov_darsi').length} ta
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Darsga qatnashishi kutilmoqda
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Qabul qilinganlar
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {enrolledCount} ta
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Guruhlarga muvaffaqiyatli yozildi
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-4 sm:p-5">
          <span className="text-[11px] font-bold text-day-accent dark:text-night-accent uppercase tracking-wider">
            Konversiya darajasi
          </span>
          <div className="text-2xl font-black text-day-accent dark:text-night-accent mt-1">
            {conversionRate}%
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Arizalarning o‘quvchiga aylanishi
          </p>
        </NeumorphicCard>
      </div>

      {/* Marketing Source Badges */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl neu-surface">
        <span className="text-xs font-bold text-day-muted dark:text-night-muted px-2 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" /> Reklama manbalari:
        </span>
        {sourceStats.map(s => (
          <button
            key={s.source}
            onClick={() => setSelectedSource(selectedSource === s.source ? 'all' : s.source)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedSource === s.source
                ? 'bg-day-accent text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/5 text-day-text dark:text-night-text hover:bg-black/10'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            <span className="opacity-80">({s.count})</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80">
          <NeumorphicInput
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Lid ismi, telefon yoki izoh..."
            icon={<Search className="w-4 h-4 text-day-muted dark:text-night-muted" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <NeumorphicSelect
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            options={[
              { value: 'all', label: 'Barcha kurslar' },
              ...courses.map(c => ({ value: c.name, label: c.name })),
            ]}
          />
        </div>
      </div>

      {/* MAIN VIEW: KANBAN VORONKA OR TABLE */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map(col => {
            const stageLeads = filteredLeads.filter(l => l.stage === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col min-w-[260px] p-4 rounded-3xl neu-surface border border-black/5 dark:border-white/5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'qabul_qilindi' ? 'bg-emerald-500' : col.id === 'rad_etildi' ? 'bg-rose-500' : 'bg-day-accent'}`} />
                    <h4 className="font-extrabold text-sm text-day-text dark:text-night-text">
                      {col.label}
                    </h4>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-day-muted dark:text-night-muted">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-day-muted dark:text-night-muted border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                      Lidlar yo‘q
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="p-4 rounded-2xl neu-card bg-day-bg dark:bg-night-card hover:-translate-y-0.5 transition-all space-y-3"
                      >
                        {/* Top: Name & Source */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-black text-sm text-day-text dark:text-night-text leading-tight">
                              {lead.fullName}
                            </h5>
                            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-day-accent/10 text-day-accent dark:text-night-accent">
                              {lead.targetCourse}
                            </span>
                          </div>
                          <span
                            className="text-xs"
                            title={SOURCE_LABELS[lead.source]?.label}
                          >
                            {SOURCE_LABELS[lead.source]?.icon}
                          </span>
                        </div>

                        {/* Contacts */}
                        <div className="space-y-1 text-xs">
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1.5 font-mono text-day-muted dark:text-night-muted hover:text-day-accent transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-day-accent" />
                            {lead.phone}
                          </a>
                          {lead.parentPhone && (
                            <div className="text-[11px] text-day-muted dark:text-night-muted">
                              Ota-onasi: <span className="font-mono">{lead.parentPhone}</span>
                            </div>
                          )}
                        </div>

                        {/* Trial Lesson Date */}
                        {lead.trialLessonDate && (
                          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Sinov darsi: {formatDate(lead.trialLessonDate)}
                          </div>
                        )}

                        {/* Notes */}
                        {lead.notes && (
                          <p className="text-[11px] text-day-muted dark:text-night-muted line-clamp-2 italic">
                            “{lead.notes}”
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1">
                          {lead.stage !== 'qabul_qilindi' && (
                            <button
                              onClick={() => handleOpenConvert(lead)}
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              title="Guruhga yozish va o‘quvchiga aylantirish"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Qabul qilish
                            </button>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            {/* Fast Stage Transition */}
                            <select
                              value={lead.stage}
                              onChange={e => handleStageChange(lead.id, e.target.value as LeadStage)}
                              className="text-[10px] font-bold px-1.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-day-text dark:text-night-text border-none focus:outline-none cursor-pointer"
                              title="Bosqichni o‘zgartirish"
                            >
                              {STAGES.map(s => (
                                <option key={s.id} value={s.id} className="dark:bg-[#1C2534]">
                                  → {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => openEditModal(lead)}
                              className="p-1 rounded-lg text-day-muted hover:text-day-accent transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1 rounded-lg text-day-muted hover:text-rose-500 transition-colors"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 text-day-muted dark:text-night-muted uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">F.I.Sh.</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Kurs</th>
                  <th className="py-3 px-4">Manba</th>
                  <th className="py-3 px-4">Bosqich</th>
                  <th className="py-3 px-4">Sinov darsi</th>
                  <th className="py-3 px-4">Izoh</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium text-day-text dark:text-night-text">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-day-muted dark:text-night-muted">
                      Hech qanday lid topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const stageConfig = STAGES.find(s => s.id === lead.stage);
                    return (
                      <tr key={lead.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold">{lead.fullName}</td>
                        <td className="py-3.5 px-4 font-mono">
                          <a href={`tel:${lead.phone}`} className="hover:text-day-accent">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4">{lead.targetCourse}</td>
                        <td className="py-3.5 px-4">
                          <span className="flex items-center gap-1">
                            {SOURCE_LABELS[lead.source]?.icon} {SOURCE_LABELS[lead.source]?.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${stageConfig?.badgeBg}`}>
                            {stageConfig?.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {lead.trialLessonDate ? formatDate(lead.trialLessonDate) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-day-muted dark:text-night-muted max-w-xs truncate">
                          {lead.notes || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lead.stage !== 'qabul_qilindi' && (
                              <button
                                onClick={() => handleOpenConvert(lead)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" /> Qabul
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(lead)}
                              className="p-1.5 rounded-xl neu-surface hover:text-day-accent transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 rounded-xl neu-surface hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}

      {/* CREATE / EDIT LEAD MODAL */}
      <NeumorphicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingLead ? 'Lid ma’lumotlarini tahrirlash' : 'Yangi lid (qiziqqan mijoz) qo‘shish'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmitLead} className="space-y-4">
          <NeumorphicInput
            label="Mijoz (O‘quvchi) F.I.Sh."
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Masalan: Karimova Zuxra"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicInput
              label="Telefon raqami"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />
            <NeumorphicInput
              label="Ota-ona telefon raqami *"
              value={parentPhone}
              onChange={e => setParentPhone(e.target.value)}
              placeholder="+998 91 987 65 43"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="Qiziqayotgan kursi"
              value={targetCourse}
              onChange={e => setTargetCourse(e.target.value)}
              options={courses.map(c => ({ value: c.name, label: c.name }))}
              required
            />
            <NeumorphicSelect
              label="Qayerdan bildi? (Manba)"
              value={source}
              onChange={e => setSource(e.target.value as LeadSource)}
              options={[
                { value: 'instagram', label: '📸 Instagram' },
                { value: 'telegram', label: '✈️ Telegram' },
                { value: 'banner', label: '🏙️ Tashqi banner' },
                { value: 'tavsiya', label: '🤝 Tavsiya (og‘zaki)' },
                { value: 'boshqa', label: '🌐 Boshqa manba' },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeumorphicSelect
              label="Bosqich (Status)"
              value={stage}
              onChange={e => setStage(e.target.value as LeadStage)}
              options={STAGES.map(s => ({ value: s.id, label: s.label }))}
              required
            />
            <NeumorphicInput
              type="date"
              label="Sinov darsi sanasi"
              value={trialLessonDate}
              onChange={e => setTrialLessonDate(e.target.value)}
            />
          </div>

          <NeumorphicInput
            label="Menejer izohi va qiziqish darajasi"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Mijoz ingliz tilini noldan o‘rganmoqchi, kechki payt qulay..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton type="submit" variant="primary">
              {editingLead ? 'Saqlash' : 'Lidni kiritish'}
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicModal>

      {/* 1-CLICK CONVERT LEAD TO STUDENT MODAL */}
      <NeumorphicModal
        isOpen={!!convertingLead}
        onClose={() => setConvertingLead(null)}
        title="Lidni rasmiy o‘quvchilar safiga qabul qilish"
        maxWidth="lg"
      >
        {convertingLead && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl neu-surface space-y-1">
              <div className="text-xs text-day-muted dark:text-night-muted">Qabul qilinayotgan nomzod:</div>
              <div className="font-black text-base text-day-text dark:text-night-text">
                {convertingLead.fullName}
              </div>
              <div className="text-xs font-mono text-day-accent dark:text-night-accent">
                {convertingLead.phone} • {convertingLead.targetCourse}
              </div>
            </div>

            <NeumorphicSelect
              label="Biriktiriladigan guruh"
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              options={groups
                .filter(g => g.status === 'faol')
                .map(g => ({
                  value: g.id,
                  label: `${g.name} (${g.courseName}) — ${formatCurrency(g.monthlyPrice)} / oy`,
                }))}
              helperText="O‘quvchi ushbu guruhga faol statusda qo‘shiladi"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeumorphicInput
                label="Maxsus chegirma (so‘m, ixtiyoriy)"
                type="text"
                inputMode="numeric"
                value={customDiscountStr}
                onChange={e => setCustomDiscountStr(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                helperText={customDiscountStr ? formatCurrency(Number(customDiscountStr)) : 'Chegirmasiz'}
              />
              <NeumorphicInput
                label="Chegirma sababi"
                value={discountReason}
                onChange={e => setDiscountReason(e.target.value)}
                placeholder="Aksiya, 2-farzand..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <NeumorphicButton
                variant="secondary"
                onClick={() => setConvertingLead(null)}
              >
                Bekor qilish
              </NeumorphicButton>
              <NeumorphicButton
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleConfirmConvert}
              >
                Guruhga biriktirish va Qabul qilish
              </NeumorphicButton>
            </div>
          </div>
        )}
      </NeumorphicModal>

      {/* DELETE CONFIRMATION MODAL */}
      <NeumorphicModal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        title="Lidni o‘chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-day-text dark:text-night-text">
            Haqiqatan ham <strong>{leadToDelete?.fullName}</strong> nomli lidni o‘chirmoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <NeumorphicButton
              variant="secondary"
              onClick={() => setLeadToDelete(null)}
            >
              Bekor qilish
            </NeumorphicButton>
            <NeumorphicButton
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              O‘chirish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicModal>
    </div>
  );
};
