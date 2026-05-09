import { User } from '@/types';
import { findUserByEmail, saveUser, setCurrentUser } from './storage';
import { v4 as uuidv4 } from 'uuid';

// Simple hash for demo - in production use bcrypt with a backend
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; user?: User }> {
  if (!EMAIL_RE.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  saveUser(user);
  setCurrentUser(user);
  return { success: true, user };
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) {
    return { success: false, error: 'Invalid email or password.' };
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function logout(): void {
  setCurrentUser(null);
}

export async function resetPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'No account found with this email.' };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  saveUser(user);
  return { success: true };
}
