const API_URL = 'http://localhost:8080/api/v1';

export interface User {
  username: string;
  fullName: string;
  roles: string[];
}

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isSuperAdmin = (): boolean => {
  const user = getUser();
  return user?.roles?.includes('SUPER_ADMIN') || false;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
