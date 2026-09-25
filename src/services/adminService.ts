import {
  SlotsStatusResponse,
  InitiateOtpRegistrationPayload,
  InitiateOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
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
// PUBLIC API CALLS (2-SLOT OTP REGISTRATION)
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

// Step 1: Send OTP to WhatsApp
export async function sendRegistrationOtp(
  payload: InitiateOtpRegistrationPayload
): Promise<InitiateOtpResponse> {
  const res = await fetch('/api/leads/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to send WhatsApp verification code');
  }
  return data;
}

// Step 2: Resend OTP to WhatsApp
export async function resendRegistrationOtp(
  sessionId: string
): Promise<InitiateOtpResponse> {
  const res = await fetch('/api/leads/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to resend verification code');
  }
  return data;
}

// Step 3: Verify OTP & Claim Slot
export async function verifyRegistrationOtp(
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> {
  const res = await fetch('/api/leads/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'OTP verification failed');
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
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch admin stats');
  }
  return res.json();
}

export async function fetchAdminLeads(params?: {
  search?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<LeadsListResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'All') query.set('status', params.status);
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());

  const res = await fetch(`/api/admin/leads?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch leads');
  }
  return res.json();
}

export async function updateAdminLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
): Promise<RegisteredLead> {
  const res = await fetch(`/api/admin/leads/${leadId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update lead');
  }
  return data.lead;
}

export async function deleteAdminLead(leadId: string): Promise<void> {
  const res = await fetch(`/api/admin/leads/${leadId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete lead');
  }
}

export async function resetAdminSlots(specificSlotNumber?: number): Promise<void> {
  const res = await fetch('/api/admin/slots/reset', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slotNumber: specificSlotNumber }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to reset slots');
  }
}

export async function toggleAdminSlot(slotNumber: number): Promise<void> {
  const res = await fetch('/api/admin/slots/toggle', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ slotNumber }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to toggle slot');
  }
}
