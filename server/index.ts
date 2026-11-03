import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Clean Seed Data (7 courses, 9 teachers, real roles, clean start)
const INITIAL_DATABASE = {
  courses: [
    { id: 'c-1', name: 'Ingliz tili', defaultPrice: 320000, durationMonths: 6, isActive: true },
    { id: 'c-2', name: 'IELTS', defaultPrice: 450000, durationMonths: 4, isActive: true },
    { id: 'c-3', name: 'CEFR', defaultPrice: 450000, durationMonths: 4, isActive: true },
    { id: 'c-4', name: 'Rus tili', defaultPrice: 320000, durationMonths: 6, isActive: true },
    { id: 'c-5', name: 'Matematika', defaultPrice: 320000, durationMonths: 9, isActive: true },
    { id: 'c-6', name: 'Koreys tili', defaultPrice: 320000, durationMonths: 6, isActive: true },
    { id: 'c-7', name: 'Ona tili va adabiyot', defaultPrice: 320000, durationMonths: 9, isActive: true },
  ],
  teachers: [
    { id: 't-1', fullName: 'Berdiqulov Erali Asatullayevich', subjects: ['Ingliz tili', 'IELTS'], avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-01-10' },
    { id: 't-2', fullName: 'Narzullayeva Fazilat Baxtiyor qizi', subjects: ['Ingliz tili', 'CEFR'], avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-01-15' },
    { id: 't-3', fullName: 'Ashirqulova Kamola Arslon qizi', subjects: ['Ingliz tili', 'CEFR'], avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-02-01' },
    { id: 't-4', fullName: 'Shomirzayeva Muhlisa Berdiyor qizi', subjects: ['Ingliz tili'], avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-02-10' },
    { id: 't-5', fullName: 'Absatov Soibnazar Abdullayevich', subjects: ['Matematika'], avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-01-05' },
    { id: 't-6', fullName: 'Mustafoqulov Diyorbek Elmurod o‘g‘li', subjects: ['Matematika'], avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-01-20' },
    { id: 't-7', fullName: 'Xolmatova Aynur Abbos qizi', subjects: ['Rus tili'], avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-02-15' },
    { id: 't-8', fullName: 'Umarov Sirojiddin Maxmud o‘g‘li', subjects: ['Koreys tili'], avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-03-01' },
    { id: 't-9', fullName: 'Saidqulov Farrux Shavkat o‘g‘li', subjects: ['Ona tili va adabiyot'], avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256', isActive: true, joinedDate: '2026-03-01' },
  ],
  users: [
    { id: 'u-admin', name: 'Bosh Administrator', username: 'admin', passwordHash: 'admin123', role: 'admin', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-01' },
    { id: 'u-manager', name: 'Katta Menejer', username: 'manager', passwordHash: 'manager123', role: 'manager', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-02' },
    { id: 'u-t-1', name: 'Berdiqulov Erali Asatullayevich', username: 'erali', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-1', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-10' },
    { id: 'u-t-2', name: 'Narzullayeva Fazilat Baxtiyor qizi', username: 'fazilat', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-2', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-15' },
    { id: 'u-t-3', name: 'Ashirqulova Kamola Arslon qizi', username: 'kamola', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-3', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-02-01' },
    { id: 'u-t-4', name: 'Shomirzayeva Muhlisa Berdiyor qizi', username: 'muhlisa', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-4', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-02-10' },
    { id: 'u-t-5', name: 'Absatov Soibnazar Abdullayevich', username: 'soibnazar', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-5', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-05' },
    { id: 'u-t-6', name: 'Mustafoqulov Diyorbek Elmurod o‘g‘li', username: 'diyorbek', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-6', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-01-20' },
    { id: 'u-t-7', name: 'Xolmatova Aynur Abbos qizi', username: 'aynur', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-7', avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-02-15' },
    { id: 'u-t-8', name: 'Umarov Sirojiddin Maxmud o‘g‘li', username: 'sirojiddin', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-8', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-03-01' },
    { id: 'u-t-9', name: 'Saidqulov Farrux Shavkat o‘g‘li', username: 'farrux', passwordHash: 'teacher123', role: 'teacher', teacherId: 't-9', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256', isActive: true, createdAt: '2026-03-01' },
  ],
  rooms: [
    { id: 'room-1', name: '1-xona', capacity: 16, description: 'Asosiy auditoriya', isActive: true },
    { id: 'room-2', name: '2-xona', capacity: 16, description: 'Interaktiv doskali xona', isActive: true },
    { id: 'room-3', name: '3-xona', capacity: 14, description: 'Til o‘rganish xonasi', isActive: true },
    { id: 'room-4', name: '4-xona', capacity: 18, description: 'IELTS / CEFR xonasi', isActive: true },
    { id: 'room-5', name: '5-xona', capacity: 16, description: 'Matematika xonasi', isActive: true },
    { id: 'room-6', name: '6-xona', capacity: 14, description: 'Sharq tillari xonasi', isActive: true },
    { id: 'room-7', name: '7-xona', capacity: 20, description: 'Katta auditoriya', isActive: true },
  ],
  groups: [],
  students: [],
  leads: [],
  communications: [],
  payments: [],
  attendanceRecords: [],
  studentResults: [],
  notifications: [
    {
      id: 'notif-welcome',
      title: 'Tizim ishga tushirildi',
      message: 'Renessans o‘quv markazi boshqaruv tizimi faoliyat boshladi.',
      type: 'system',
      linkTab: 'dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    }
  ],
  auditLogs: [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      userId: 'u-admin',
      userName: 'Tizim Administratori',
      userRole: 'admin',
      action: 'TIZIM_ISHGA_TUSHIRILDI',
      targetEntity: 'System',
      details: 'Renessans boshqaruv platformasi server bazasi muvaffaqiyatli ishga tushirildi',
    }
  ],
  settings: {
    brandName: 'Renessans',
    officialEntityName: '“Sardoba language stars” MCHJ',
    prorateRule: 'calendar_days',
    currency: 'so‘m',
    academicYear: '2026-2027',
    managerPermissions: {
      canGiveDiscount: false,
      canChangePrice: false,
      canVoidPayment: false,
      canExportReports: true,
    },
  },
};

// Database helper functions
function readDb(): any {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.leads) data.leads = [];
    if (!data.communications) data.communications = [];
    if (!data.notifications || data.notifications.length === 0) {
      data.notifications = [
        {
          id: 'notif-welcome',
          title: 'Tizimga xush kelibsiz',
          message: 'Renessans o‘quv markazi boshqaruv tizimi muvaffaqiyatli ishga tushirildi.',
          type: 'system',
          linkTab: 'dashboard',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ];
    }
    let modified = false;

    // Ensure 1-7 rooms exist
    if (!data.rooms || data.rooms.length === 0) {
      data.rooms = [
        { id: 'room-1', name: '1-xona', capacity: 16, description: 'Asosiy auditoriya', isActive: true },
        { id: 'room-2', name: '2-xona', capacity: 16, description: 'Interaktiv doskali xona', isActive: true },
        { id: 'room-3', name: '3-xona', capacity: 14, description: 'Til o‘rganish xonasi', isActive: true },
        { id: 'room-4', name: '4-xona', capacity: 18, description: 'IELTS / CEFR xonasi', isActive: true },
        { id: 'room-5', name: '5-xona', capacity: 16, description: 'Matematika xonasi', isActive: true },
        { id: 'room-6', name: '6-xona', capacity: 14, description: 'Sharq tillari xonasi', isActive: true },
        { id: 'room-7', name: '7-xona', capacity: 20, description: 'Katta auditoriya', isActive: true },
      ];
      modified = true;
    }

    // Avatar mapping for educators and staff
    const AVATAR_MAP: Record<string, string> = {
      'u-admin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      'u-manager': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      't-1': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      't-2': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      't-3': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
      't-4': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      't-5': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
      't-6': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
      't-7': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=256',
      't-8': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
      't-9': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256',
    };

    if (data.teachers) {
      data.teachers.forEach((t: any) => {
        if (!t.avatarUrl && AVATAR_MAP[t.id]) {
          t.avatarUrl = AVATAR_MAP[t.id];
          modified = true;
        }
      });
    }

    if (data.users) {
      data.users.forEach((u: any) => {
        if (!u.avatarUrl) {
          if (AVATAR_MAP[u.id]) u.avatarUrl = AVATAR_MAP[u.id];
          else if (u.teacherId && AVATAR_MAP[u.teacherId]) u.avatarUrl = AVATAR_MAP[u.teacherId];
          else u.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=4361EE&color=fff`;
          modified = true;
        }
      });
    }

    if (modified) {
      writeDb(data);
    }

    return data;
  } catch (error) {
    console.error('Error reading database file:', error);
    return INITIAL_DATABASE;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// Ensure database file is initialized
readDb();

function addAuditLog(db: any, action: string, entity: string, details: string, user: any = null) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    userId: user?.id || 'admin',
    userName: user?.name || 'Administrator',
    userRole: user?.role || 'admin',
    action,
    targetEntity: entity,
    details,
  };
  db.auditLogs.unshift(newLog);
}

function addNotification(db: any, title: string, message: string, type: string, linkTab: string = 'dashboard') {
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    type,
    linkTab,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  if (db.notifications.length > 50) {
    db.notifications = db.notifications.slice(0, 50);
  }
}

// ==================== REST API ENDPOINTS ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/initial-state', (req, res) => {
  const db = readDb();
  res.json(db);
});

// AUTH
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Login va parol kiritilishi shart.' });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, error: 'Bunday foydalanuvchi logini topilmadi.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: 'Bu foydalanuvchi hisobi faolsizlantirilgan.' });
  }

  if (user.passwordHash !== password) {
    return res.status(401).json({ success: false, error: 'Parol noto‘g‘ri kiritildi.' });
  }

  addAuditLog(db, 'KIRISH', 'User', `Foydalanuvchi tizimga kirdi: @${user.username}`, user);
  writeDb(db);

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// COURSES
app.get('/api/courses', (req, res) => {
  res.json(readDb().courses);
});

app.post('/api/courses', (req, res) => {
  const db = readDb();
  const newCourse = { ...req.body, id: `c-${Date.now()}` };
  db.courses.push(newCourse);
  addAuditLog(db, 'KURS_QO‘SHILDI', 'Course', `Yangi kurs: ${newCourse.name}`);
  writeDb(db);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', (req, res) => {
  const db = readDb();
  const index = db.courses.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Kurs topilmadi' });
  db.courses[index] = { ...db.courses[index], ...req.body };
  addAuditLog(db, 'KURS_YANGILANDI', 'Course', `Kurs tahrirlandi: ${db.courses[index].name}`);
  writeDb(db);
  res.json(db.courses[index]);
});

// TEACHERS
app.get('/api/teachers', (req, res) => {
  res.json(readDb().teachers);
});

app.post('/api/teachers', (req, res) => {
  const db = readDb();
  const newTeacher = {
    ...req.body,
    id: `t-${Date.now()}`,
    joinedDate: req.body.joinedDate || new Date().toISOString().split('T')[0],
  };
  db.teachers.push(newTeacher);
  addAuditLog(db, 'O‘QITUVCHI_QO‘SHILDI', 'Teacher', `Yangi o‘qituvchi: ${newTeacher.fullName}`);
  writeDb(db);
  res.status(201).json(newTeacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const db = readDb();
  const index = db.teachers.findIndex((t: any) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'O‘qituvchi topilmadi' });
  db.teachers[index] = { ...db.teachers[index], ...req.body };
  addAuditLog(db, 'O‘QITUVCHI_YANGILANDI', 'Teacher', `O‘qituvchi ma’lumotlari: ${db.teachers[index].fullName}`);
  writeDb(db);
  res.json(db.teachers[index]);
});

// ROOMS (1-dan 7-gacha auditoriyalar va yangi xona qo‘shish)
app.get('/api/rooms', (req, res) => {
  const db = readDb();
  res.json(db.rooms || []);
});

app.post('/api/rooms', (req, res) => {
  const { name, capacity, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Xona nomi kiritilishi shart.' });
  }

  const db = readDb();
  if (!db.rooms) db.rooms = [];

  const exists = db.rooms.some((r: any) => r.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Ushbu nomli xona allaqachon mavjud.' });
  }

  const newRoom = {
    id: `room-${Date.now()}`,
    name: name.trim(),
    capacity: Number(capacity) || 16,
    description: description ? description.trim() : '',
    isActive: true,
  };

  db.rooms.push(newRoom);
  addAuditLog(db, 'XONA_QO‘SHILDI', 'Room', `Yangi dars xonasi qo‘shildi: ${newRoom.name}`);
  writeDb(db);

  res.status(201).json(newRoom);
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  if (!db.rooms) db.rooms = [];

  const index = db.rooms.findIndex((r: any) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Xona topilmadi.' });
  }

  db.rooms[index] = { ...db.rooms[index], ...req.body };
  addAuditLog(db, 'XONA_YANGILANDI', 'Room', `Xona yangilandi: ${db.rooms[index].name}`);
  writeDb(db);

  res.json(db.rooms[index]);
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  if (!db.rooms) db.rooms = [];

  const target = db.rooms.find((r: any) => r.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Xona topilmadi.' });
  }

  const inUse = db.groups?.some((g: any) => g.room === target.name || g.schedule?.some((s: any) => s.room === target.name));
  if (inUse) {
    return res.status(400).json({ error: `Ushbu xonada (${target.name}) faol guruhlar dars o‘tadi. Uni o‘chirishdan oldin guruh xonasini o‘zgartiring.` });
  }

  db.rooms = db.rooms.filter((r: any) => r.id !== id);
  addAuditLog(db, 'XONA_OCHIRILDI', 'Room', `Dars xonasi o‘chirildi: ${target.name}`);
  writeDb(db);

  res.json({ success: true });
});

// GROUPS (with delete)
app.get('/api/groups', (req, res) => {
  res.json(readDb().groups);
});

app.post('/api/groups', (req, res) => {
  const db = readDb();
  const newGroup = {
    ...req.body,
    id: `g-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  db.groups.push(newGroup);
  addAuditLog(db, 'GURUH_YARATILDI', 'Group', `Yangi guruh: ${newGroup.name} (${newGroup.courseName})`);
  writeDb(db);
  res.status(201).json(newGroup);
});

app.put('/api/groups/:id', (req, res) => {
  const db = readDb();
  const index = db.groups.findIndex((g: any) => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Guruh topilmadi' });
  db.groups[index] = { ...db.groups[index], ...req.body };
  addAuditLog(db, 'GURUH_YANGILANDI', 'Group', `Guruh tahrirlandi: ${db.groups[index].name}`);
  writeDb(db);
  res.json(db.groups[index]);
});

app.delete('/api/groups/:id', (req, res) => {
  const db = readDb();
  const group = db.groups.find((g: any) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Guruh topilmadi' });

  db.groups = db.groups.filter((g: any) => g.id !== req.params.id);
  db.students.forEach((st: any) => {
    st.enrollments = st.enrollments.filter((e: any) => e.groupId !== req.params.id);
  });

  addAuditLog(db, 'GURUH_OCHIRILDI', 'Group', `Guruh o‘chirildi: ${group.name}`);
  writeDb(db);
  res.json({ success: true, message: 'Guruh muvaffaqiyatli o‘chirildi.' });
});

// STUDENTS
app.get('/api/students', (req, res) => {
  res.json(readDb().students);
});

app.post('/api/students', (req, res) => {
  const db = readDb();
  const newStudent = {
    ...req.body,
    id: `s-${Date.now()}`,
    registeredDate: req.body.registeredDate || new Date().toISOString().split('T')[0],
    enrollments: req.body.enrollments || [],
  };
  db.students.unshift(newStudent);
  addAuditLog(db, 'O‘QUVCHI_QO‘SHILDI', 'Student', `Yangi o‘quvchi: ${newStudent.fullName}`);
  addNotification(
    db,
    'Yangi o‘quvchi ro‘yxatga olindi',
    `${newStudent.fullName} tizimga kiritildi (${newStudent.phone}).`,
    'student',
    'students'
  );
  writeDb(db);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const db = readDb();
  const index = db.students.findIndex((s: any) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'O‘quvchi topilmadi' });
  db.students[index] = { ...db.students[index], ...req.body };
  addAuditLog(db, 'O‘QUVCHI_YANGILANDI', 'Student', `O‘quvchi tahrirlandi: ${db.students[index].fullName}`);
  writeDb(db);
  res.json(db.students[index]);
});

// CRM LEADS (Manager Power Feature)
app.get('/api/leads', (req, res) => {
  res.json(readDb().leads || []);
});

app.post('/api/leads', (req, res) => {
  const db = readDb();
  if (!db.leads) db.leads = [];

  const newLead = {
    ...req.body,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    stage: req.body.stage || 'yangi',
  };

  db.leads.unshift(newLead);
  addAuditLog(db, 'LID_QABUL_QILINDI', 'Lead', `Yangi lid (ariza): ${newLead.fullName} (${newLead.targetCourse})`);
  addNotification(
    db,
    'Yangi mijoz arizasi (Lid)',
    `${newLead.fullName} "${newLead.targetCourse}" kursiga ariza qoldirdi (${newLead.source}).`,
    'lead',
    'leads'
  );
  writeDb(db);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const db = readDb();
  if (!db.leads) db.leads = [];
  const index = db.leads.findIndex((l: any) => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Lid topilmadi' });

  db.leads[index] = { ...db.leads[index], ...req.body, updatedAt: new Date().toISOString() };
  addAuditLog(db, 'LID_YANGILANDI', 'Lead', `Lid bosqichi: ${db.leads[index].fullName} -> ${db.leads[index].stage}`);
  writeDb(db);
  res.json(db.leads[index]);
});

app.delete('/api/leads/:id', (req, res) => {
  const db = readDb();
  if (!db.leads) db.leads = [];
  db.leads = db.leads.filter((l: any) => l.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// CONVERT LEAD TO STUDENT (1-click conversion by Manager)
app.post('/api/leads/:id/convert-to-student', (req, res) => {
  const db = readDb();
  const leadIndex = db.leads.findIndex((l: any) => l.id === req.params.id);
  if (leadIndex === -1) return res.status(404).json({ error: 'Lid topilmadi' });

  const lead = db.leads[leadIndex];
  const { groupId, customDiscount, discountReason } = req.body;

  let group = null;
  const enrollments = [];

  if (groupId) {
    group = db.groups.find((g: any) => g.id === groupId);
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

  const newStudent = {
    id: `s-${Date.now()}`,
    fullName: lead.fullName,
    phone: lead.phone,
    parentPhone: lead.parentPhone,
    notes: `Liddan aylantirildi. Manba: ${lead.source}. Kurs: ${lead.targetCourse}. ${lead.notes || ''}`.trim(),
    status: 'faol',
    registeredDate: new Date().toISOString().split('T')[0],
    enrollments,
  };

  db.students.unshift(newStudent);
  db.leads[leadIndex].stage = 'qabul_qilindi';

  addAuditLog(db, 'LID_OQUVCHIGA_AYLANTIRILDI', 'Lead', `Menejer lidni o‘quvchiga aylantirdi: ${lead.fullName}`);
  addNotification(
    db,
    'Lid o‘quvchiga aylandi',
    `${newStudent.fullName} muvaffaqiyatli ${group ? `"${group.name}" guruhiga` : 'markazga'} qabul qilindi.`,
    'student',
    'students'
  );
  writeDb(db);

  res.status(201).json({ success: true, student: newStudent, lead: db.leads[leadIndex] });
});

// PARENT COMMUNICATIONS (Call-center / Muloqot jurnali)
app.get('/api/communications', (req, res) => {
  res.json(readDb().communications || []);
});

app.post('/api/communications', (req, res) => {
  const db = readDb();
  if (!db.communications) db.communications = [];

  const newComm = {
    ...req.body,
    id: `comm-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  db.communications.unshift(newComm);
  addAuditLog(db, 'OTA_ONA_ALOQA_QAYDI', 'Communication', `Ota-ona bilan muloqot: ${newComm.studentName} (${newComm.purpose})`);
  writeDb(db);
  res.status(201).json(newComm);
});

app.delete('/api/communications/:id', (req, res) => {
  const db = readDb();
  if (!db.communications) db.communications = [];
  db.communications = db.communications.filter((c: any) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// PAYMENTS
app.get('/api/payments', (req, res) => {
  res.json(readDb().payments);
});

app.post('/api/payments', (req, res) => {
  const db = readDb();
  const nextNum = String(db.payments.length + 1).padStart(4, '0');
  const receiptNumber = `RN-${new Date().getFullYear()}-${nextNum}`;

  const newPayment = {
    ...req.body,
    id: `p-${Date.now()}`,
    receiptNumber,
    status: 'muvaffaqiyatli',
    createdAt: new Date().toISOString(),
  };

  db.payments.unshift(newPayment);
  addAuditLog(db, 'TO‘LOV_QABUL_QILINDI', 'Payment', `To‘lov qabul qilindi: ${newPayment.paidAmount} so‘m (${newPayment.studentName})`);
  addNotification(
    db,
    'Yangi to‘lov qabul qilindi',
    `${newPayment.studentName} dan ${newPayment.paidAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so‘m qabul qilindi (${newPayment.receiptNumber}).`,
    'payment',
    'payments'
  );
  writeDb(db);
  res.status(201).json(newPayment);
});

app.post('/api/payments/:id/void', (req, res) => {
  const { reason, userId } = req.body;
  const db = readDb();
  const index = db.payments.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'To‘lov topilmadi' });

  db.payments[index].status = 'bekor_qilingan';
  db.payments[index].voidReason = reason || 'Sabab ko‘rsatilmadi';
  db.payments[index].voidedAt = new Date().toISOString();
  db.payments[index].voidedByUserId = userId;

  addAuditLog(db, 'TO‘LOV_BEKOR_QILINDI', 'Payment', `To‘lov bekor qilindi (${db.payments[index].receiptNumber}). Sabab: ${reason}`);
  writeDb(db);
  res.json({ success: true, payment: db.payments[index] });
});

// ATTENDANCE
app.get('/api/attendance', (req, res) => {
  res.json(readDb().attendanceRecords);
});

app.post('/api/attendance', (req, res) => {
  const db = readDb();
  const recordData = req.body;
  const existingIdx = db.attendanceRecords.findIndex(
    (r: any) => r.groupId === recordData.groupId && r.lessonDate === recordData.lessonDate
  );

  const now = new Date().toISOString();
  let savedRecord;

  if (existingIdx >= 0) {
    db.attendanceRecords[existingIdx] = {
      ...recordData,
      id: db.attendanceRecords[existingIdx].id,
      createdAt: now,
    };
    savedRecord = db.attendanceRecords[existingIdx];
  } else {
    savedRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
      createdAt: now,
    };
    db.attendanceRecords.unshift(savedRecord);
  }

  addAuditLog(db, 'DAVOMAT_SAQLANDI', 'Attendance', `Davomat: ${recordData.lessonDate}`);
  const teacher = db.teachers.find((t: any) => t.id === recordData.teacherId);
  const group = db.groups.find((g: any) => g.id === recordData.groupId);
  addNotification(
    db,
    'Yangi davomat tasdiqlandi',
    `O‘qituvchi ${teacher?.fullName || 'O‘qituvchi'} "${group?.name || 'Guruh'}" uchun ${recordData.lessonDate} kungi davomatni kiritdi (${recordData.records?.length || 0} o‘quvchi).`,
    'attendance',
    'attendance'
  );
  writeDb(db);
  res.status(201).json(savedRecord);
});

// RESULTS
app.get('/api/results', (req, res) => {
  res.json(readDb().studentResults);
});

app.post('/api/results', (req, res) => {
  const db = readDb();
  const newResult = {
    ...req.body,
    id: `res-${Date.now()}`,
  };
  db.studentResults.unshift(newResult);
  addAuditLog(db, 'NATIJA_KIRITILDI', 'Result', `Imtihon natijasi: ${newResult.title}`);
  writeDb(db);
  res.status(201).json(newResult);
});

// USERS
app.get('/api/users', (req, res) => {
  res.json(readDb().users);
});

app.post('/api/users', (req, res) => {
  const db = readDb();
  const { name, username, password, role, subjects } = req.body;

  const exists = db.users.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Bu login bilan foydalanuvchi allaqachon mavjud.' });
  }

  let teacherId = req.body.teacherId;

  if (role === 'teacher' && !teacherId) {
    const existingTeacher = db.teachers.find((t: any) => t.fullName.toLowerCase() === name.trim().toLowerCase());
    if (existingTeacher) {
      teacherId = existingTeacher.id;
    } else {
      const newTeacher = {
        id: `t-${Date.now()}`,
        fullName: name.trim(),
        subjects: subjects || ['Umumiy fanlar'],
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      db.teachers.push(newTeacher);
      teacherId = newTeacher.id;
    }
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name: name.trim(),
    username: username.trim(),
    passwordHash: password,
    role,
    teacherId,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  addAuditLog(db, 'FOYDALANUVCHI_YARATILDI', 'User', `Yangi foydalanuvchi: @${newUser.username} (${newUser.role})`);
  writeDb(db);

  res.status(201).json({ user: newUser, teachers: db.teachers });
});

app.put('/api/users/:id', (req, res) => {
  const db = readDb();
  const index = db.users.findIndex((u: any) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

  // If changing username, check uniqueness
  if (req.body.username && req.body.username.toLowerCase() !== db.users[index].username.toLowerCase()) {
    const exists = db.users.some(
      (u: any) => u.username.toLowerCase() === req.body.username.trim().toLowerCase() && u.id !== req.params.id
    );
    if (exists) {
      return res.status(400).json({ error: 'Bu login bilan boshqa foydalanuvchi allaqachon mavjud.' });
    }
  }

  db.users[index] = { ...db.users[index], ...req.body };
  addAuditLog(db, 'FOYDALANUVCHI_YANGILANDI', 'User', `Foydalanuvchi login/paroli yangilandi: @${db.users[index].username}`);
  writeDb(db);
  res.json(db.users[index]);
});

// NOTIFICATIONS (Bildirishnomalar)
app.get('/api/notifications', (req, res) => {
  res.json(readDb().notifications || []);
});

app.post('/api/notifications/read-all', (req, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  db.notifications.forEach((n: any) => {
    n.isRead = true;
  });
  writeDb(db);
  res.json({ success: true, count: db.notifications.length });
});

app.delete('/api/notifications/:id', (req, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  db.notifications = db.notifications.filter((n: any) => n.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// AUDIT LOGS
app.get('/api/audit', (req, res) => {
  res.json(readDb().auditLogs);
});

// SETTINGS
app.get('/api/settings', (req, res) => {
  res.json(readDb().settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  addAuditLog(db, 'SOZLAMALAR_YANGILANDI', 'Settings', 'Tizim sozlamalari yangilandi');
  writeDb(db);
  res.json(db.settings);
});

app.listen(PORT, () => {
  console.log(`[Renessans Backend] Server ishga tushdi: http://localhost:${PORT}`);
});
