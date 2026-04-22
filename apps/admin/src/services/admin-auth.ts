import { jsonRequest, request } from './request';

export type AdminRole = 'ADMIN' | 'OPERATIONS';

export type AdminSessionUser = {
  email: string;
  id: string;
  name: string;
  role: AdminRole;
};

export type AdminSession = {
  user: AdminSessionUser;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLogoutResult = {
  ok: true;
};

export function login(payload: AdminLoginRequest) {
  return jsonRequest<AdminSession>('/admin/auth/login', 'POST', payload);
}

export function currentSession() {
  return request<AdminSession>('/admin/auth/me');
}

export function logout() {
  return request<AdminLogoutResult>('/admin/auth/logout', {
    method: 'POST',
  });
}
