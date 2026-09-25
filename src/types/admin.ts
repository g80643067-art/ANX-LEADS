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
  email: string;
  businessName: string;
  businessCategory: string;
  city: string;
  notes?: string;
  registeredAt: string;
  slotNumber: number;
  status: LeadStatus;
  source?: string;
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

export interface PublicLeadRegistrationPayload {
  name: string;
  phoneNumber: string;
  email: string;
  businessName: string;
  businessCategory: string;
  city: string;
  notes?: string;
}
