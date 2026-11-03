import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Payment, PaymentMethod } from '../../types';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicModal } from '../../components/common/NeumorphicModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import {
  Plus,
  Search,
  Download,
  XCircle,
  Receipt,
} from 'lucide-react';

interface AdminPaymentsProps {
  isAddPaymentOpenInitial?: boolean;
  onCloseAddPaymentInitial?: () => void;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({
  isAddPaymentOpenInitial = false,
  onCloseAddPaymentInitial,
}) => {
  const {
    payments,
    students,
    groups,
    recordPayment,
    voidPayment,
  } = useData();

  const { currentUser } = useAuth();

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(isAddPaymentOpenInitial);

  // Active Receipt Modal
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);

  // Void confirmation dialog
  const [paymentToVoid, setPaymentToVoid] = useState<Payment | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState<string | null>(null);

  // Form State - using string for amount so "0" is not stuck!
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [billingMonth, setBillingMonth] = useState(currentMonth);
  const [paidAmountStr, setPaidAmountStr] = useState<string>(''); // FIX: string allows deleting to empty!
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('karta');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Selected student derived info
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const studentEnrollment = selectedStudent?.enrollments.find(e => e.groupId === selectedGroupId);

  const billedAmount = selectedGroup
    ? Math.max(0, selectedGroup.monthlyPrice - (studentEnrollment?.customDiscount || 0))
    : 0;

  // Previous payments for this student, group & month
  const previousPaid = payments
    .filter(
      p =>
        p.studentId === selectedStudentId &&
        p.groupId === selectedGroupId &&
        p.billingMonth === billingMonth &&
        p.status === 'muvaffaqiyatli'
    )
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const remainingBalance = Math.max(0, billedAmount - previousPaid);

  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    const st = students.find(s => s.id === sId);
    const activeEnr = st?.enrollments.find(e => e.isActive);
    if (activeEnr) {
      setSelectedGroupId(activeEnr.groupId);
      const grp = groups.find(g => g.id === activeEnr.groupId);
      const discounted = grp ? Math.max(0, grp.monthlyPrice - (activeEnr.customDiscount || 0)) : 0;
      setPaidAmountStr(discounted > 0 ? String(discounted) : '');
    } else {
      setSelectedGroupId('');
      setPaidAmountStr('');
    }
  };

  const handleOpenAddModal = () => {
    setSelectedStudentId('');
    setSelectedGroupId('');
    setBillingMonth(currentMonth);
    setPaidAmountStr('');
    setPaymentMethod('karta');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowConfirmStep(false);
    setFormError(null);
    setIsAddPaymentModalOpen(true);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountNum = Number(paidAmountStr.replace(/\s+/g, ''));

    if (!selectedStudentId) {
      setFormError('Iltimos, o‘quvchini tanlang.');
      return;
    }
    if (!selectedGroupId) {
      setFormError('Iltimos, guruhni tanlang.');
      return;
    }
    if (!amountNum || amountNum <= 0) {
      setFormError('To‘lov summasi 0 dan katta bo‘lishi lozim.');
      return;
    }

    setShowConfirmStep(true);
  };

  const handleFinalSubmit = async () => {
    const amountNum = Number(paidAmountStr.replace(/\s+/g, ''));
    if (isSubmitting || !selectedStudent || !selectedGroup || !amountNum) return;

    setIsSubmitting(true);
    const newPayment = await recordPayment({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      courseName: selectedGroup.courseName,
      billingMonth,
      billedAmount,
      paidAmount: amountNum,
      discountAmount: studentEnrollment?.customDiscount || 0,
      discountReason: studentEnrollment?.discountReason,
      paymentMethod,
      paymentDate,
      receivedByUserId: currentUser?.id || 'admin',
      receivedByName: currentUser?.name || 'Administrator',
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    setIsAddPaymentModalOpen(false);
    if (onCloseAddPaymentInitial) onCloseAddPaymentInitial();

    // Show receipt immediately
    setActiveReceiptPayment(newPayment);
  };

  const handleConfirmVoid = async () => {
    if (!paymentToVoid) return;
    if (!voidReason.trim()) {
      setVoidError('Bekor qilish sababini kiritish shart!');
      return;
    }

    const res = await voidPayment(paymentToVoid.id, voidReason.trim());
    if (res.success) {
      setPaymentToVoid(null);
      setVoidReason('');
      setVoidError(null);
    } else {
      setVoidError(res.error || 'Bekor qilishda xatolik yuz berdi');
    }
  };

  // Filtered payments list
  const filteredPayments = payments.filter(p => {
    const matchesQuery =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.groupName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = selectedMethodFilter ? p.paymentMethod === selectedMethodFilter : true;
    const matchesStatus = selectedStatusFilter ? p.status === selectedStatusFilter : true;

    return matchesQuery && matchesMethod && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Chek №', 'O‘quvchi', 'Guruh', 'Kurs', 'Oy', 'Hisoblangan', 'To‘langan', 'Usul', 'Sana', 'Holat'];
    const rows = filteredPayments.map(p => [
      p.receiptNumber,
      p.studentName,
      p.groupName,
      p.courseName,
      p.billingMonth,
      p.billedAmount,
      p.paidAmount,
      p.paymentMethod,
      p.paymentDate,
      p.status,
    ]);
    exportToCSV(`Renessans_Tolovlar_${currentMonth}`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Moliya va To‘lovlar jurnali ({payments.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Kassaga qabul qilingan to‘lovlar, kvitansiyalar va qarzdorliklar
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <NeumorphicButton
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Eksport
          </NeumorphicButton>
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            To‘lov qabul qilish
          </NeumorphicButton>
        </div>
      </div>

      {/* Filters Card */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeumorphicInput
            placeholder="O‘quvchi, guruh yoki chek raqami..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <NeumorphicSelect
            value={selectedMethodFilter}
            onChange={(e) => setSelectedMethodFilter(e.target.value)}
            options={[
              { value: '', label: 'To‘lov usuli: Barchasi' },
              { value: 'karta', label: 'Plastik karta' },
              { value: 'naqd', label: 'Naqd pul' },
              { value: 'bank_otkazmasi', label: 'Bank o‘tkazmasi' },
            ]}
          />

          <NeumorphicSelect
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Holat: Barchasi' },
              { value: 'muvaffaqiyatli', label: 'Tasdiqlangan' },
              { value: 'bekor_qilingan', label: 'Bekor qilingan' },
            ]}
          />
        </div>
      </NeumorphicCard>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="To‘lovlar topilmadi"
          description={
            payments.length === 0
              ? 'Hali tizimda to‘lovlar amalga oshirilmagan. "To‘lov qabul qilish" tugmasi orqali boshlang.'
              : 'Qidiruv bo‘yicha to‘lovlar mavjud emas.'
          }
          actionText={payments.length === 0 ? 'To‘lov qabul qilish' : undefined}
          onAction={payments.length === 0 ? handleOpenAddModal : undefined}
        />
      ) : (
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">Chek №</th>
                  <th className="py-4 px-4">O‘quvchi va Guruh</th>
                  <th className="py-4 px-4">Oy davri</th>
                  <th className="py-4 px-4">To‘langan summa</th>
                  <th className="py-4 px-4">To‘lov usuli</th>
                  <th className="py-4 px-4">Sana</th>
                  <th className="py-4 px-4">Holat</th>
                  <th className="py-4 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-day-accent dark:text-night-accent">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-day-text dark:text-night-text">
                        {p.studentName}
                      </div>
                      <div className="text-xs text-day-muted dark:text-night-muted">
                        {p.courseName} • {p.groupName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-day-muted dark:text-night-muted">
                      {p.billingMonth}
                    </td>

                    <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.paidAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-xs capitalize text-day-text dark:text-night-text">
                      {p.paymentMethod === 'karta' ? 'Plastik karta' : p.paymentMethod === 'naqd' ? 'Naqd pul' : 'Bank o‘tkazmasi'}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-day-muted dark:text-night-muted">
                      {formatDate(p.paymentDate)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setActiveReceiptPayment(p)}
                        className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                        title="Chekni ochish / Chop etish"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      {p.status === 'muvaffaqiyatli' && (
                        <button
                          onClick={() => {
                            setPaymentToVoid(p);
                            setVoidReason('');
                            setVoidError(null);
                          }}
                          className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-rose-500"
                          title="To‘lovni bekor qilish"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}

      {/* Modal: To'lov qabul qilish (FIXED: 0 ochmayotgan xato to'liq bartaraf qilindi) */}
      <NeumorphicModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => {
          setIsAddPaymentModalOpen(false);
          setShowConfirmStep(false);
          if (onCloseAddPaymentInitial) onCloseAddPaymentInitial();
        }}
        title="To‘lov qabul qilish"
        maxWidth="md"
      >
        {!showConfirmStep ? (
          <form onSubmit={handleNextStep} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <NeumorphicSelect
              label="O‘quvchini tanlang"
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              options={[
                { value: '', label: 'O‘quvchini tanlang...' },
                ...students
                  .filter(s => s.status === 'faol')
                  .map(s => ({
                    value: s.id,
                    label: `${s.fullName} (${s.phone})`,
                  })),
              ]}
              required
            />

            {selectedStudent && (
              <NeumorphicSelect
                label="Guruhni tanlang"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                options={[
                  { value: '', label: 'Guruhni tanlang...' },
                  ...selectedStudent.enrollments
                    .filter(en => en.isActive)
                    .map(en => ({
                      value: en.groupId,
                      label: en.groupName,
                    })),
                ]}
                required
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <NeumorphicInput
                label="To‘lov oyi (YYYY-MM)"
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
              />

              <NeumorphicInput
                label="To‘lov sanasi"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            {/* Live Financial Balance preview */}
            {selectedStudent && selectedGroup && (
              <div className="p-4 rounded-2xl neu-surface space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-day-muted dark:text-night-muted">Guruh oylik narxi:</span>
                  <span className="font-semibold text-day-text dark:text-night-text">{formatCurrency(selectedGroup.monthlyPrice)}</span>
                </div>
                {studentEnrollment && studentEnrollment.customDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Chegirma:</span>
                    <span>- {formatCurrency(studentEnrollment.customDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-day-muted dark:text-night-muted">Ushbu oy uchun avval to‘langan:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(previousPaid)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black/5 dark:border-white/5 font-bold">
                  <span className="text-day-text dark:text-night-text">Qoldiq qarzdorlik:</span>
                  <span className="text-rose-600 dark:text-rose-400">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* FIX FOR IMAGE 3: Clean string input without stuck 0! */}
              <NeumorphicInput
                label="To‘lov summasi (so‘m)"
                type="text"
                inputMode="numeric"
                value={paidAmountStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setPaidAmountStr(cleaned);
                }}
                placeholder="Summani kiriting..."
                helperText={paidAmountStr ? `${formatCurrency(Number(paidAmountStr))}` : 'Masalan: 320000'}
                required
              />

              <NeumorphicSelect
                label="To‘lov usuli"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: 'karta', label: 'Plastik karta' },
                  { value: 'naqd', label: 'Naqd pul' },
                  { value: 'bank_otkazmasi', label: 'Bank o‘tkazmasi' },
                ]}
              />
            </div>

            <NeumorphicInput
              label="Qo‘shimcha izoh (ixtiyoriy)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Humo kartadan to‘landi"
            />

            <div className="flex items-center justify-end gap-3 pt-3">
              <NeumorphicButton
                type="button"
                variant="secondary"
                onClick={() => setIsAddPaymentModalOpen(false)}
              >
                Bekor qilish
              </NeumorphicButton>
              <NeumorphicButton type="submit" variant="primary">
                Davom etish (Tekshirish)
              </NeumorphicButton>
            </div>
          </form>
        ) : (
          /* Confirmation Step */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl neu-surface space-y-2 text-sm">
              <h5 className="font-bold text-day-text dark:text-night-text mb-3">
                To‘lov ma’lumotlarini tasdiqlang:
              </h5>
              <div className="flex justify-between text-xs">
                <span className="text-day-muted dark:text-night-muted">O‘quvchi:</span>
                <span className="font-bold text-day-text dark:text-night-text">{selectedStudent?.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-day-muted dark:text-night-muted">Guruh:</span>
                <span className="font-medium text-day-text dark:text-night-text">{selectedGroup?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-day-muted dark:text-night-muted">To‘lov davri:</span>
                <span className="font-medium text-day-text dark:text-night-text">{billingMonth}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-day-muted dark:text-night-muted">To‘lov usuli:</span>
                <span className="font-medium capitalize text-day-text dark:text-night-text">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/5 dark:border-white/5 font-extrabold text-base">
                <span className="text-day-text dark:text-night-text">Qabul qilinadigan summa:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(Number(paidAmountStr))}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <NeumorphicButton
                type="button"
                variant="secondary"
                onClick={() => setShowConfirmStep(false)}
                disabled={isSubmitting}
              >
                Orqaga
              </NeumorphicButton>
              <NeumorphicButton
                type="button"
                variant="primary"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
              >
                Tasdiqlash va Chek chiqarish
              </NeumorphicButton>
            </div>
          </div>
        )}
      </NeumorphicModal>

      {/* Payment Void Confirmation Dialog */}
      {paymentToVoid && (
        <NeumorphicModal
          isOpen={Boolean(paymentToVoid)}
          onClose={() => setPaymentToVoid(null)}
          title="To‘lovni bekor qilish"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-semibold">
              Diqqat! Ushbu to‘lovni bekor qilish moliyaviy hisobotlar va o‘quvchi qarzdorligiga ta’sir ko‘rsatadi. Bekor qilish sababi amallar tarixida (Audit log) saqlanadi.
            </p>

            <div className="p-3 rounded-xl neu-surface text-xs space-y-1">
              <div><strong>Chek:</strong> {paymentToVoid.receiptNumber}</div>
              <div><strong>O‘quvchi:</strong> {paymentToVoid.studentName}</div>
              <div><strong>Summa:</strong> {formatCurrency(paymentToVoid.paidAmount)}</div>
            </div>

            <NeumorphicInput
              label="Bekor qilish sababi"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Masalan: Noto‘g‘ri kiritilgan summa"
              error={voidError || undefined}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <NeumorphicButton variant="secondary" onClick={() => setPaymentToVoid(null)}>
                Ortga qaytish
              </NeumorphicButton>
              <NeumorphicButton variant="danger" onClick={handleConfirmVoid}>
                To‘lovni bekor qilish
              </NeumorphicButton>
            </div>
          </div>
        </NeumorphicModal>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(activeReceiptPayment)}
        onClose={() => setActiveReceiptPayment(null)}
        payment={activeReceiptPayment}
      />
    </div>
  );
};
