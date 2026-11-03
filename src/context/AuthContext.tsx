import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'renessans_users_v1';
const SESSION_STORAGE_KEY = 'renessans_current_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  // Fetch users from server on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const serverUsers = await res.json();
          setUsers(serverUsers);
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(serverUsers));
        }
      } catch (e) {
        console.warn('Backend server not connected yet, using local store:', e);
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim().toLowerCase();

    // Try server authentication first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Kirishda xatolik yuz berdi.' };
      }
    } catch {
      // Fallback to local accounts
      const user = users.find(u => u.username.toLowerCase() === trimmedUsername);
      if (!user) {
        return { success: false, error: 'Bunday foydalanuvchi logini topilmadi.' };
      }
      if (!user.isActive) {
        return { success: false, error: 'Bu foydalanuvchi hisobi faolsizlantirilgan.' };
      }
      if (user.passwordHash !== password) {
        return { success: false, error: 'Parol noto‘g‘ri kiritildi.' };
      }
      setCurrentUser(user);
      return { success: true };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error(e);
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => [...prev, data.user]);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallback: User = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, fallback]);
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    await updateUser(userId, { isActive: !user.isActive });
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, updateUser, createUser, toggleUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
