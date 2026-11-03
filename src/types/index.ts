export type Role = 'admin' | 'manager' | 'teacher';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash?: string;
  role: Role;
  teacherId?: string; // Links to teacher record if role === 'teacher'
  phone?: string;
  avatarUrl?: string; // Profil rasmi
  isActive: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string; // e.g. "1-xona", "2-xona", ..., "7-xona"
  capacity: number; // e.g. 16
  description?: string;
  isActive: boolean;
}

export interface ManagerPermissions {
  canGiveDiscount: boolean;
  canChangePrice: boolean;
  canVoidPayment: boolean;
  canExportReports: boolean;
}

export interface Course {
  id: string;
  name: string;
  defaultPrice: number; // in UZS (so'm)
  description?: string;
  durationMonths: number;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  fullName: string; // e.g. "Berdiqulov Erali Asatullayevich"
  subjects: string[]; // e.g. ["Ingliz tili", "IELTS"]
  phone?: string;
  address?: string;
  avatarUrl?: string; // O'qituvchi profil rasmi
  isActive: boolean;
  joinedDate: string;
}

export type GroupStatus = 'rejalashtirilgan' | 'faol' | 'yakunlangan';

export interface LessonSchedule {
  dayOfWeek: number; // 1 = Dushanba, ..., 6 = Shanba, 7 = Yakshanba
  dayName: string; // "Dushanba", "Chorshanba", etc.
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "10:30"
  room: string; // e.g. "101-xona"
}

export interface Group {
  id: string;
  name: string; // e.g. "ENG-101"
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  monthlyPrice: number; // group-specific price in UZS
  startDate: string;
  endDate?: string;
  status: GroupStatus;
  schedule: LessonSchedule[];
  room: string;
  createdAt: string;
}

export type StudentStatus = 'faol' | 'muzlatilgan' | 'ketgan';

export interface StudentGroupEnrollment {
  groupId: string;
  groupName: string;
  joinedDate: string;
  leftDate?: string;
  isActive: boolean;
  customDiscount: number; // in UZS or percentage
  discountReason?: string;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  notes?: string;
  status: StudentStatus;
  enrollments: StudentGroupEnrollment[];
  registeredDate: string;
}

// CRM Lead (Yangi arizalar va mijozlar oqimi)
export type LeadSource = 'instagram' | 'telegram' | 'banner' | 'tavsiya' | 'boshqa';
export type LeadStage = 'yangi' | 'aloqada' | 'sinov_darsi' | 'qabul_qilindi' | 'rad_etildi';

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  parentPhone?: string;
  targetCourse: string;
  source: LeadSource;
  stage: LeadStage;
  trialLessonDate?: string;
  notes?: string;
  createdAt: string;
  assignedManager?: string;
}

// Ota-onalar bilan aloqa jurnali (Call & Communication Log)
export type CommunicationType = 'qongiroq' | 'sms' | 'yuzma_yuz' | 'telegram';
export type CommunicationPurpose = 'tolov_eslatmasi' | 'davomat_haqida' | 'imtihon_natijasi' | 'odob_axloq' | 'umumiy';

export interface ParentCommunication {
  id: string;
  studentId?: string;
  studentName: string;
  parentPhone: string;
  contactType: CommunicationType;
  purpose: CommunicationPurpose;
  discussionNotes: string;
  resultStatus: 'ijobiy' | 'kutilmoqda' | 'muammo_hal_qilindi';
  nextFollowUpDate?: string;
  managerName: string;
  createdAt: string;
}

// Bildirishnomalar (Notifications)
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'attendance' | 'payment' | 'lead' | 'student' | 'system';
  linkTab?: string;
  isRead: boolean;
  createdAt: string;
}

export type PaymentMethod = 'naqd' | 'karta' | 'bank_otkazmasi';
export type PaymentStatus = 'muvaffaqiyatli' | 'bekor_qilingan';

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. "RN-2026-0001"
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  courseName: string;
  billingMonth: string; // "YYYY-MM", e.g. "2026-11"
  billedAmount: number; // standard or adjusted bill
  paidAmount: number; // amount paid in this transaction
  discountAmount: number;
  discountReason?: string;
  paymentMethod: PaymentMethod;
  paymentDate: string; // "YYYY-MM-DD"
  receivedByUserId: string;
  receivedByName: string;
  notes?: string;
  status: PaymentStatus;
  voidReason?: string;
  voidedAt?: string;
  voidedByUserId?: string;
  createdAt: string;
}

export type AttendanceStatus = 'keldi' | 'kelmadi' | 'kechikdi' | 'sababli';

export interface AttendanceRecord {
  id: string;
  groupId: string;
  lessonDate: string; // "YYYY-MM-DD"
  teacherId: string;
  topic?: string;
  homework?: string;
  records: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    note?: string;
  }[];
  createdAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  score: number; // out of 100
  title: string; // e.g. "Mid-term imtihon"
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string; // e.g. "TO‘LOV_QABUL_QILINDI"
  targetEntity: string; // e.g. "Payment"
  targetId?: string;
  details: string;
}

export interface SystemSettings {
  brandName: string;
  officialEntityName: string;
  prorateRule: 'calendar_days' | 'lessons_count' | 'fixed_half';
  currency: string;
  academicYear: string;
  managerPermissions: ManagerPermissions;
}
