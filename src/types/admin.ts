export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'In Progress'
  | 'Qualified'
  | 'Closed'
  | 'Archived';

export interface RegisteredLead {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email: string;
  businessName: string;
  businessCategory: string;
  city: string;
  notes?: string;
  registeredAt: string;
  slotNumber: number;
  status: LeadStatus;
  source?: string;
  isVerified?: boolean;
}

export interface SlotItem {
  slotNumber: number;
  isOccupied: boolean;
  claimedBy: string | null;
  claimedLeadId: string | null;
  claimedAt: string | null;
}

export interface SlotsStatusResponse {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  slots: SlotItem[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AdminAuthResponse {
  success: boolean;
  token: string;
  admin: AdminUser;
}

export interface LeadsListResponse {
  leads: RegisteredLead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStatsResponse {
  totalLeads: number;
  availableSlots: number;
  occupiedSlots: number;
  totalSlots: number;
  recentLeads: RegisteredLead[];
  statusBreakdown: Record<string, number>;
  slots: SlotItem[];
}

export interface InitiateOtpRegistrationPayload {
  name: string;
  whatsappNumber: string;
  email: string;
  password: string;
  businessName?: string;
  businessCategory?: string;
  city?: string;
  notes?: string;
}

export interface InitiateOtpResponse {
  success: boolean;
  message: string;
  sessionId: string;
  maskedWhatsApp: string;
  expiresInSeconds: number;
  cooldownSeconds: number;
  demoOtpPreview?: string;
}

export interface VerifyOtpPayload {
  sessionId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  lead: RegisteredLead;
  slotNumber: number;
  remainingSlots: number;
}
