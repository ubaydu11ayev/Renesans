import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Course,
  Teacher,
  Group,
  Student,
  Payment,
  AttendanceRecord,
  StudentResult,
  AuditLog,
  SystemSettings,
  StudentGroupEnrollment,
  Lead,
  ParentCommunication,
  SystemNotification,
  Room,
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_TEACHERS,
  INITIAL_SETTINGS,
  INITIAL_ROOMS,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { checkScheduleConflict, ConflictCheckResult } from '../utils/formatters';

interface FinancialSummary {
  billedAmount: number;
  paidAmount: number;
  debtAmount: number;
  overpaidAmount: number;
}

interface DataContextType {
  // State
  courses: Course[];
  teachers: Teacher[];
  groups: Group[];
  students: Student[];
  leads: Lead[];
  communications: ParentCommunication[];
  payments: Payment[];
  attendanceRecords: AttendanceRecord[];
  studentResults: StudentResult[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  notifications: SystemNotification[];
  unreadNotificationsCount: number;
  rooms: Room[];
  isLoading: boolean;

  // Actions - Rooms (1-7 xonalar va yangi xona qo'shish)
  addRoom: (room: Omit<Room, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Actions - Courses
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;

  // Actions - Teachers
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'joinedDate'>) => Promise<void>;

  // Actions - Groups
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Promise<{ success: boolean; conflict?: ConflictCheckResult }>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<{ success: boolean; conflict?: ConflictCheckResult }>;
  deleteGroup: (id: string) => Promise<{ success: boolean }>;

  // Actions - Students
  addStudent: (student: Omit<Student, 'id' | 'registeredDate'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  enrollStudentInGroup: (studentId: string, enrollment: StudentGroupEnrollment) => Promise<void>;
  removeStudentFromGroup: (studentId: string, groupId: string) => Promise<void>;
  transferStudentGroup: (studentId: string, fromGroupId: string, toGroup: { id: string; name: string }) => Promise<void>;

  // Actions - CRM Leads (Yangi arizalar & Qabul)
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToStudent: (leadId: string, groupId?: string, customDiscount?: number, discountReason?: string) => Promise<void>;

  // Actions - Parent Communications (Ota-onalar bilan muloqot)
  addCommunication: (comm: Omit<ParentCommunication, 'id' | 'createdAt'>) => Promise<void>;
  deleteCommunication: (id: string) => Promise<void>;

  // Actions - Payments
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt' | 'status'>) => Promise<Payment>;
  voidPayment: (paymentId: string, reason: string) => Promise<{ success: boolean; error?: string }>;

  // Actions - Attendance
  saveAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => Promise<void>;

  // Actions - Results
  saveStudentResult: (result: Omit<StudentResult, 'id'>) => Promise<void>;

  // Actions - Settings & Audit
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  logAudit: (action: string, entity: string, targetId?: string, details?: string) => Promise<void>;

  // Actions - Bildirishnomalar (Notifications)
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Helpers / Computed
  getGroupStudentCount: (groupId: string) => number;
  getTeacherActiveGroupsCount: (teacherId: string) => number;
  getTeacherActiveStudentsCount: (teacherId: string) => number;
  getStudentDebtForMonth: (studentId: string, month: string) => number;
  getFinancialSummaryForMonth: (month: string) => FinancialSummary;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE = '/api';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [communications, setCommunications] = useState<ParentCommunication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  const refreshNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const notifs = await res.json();
        setNotifications(notifs);
      }
    } catch (e) {
      // ignore
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Initial fetch from backend server
  useEffect(() => {
    async function loadServerData() {
      try {
        const res = await fetch(`${API_BASE}/initial-state`);
        if (res.ok) {
          const data = await res.json();
          if (data.courses) setCourses(data.courses);
          if (data.teachers) setTeachers(data.teachers);
          if (data.groups) setGroups(data.groups);
          if (data.students) setStudents(data.students);
          if (data.leads) setLeads(data.leads);
          if (data.communications) setCommunications(data.communications);
          if (data.payments) setPayments(data.payments);
          if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
          if (data.studentResults) setStudentResults(data.studentResults);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          if (data.settings) setSettings(data.settings);
          if (data.notifications) setNotifications(data.notifications);
          if (data.rooms) setRooms(data.rooms);
        }
      } catch (err) {
        console.warn('Backend server connecting, using local state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadServerData();

    // Auto-refresh notifications every 10 seconds for real-time alerts
    const interval = setInterval(refreshNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Audit Logger Helper
  const logAudit = async (action: string, entity: string, targetId?: string, details?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'tizim',
      userName: currentUser?.name || 'Tizim avtomatizatsiyasi',
      userRole: currentUser?.role || 'admin',
      action,
      targetEntity: entity,
      targetId,
      details: details || '',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Courses
  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (res.ok) {
        const saved = await res.json();
        setCourses(prev => [...prev, saved]);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const fallback: Course = { ...courseData, id: `c-${Date.now()}` };
    setCourses(prev => [...prev, fallback]);
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCourses(prev => prev.map(c => c.id === id ? updated : c));
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...courseData } : c));
  };

  // Teachers
  const updateTeacher = async (id: string, teacherData: Partial<Teacher>) => {
    try {
      const res = await fetch(`${API_BASE}/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeachers(prev => prev.map(t => t.id === id ? updated : t));
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacherData } : t));
  };

  const addTeacher = async (teacherData: Omit<Teacher, 'id' | 'joinedDate'>) => {
    try {
      const res = await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      });
      if (res.ok) {
        const saved = await res.json();
        setTeachers(prev => [...prev, saved]);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const fallback: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setTeachers(prev => [...prev, fallback]);
  };

  // Groups
  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>): Promise<{ success: boolean; conflict?: ConflictCheckResult }> => {
    const conflict = checkScheduleConflict(groups, null, groupData.teacherId, groupData.schedule);
    if (conflict.hasConflict) {
      return { success: false, conflict };
    }

    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      if (res.ok) {
        const saved = await res.json();
        setGroups(prev => [...prev, saved]);
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }

    const fallback: Group = {
      ...groupData,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGroups(prev => [...prev, fallback]);
    return { success: true };
  };

  const updateGroup = async (id: string, groupData: Partial<Group>): Promise<{ success: boolean; conflict?: ConflictCheckResult }> => {
    if (groupData.schedule && groupData.teacherId) {
      const conflict = checkScheduleConflict(groups, id, groupData.teacherId, groupData.schedule);
      if (conflict.hasConflict) {
        return { success: false, conflict };
      }
    }

    try {
      const res = await fetch(`${API_BASE}/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });
      if (res.ok) {
        const updated = await res.json();
        setGroups(prev => prev.map(g => g.id === id ? updated : g));
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }

    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...groupData } : g));
    return { success: true };
  };

  const deleteGroup = async (id: string): Promise<{ success: boolean }> => {
    try {
      await fetch(`${API_BASE}/groups/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }

    setGroups(prev => prev.filter(g => g.id !== id));
    setStudents(prev => prev.map(st => ({
      ...st,
      enrollments: st.enrollments.filter(e => e.groupId !== id),
    })));

    logAudit('GURUH_OCHIRILDI', 'Group', id, 'Guruh muvaffaqiyatli o‘chirildi');
    return { success: true };
  };

  // Rooms Actions (1-7 xonalar va qo'shish)
  const addRoom = async (roomData: Omit<Room, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (res.ok) {
        const saved = await res.json();
        setRooms(prev => [...prev, saved]);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Xona qo‘shishda xatolik yuz berdi' };
      }
    } catch (e: any) {
      const fallback: Room = {
        ...roomData,
        id: `room-${Date.now()}`,
      };
      setRooms(prev => [...prev, fallback]);
      return { success: true };
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    try {
      await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
    } catch (e) {
      console.error(e);
    }
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...roomData } : r));
  };

  const deleteRoom = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== id));
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Xonani o‘chirib bo‘lmadi' };
      }
    } catch (e: any) {
      setRooms(prev => prev.filter(r => r.id !== id));
      return { success: true };
    }
  };

  // Students
  const addStudent = async (studentData: Omit<Student, 'id' | 'registeredDate'>) => {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) {
        const saved = await res.json();
        setStudents(prev => [saved, ...prev]);
        refreshNotifications();
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const fallback: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [fallback, ...prev]);
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === id ? updated : s));
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
  };

  const enrollStudentInGroup = async (studentId: string, enrollment: StudentGroupEnrollment) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const filtered = student.enrollments.filter(e => e.groupId !== enrollment.groupId);
    const updatedEnrollments = [...filtered, enrollment];

    await updateStudent(studentId, { enrollments: updatedEnrollments });
  };

  const removeStudentFromGroup = async (studentId: string, groupId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updated = student.enrollments.map(e =>
      e.groupId === groupId ? { ...e, isActive: false, leftDate: new Date().toISOString().split('T')[0] } : e
    );

    await updateStudent(studentId, { enrollments: updated });
  };

  const transferStudentGroup = async (studentId: string, fromGroupId: string, toGroup: { id: string; name: string }) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const today = new Date().toISOString().split('T')[0];
    const currentEnr = student.enrollments.find(e => e.groupId === fromGroupId);

    const updatedEnrollments = student.enrollments.map(e =>
      e.groupId === fromGroupId ? { ...e, isActive: false, leftDate: today } : e
    );

    const newEnr: StudentGroupEnrollment = {
      groupId: toGroup.id,
      groupName: toGroup.name,
      joinedDate: today,
      isActive: true,
      customDiscount: currentEnr?.customDiscount || 0,
      discountReason: currentEnr?.discountReason,
    };

    await updateStudent(studentId, {
      enrollments: [...updatedEnrollments.filter(e => e.groupId !== toGroup.id), newEnr],
    });
  };

  // CRM Leads
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      if (res.ok) {
        const saved = await res.json();
        setLeads(prev => [saved, ...prev]);
        refreshNotifications();
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const fallback: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads(prev => [fallback, ...prev]);
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(prev => prev.map(l => l.id === id ? updated : l));
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLead = async (id: string) => {
    try {
      await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convertLeadToStudent = async (leadId: string, groupId?: string, customDiscount?: number, discountReason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/leads/${leadId}/convert-to-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, customDiscount, discountReason }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(prev => [data.student, ...prev]);
        setLeads(prev => prev.map(l => l.id === leadId ? data.lead : l));
        refreshNotifications();
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    let group = null;
    const enrollments = [];

    if (groupId) {
      group = groups.find(g => g.id === groupId);
      if (group) {
        enrollments.push({
          groupId: group.id,
          groupName: group.name,
          joinedDate: new Date().toISOString().split('T')[0],
          isActive: true,
          customDiscount: Number(customDiscount) || 0,
          discountReason,
        });
      }
    }

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      fullName: lead.fullName,
      phone: lead.phone,
      parentPhone: lead.parentPhone,
      notes: `Liddan aylantirildi. Manba: ${lead.source}. Kurs: ${lead.targetCourse}.`,
      status: 'faol',
      registeredDate: new Date().toISOString().split('T')[0],
      enrollments,
    };

    setStudents(prev => [newStudent, ...prev]);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: 'qabul_qilindi' } : l));
  };

  // Parent Communications
  const addCommunication = async (commData: Omit<ParentCommunication, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commData),
      });
      if (res.ok) {
        const saved = await res.json();
        setCommunications(prev => [saved, ...prev]);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    const fallback: ParentCommunication = {
      ...commData,
      id: `comm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCommunications(prev => [fallback, ...prev]);
  };

  const deleteCommunication = async (id: string) => {
    try {
      await fetch(`${API_BASE}/communications/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setCommunications(prev => prev.filter(c => c.id !== id));
  };

  // Payments
  const recordPayment = async (paymentData: Omit<Payment, 'id' | 'receiptNumber' | 'createdAt' | 'status'>): Promise<Payment> => {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        const saved = await res.json();
        setPayments(prev => [saved, ...prev]);
        refreshNotifications();
        return saved;
      }
    } catch (e) {
      console.error(e);
    }

    const nextReceiptNum = `RN-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const fallback: Payment = {
      ...paymentData,
      id: `p-${Date.now()}`,
      receiptNumber: nextReceiptNum,
      status: 'muvaffaqiyatli',
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [fallback, ...prev]);
    return fallback;
  };

  const voidPayment = async (paymentId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, userId: currentUser?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(prev => prev.map(p => p.id === paymentId ? data.payment : p));
        return { success: true };
      }
    } catch (e) {
      console.error(e);
    }

    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p;
      return {
        ...p,
        status: 'bekor_qilingan',
        voidReason: reason,
        voidedAt: new Date().toISOString(),
        voidedByUserId: currentUser?.id,
      };
    }));
    return { success: true };
  };

  // Attendance
  const saveAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      if (res.ok) {
        const saved = await res.json();
        setAttendanceRecords(prev => {
          const idx = prev.findIndex(r => r.id === saved.id || (r.groupId === saved.groupId && r.lessonDate === saved.lessonDate));
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = saved;
            return copy;
          }
          return [saved, ...prev];
        });
        refreshNotifications();
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAttendanceRecords(prev => [fallback, ...prev]);
  };

  // Results
  const saveStudentResult = async (resultData: Omit<StudentResult, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });
      if (res.ok) {
        const saved = await res.json();
        setStudentResults(prev => [saved, ...prev]);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback: StudentResult = { ...resultData, id: `res-${Date.now()}` };
    setStudentResults(prev => [fallback, ...prev]);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
        return;
      }
    } catch (e) {
      console.error(e);
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Helpers / Computed
  const getGroupStudentCount = (groupId: string): number => {
    return students.filter(s =>
      s.status === 'faol' && s.enrollments.some(e => e.groupId === groupId && e.isActive)
    ).length;
  };

  const getTeacherActiveGroupsCount = (teacherId: string): number => {
    return groups.filter(g => g.teacherId === teacherId && g.status === 'faol').length;
  };

  const getTeacherActiveStudentsCount = (teacherId: string): number => {
    const teacherGroupIds = groups.filter(g => g.teacherId === teacherId && g.status === 'faol').map(g => g.id);
    const activeStudentIds = new Set<string>();

    students.forEach(s => {
      if (s.status === 'faol') {
        const isInTeacherGroup = s.enrollments.some(e => e.isActive && teacherGroupIds.includes(e.groupId));
        if (isInTeacherGroup) {
          activeStudentIds.add(s.id);
        }
      }
    });

    return activeStudentIds.size;
  };

  const getStudentDebtForMonth = (studentId: string, month: string): number => {
    const student = students.find(s => s.id === studentId);
    if (!student || student.status !== 'faol') return 0;

    let totalBilled = 0;
    student.enrollments.forEach(e => {
      if (e.isActive) {
        const group = groups.find(g => g.id === e.groupId);
        if (group && group.status === 'faol') {
          const price = group.monthlyPrice;
          const discounted = Math.max(0, price - (e.customDiscount || 0));
          totalBilled += discounted;
        }
      }
    });

    const totalPaid = payments
      .filter(p => p.studentId === studentId && p.billingMonth === month && p.status === 'muvaffaqiyatli')
      .reduce((sum, p) => sum + p.paidAmount, 0);

    return Math.max(0, totalBilled - totalPaid);
  };

  const getFinancialSummaryForMonth = (month: string): FinancialSummary => {
    let billedAmount = 0;
    let paidAmount = 0;

    students.forEach(student => {
      if (student.status === 'faol') {
        student.enrollments.forEach(en => {
          if (en.isActive) {
            const grp = groups.find(g => g.id === en.groupId);
            if (grp && grp.status === 'faol') {
              const discounted = Math.max(0, grp.monthlyPrice - (en.customDiscount || 0));
              billedAmount += discounted;
            }
          }
        });
      }
    });

    payments.forEach(p => {
      if (p.billingMonth === month && p.status === 'muvaffaqiyatli') {
        paidAmount += p.paidAmount;
      }
    });

    const debtAmount = Math.max(0, billedAmount - paidAmount);
    const overpaidAmount = Math.max(0, paidAmount - billedAmount);

    return { billedAmount, paidAmount, debtAmount, overpaidAmount };
  };

  return (
    <DataContext.Provider
      value={{
        courses,
        teachers,
        groups,
        students,
        leads,
        communications,
        payments,
        attendanceRecords,
        studentResults,
        auditLogs,
        settings,
        notifications,
        unreadNotificationsCount: notifications.filter(n => !n.isRead).length,
        rooms,
        isLoading,
        markAllNotificationsAsRead,
        deleteNotification,
        refreshNotifications,
        addRoom,
        updateRoom,
        deleteRoom,
        addCourse,
        updateCourse,
        updateTeacher,
        addTeacher,
        addGroup,
        updateGroup,
        deleteGroup,
        addStudent,
        updateStudent,
        enrollStudentInGroup,
        removeStudentFromGroup,
        transferStudentGroup,
        addLead,
        updateLead,
        deleteLead,
        convertLeadToStudent,
        addCommunication,
        deleteCommunication,
        recordPayment,
        voidPayment,
        saveAttendance,
        saveStudentResult,
        updateSettings,
        logAudit,
        getGroupStudentCount,
        getTeacherActiveGroupsCount,
        getTeacherActiveStudentsCount,
        getStudentDebtForMonth,
        getFinancialSummaryForMonth,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
