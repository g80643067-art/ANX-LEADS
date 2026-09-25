import {
  SlotsStatusResponse,
  PublicLeadRegistrationPayload,
  AdminAuthResponse,
  LeadsListResponse,
  AdminStatsResponse,
  RegisteredLead,
  LeadStatus,
} from '../types/admin';

const TOKEN_KEY = 'anx_admin_auth_token';
const ADMIN_USER_KEY = 'anx_admin_user_info';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAdminToken(token: string, admin?: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (admin) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
  }
}

export function clearStoredAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredAdminUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function fetchSlotsStatus(): Promise<SlotsStatusResponse> {
  const res = await fetch('/api/slots', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch slot status');
  }
  return res.json();
}

export async function registerPublicLead(
  payload: PublicLeadRegistrationPayload
): Promise<{
  success: boolean;
  message: string;
  lead: RegisteredLead;
  slotNumber: number;
  remainingSlots: number;
}> {
  const res = await fetch('/api/leads/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

// ==========================================
// ADMIN API CALLS
// ==========================================

export async function loginAdmin(
  usernameOrEmail: string,
  passwordAttempt: string
): Promise<AdminAuthResponse> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail,
      password: passwordAttempt,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Invalid login credentials');
  }

  setStoredAdminToken(data.token, data.admin);
  return data;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getStoredAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.valid;
    }
    clearStoredAdminToken();
    return false;
  } catch {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Logout request warning:', err);
  } finally {
    clearStoredAdminToken();
  }
}

export async function fetchAdminStats(): Promise<AdminStatsResponse> {
  const res = await fetch('/api/admin/stats', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch admin stats');
  }

  return res.json();
}

export async function fetchAdminLeads(options?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<LeadsListResponse> {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.status && options.status !== 'All') params.set('status', options.status);
  if (options?.category && options.category !== 'All') params.set('category', options.category);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));

  const url = `/api/admin/leads?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch admin leads');
  }

  return res.json();
}

export async function resetAdminSlots(slotNumber?: number): Promise<void> {
  const res = await fetch('/api/admin/slots/reset', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slotNumber }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset slots');
  }
}

export async function toggleAdminSlot(slotNumber: number): Promise<void> {
  const res = await fetch('/api/admin/slots/toggle', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slotNumber }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle slot');
  }
}

export async function updateAdminLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<RegisteredLead> {
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update lead');
  }

  const data = await res.json();
  return data.lead;
}

export async function deleteAdminLead(id: string): Promise<void> {
  const res = await fetch(`/api/admin/leads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete lead');
  }
}
