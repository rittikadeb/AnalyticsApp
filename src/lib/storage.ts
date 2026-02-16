import { User, CSVFile, Dashboard } from '@/types';

const STORAGE_KEYS = {
  USERS: 'analytics_users',
  CURRENT_USER: 'analytics_current_user',
  CSV_FILES: 'analytics_csv_files',
  DASHBOARDS: 'analytics_dashboards',
};

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// User operations
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const existing = users.findIndex(u => u.id === user.id);
  if (existing >= 0) {
    users[existing] = user;
  } else {
    users.push(user);
  }
  setItem(STORAGE_KEYS.USERS, users);
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email.toLowerCase());
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

// CSV operations
export function getCSVFiles(userId: string): CSVFile[] {
  const allFiles = getItem<Record<string, CSVFile[]>>(STORAGE_KEYS.CSV_FILES, {});
  return allFiles[userId] || [];
}

export function saveCSVFile(userId: string, file: CSVFile): void {
  const allFiles = getItem<Record<string, CSVFile[]>>(STORAGE_KEYS.CSV_FILES, {});
  if (!allFiles[userId]) allFiles[userId] = [];
  allFiles[userId].push(file);
  setItem(STORAGE_KEYS.CSV_FILES, allFiles);
}

export function deleteCSVFile(userId: string, fileId: string): void {
  const allFiles = getItem<Record<string, CSVFile[]>>(STORAGE_KEYS.CSV_FILES, {});
  if (allFiles[userId]) {
    allFiles[userId] = allFiles[userId].filter(f => f.id !== fileId);
    setItem(STORAGE_KEYS.CSV_FILES, allFiles);
  }
}

// Dashboard operations
export function getDashboards(userId: string): Dashboard[] {
  const allDashboards = getItem<Record<string, Dashboard[]>>(STORAGE_KEYS.DASHBOARDS, {});
  return allDashboards[userId] || [];
}

export function saveDashboard(userId: string, dashboard: Dashboard): void {
  const allDashboards = getItem<Record<string, Dashboard[]>>(STORAGE_KEYS.DASHBOARDS, {});
  if (!allDashboards[userId]) allDashboards[userId] = [];
  const idx = allDashboards[userId].findIndex(d => d.id === dashboard.id);
  if (idx >= 0) {
    allDashboards[userId][idx] = dashboard;
  } else {
    allDashboards[userId].push(dashboard);
  }
  setItem(STORAGE_KEYS.DASHBOARDS, allDashboards);
}

export function deleteDashboard(userId: string, dashboardId: string): void {
  const allDashboards = getItem<Record<string, Dashboard[]>>(STORAGE_KEYS.DASHBOARDS, {});
  if (allDashboards[userId]) {
    allDashboards[userId] = allDashboards[userId].filter(d => d.id !== dashboardId);
    setItem(STORAGE_KEYS.DASHBOARDS, allDashboards);
  }
}
