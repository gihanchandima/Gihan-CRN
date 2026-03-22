import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AuthState, User } from '@/types';
import { mockUsers } from '@/data/mockData';

interface StoredUserRecord {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: User['role'];
  teamId: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USERS_KEY = 'gihan-crn-auth-users';
const AUTH_SESSION_KEY = 'gihan-crn-auth-session';
const DEFAULT_PASSWORD = 'demo123';

function toStoredUserRecord(user: User, password = DEFAULT_PASSWORD): StoredUserRecord {
  return {
    ...user,
    password,
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin.toISOString(),
  };
}

function toUser(record: StoredUserRecord): User {
  return {
    uid: record.uid,
    name: record.name,
    email: record.email,
    role: record.role,
    teamId: record.teamId,
    avatar: record.avatar,
    phone: record.phone,
    bio: record.bio,
    createdAt: new Date(record.createdAt),
    lastLogin: new Date(record.lastLogin),
  };
}

function getSeededUsers(): StoredUserRecord[] {
  return mockUsers.map(user => toStoredUserRecord(user));
}

function readStoredUsers(): StoredUserRecord[] {
  if (typeof window === 'undefined') {
    return getSeededUsers();
  }

  const raw = window.localStorage.getItem(AUTH_USERS_KEY);
  if (!raw) {
    const seededUsers = getSeededUsers();
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUserRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getSeededUsers();
  } catch {
    const seededUsers = getSeededUsers();
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(seededUsers));
    return seededUsers;
  }
}

function writeStoredUsers(users: StoredUserRecord[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }
}

function readStoredSession(users: StoredUserRecord[]): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const sessionUid = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!sessionUid) {
    return null;
  }

  const sessionUser = users.find(user => user.uid === sessionUid);
  return sessionUser ? toUser(sessionUser) : null;
}

function writeStoredSession(uid: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (uid) {
    window.localStorage.setItem(AUTH_SESSION_KEY, uid);
  } else {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [storedUsers, setStoredUsers] = useState<StoredUserRecord[]>(() => readStoredUsers());
  const [state, setState] = useState<AuthState>(() => {
    const users = readStoredUsers();
    const sessionUser = readStoredSession(users);

    return {
      user: sessionUser,
      isAuthenticated: !!sessionUser,
      isLoading: false,
    };
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedEmail = email.trim().toLowerCase();
    const userRecord = storedUsers.find(
      user => user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (!userRecord) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Invalid email or password');
    }

    const updatedRecord = {
      ...userRecord,
      lastLogin: new Date().toISOString(),
    };
    const updatedUsers = storedUsers.map(user => (
      user.uid === updatedRecord.uid ? updatedRecord : user
    ));

    setStoredUsers(updatedUsers);
    writeStoredUsers(updatedUsers);
    writeStoredSession(updatedRecord.uid);

    setState({
      user: toUser(updatedRecord),
      isAuthenticated: true,
      isLoading: false,
    });
  }, [storedUsers]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (storedUsers.some(user => user.email.toLowerCase() === normalizedEmail)) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error('An account with this email already exists');
    }

    const now = new Date().toISOString();
    const newUserRecord: StoredUserRecord = {
      uid: `user-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: 'sales',
      teamId: 'team-1',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
      createdAt: now,
      lastLogin: now,
    };

    const nextUsers = [newUserRecord, ...storedUsers];
    setStoredUsers(nextUsers);
    writeStoredUsers(nextUsers);
    writeStoredSession(newUserRecord.uid);

    setState({
      user: toUser(newUserRecord),
      isAuthenticated: true,
      isLoading: false,
    });
  }, [storedUsers]);

  const logout = useCallback(() => {
    writeStoredSession(null);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setStoredUsers(prev => {
      const nextUsers = prev.map(record => (
        record.uid === user.uid ? toStoredUserRecord(user, record.password) : record
      ));
      writeStoredUsers(nextUsers);
      return nextUsers;
    });

    setState(prev => ({ ...prev, user }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    updateUser,
  }), [state, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
