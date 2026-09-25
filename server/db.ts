import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  status: 'New' | 'Contacted' | 'In Progress' | 'Qualified' | 'Closed' | 'Archived';
  source?: string;
}

export interface SlotItem {
  slotNumber: number;
  isOccupied: boolean;
  claimedBy: string | null;
  claimedLeadId: string | null;
  claimedAt: string | null;
}

export interface SlotsConfig {
  totalSlots: number;
  slots: SlotItem[];
  lastResetAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface AdminSession {
  token: string;
  adminId: string;
  username: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  leads: RegisteredLead[];
  slotsConfig: SlotsConfig;
  admins: AdminUser[];
  sessions: AdminSession[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'leads_db.json');

// Mutex lock for thread-safe slot allocation
let mutexPromise: Promise<void> = Promise.resolve();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Default initial state
function getDefaultDb(): DatabaseSchema {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@ANX2026!';
  const defaultHash = hashPassword(defaultPassword, defaultSalt);

  const initialLeads: RegisteredLead[] = [
    {
      id: 'lead-1711200001-a1b2',
      name: 'Rajesh Sharma',
      phoneNumber: '+91 98390 12345',
      email: 'rajesh.sharma@lucknowsweets.in',
      businessName: 'Sharma Sweets & Bakers',
      businessCategory: 'Restaurant / Food',
      city: 'Lucknow',
      notes: 'Interested in digital ordering system and professional storefront website.',
      registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      slotNumber: 1,
      status: 'New',
      source: 'Direct Web Registration',
    },
    {
      id: 'lead-1711100002-c3d4',
      name: 'Pooja Verma',
      phoneNumber: '+91 94500 67890',
      email: 'pooja.verma@glamourparlour.com',
      businessName: 'Glamour Beauty & Bridal Studio',
      businessCategory: 'Beauty Parlour / Salon',
      city: 'Prayagraj',
      notes: 'Needs WhatsApp automated appointment booking integration.',
      registeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      slotNumber: 2,
      status: 'Contacted',
      source: 'Direct Web Registration',
    },
  ];

  return {
    leads: initialLeads,
    slotsConfig: {
      totalSlots: 2,
      slots: [
        {
          slotNumber: 1,
          isOccupied: true,
          claimedBy: 'Rajesh Sharma',
          claimedLeadId: 'lead-1711200001-a1b2',
          claimedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          slotNumber: 2,
          isOccupied: false,
          claimedBy: null,
          claimedLeadId: null,
          claimedAt: null,
        },
      ],
      lastResetAt: new Date().toISOString(),
    },
    admins: [
      {
        id: 'admin-root-01',
        username: 'admin',
        email: 'admin@anxleads.com',
        passwordHash: defaultHash,
        salt: defaultSalt,
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: [],
  };
}

// Database helper functions
export class Database {
  private static instance: Database;

  private constructor() {
    this.ensureDbExists();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private ensureDbExists(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (!fs.existsSync(DB_FILE)) {
        const defaultData = getDefaultDb();
        this.writeSync(defaultData);
      }
    } catch (err) {
      console.error('[DB] Error ensuring database file exists:', err);
    }
  }

  private readSync(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.ensureDbExists();
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('[DB] Read error, falling back to default:', err);
      const fallback = getDefaultDb();
      this.writeSync(fallback);
      return fallback;
    }
  }

  private writeSync(data: DatabaseSchema): void {
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).substring(7)}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Atomic write failed:', err);
      // Fallback direct write
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  private async lock<T>(fn: () => Promise<T> | T): Promise<T> {
    const previous = mutexPromise;
    let resolveNext!: () => void;
    mutexPromise = new Promise<void>((resolve) => {
      resolveNext = resolve;
    });

    try {
      await previous;
      return await fn();
    } finally {
      resolveNext();
    }
  }

  // PUBLIC SLOTS METHODS
  public async getSlotsStatus(): Promise<{
    totalSlots: number;
    occupiedSlots: number;
    availableSlots: number;
    slots: SlotItem[];
  }> {
    return this.lock(() => {
      const db = this.readSync();
      const slots = db.slotsConfig.slots || [];
      const totalSlots = db.slotsConfig.totalSlots || 2;
      const occupiedSlots = slots.filter((s) => s.isOccupied).length;
      const availableSlots = Math.max(0, totalSlots - occupiedSlots);

      return {
        totalSlots,
        occupiedSlots,
        availableSlots,
        slots,
      };
    });
  }

  // ATOMIC REGISTRATION & SLOT CLAIM
  public async registerLead(payload: {
    name: string;
    phoneNumber: string;
    email: string;
    businessName: string;
    businessCategory: string;
    city: string;
    notes?: string;
    source?: string;
  }): Promise<{
    success: boolean;
    lead: RegisteredLead;
    slotNumber: number;
    remainingSlots: number;
  }> {
    return this.lock(async () => {
      const db = this.readSync();
      const slots = db.slotsConfig.slots;

      // Find first available slot
      const availableSlot = slots.find((s) => !s.isOccupied);
      if (!availableSlot) {
        throw new Error('All registration slots are currently occupied. Please check back shortly or contact the administrator.');
      }

      const newLeadId = `lead-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const slotNum = availableSlot.slotNumber;

      // Occupy slot
      availableSlot.isOccupied = true;
      availableSlot.claimedBy = payload.name.trim();
      availableSlot.claimedLeadId = newLeadId;
      availableSlot.claimedAt = new Date().toISOString();

      const newLead: RegisteredLead = {
        id: newLeadId,
        name: payload.name.trim(),
        phoneNumber: payload.phoneNumber.trim(),
        email: payload.email.trim(),
        businessName: payload.businessName.trim(),
        businessCategory: payload.businessCategory.trim(),
        city: payload.city.trim(),
        notes: payload.notes?.trim() || '',
        registeredAt: new Date().toISOString(),
        slotNumber: slotNum,
        status: 'New',
        source: payload.source || 'Public Web Form',
      };

      // Add to front of leads list (newest first)
      db.leads = [newLead, ...(db.leads || [])];

      this.writeSync(db);

      const occupiedCount = slots.filter((s) => s.isOccupied).length;
      const remaining = Math.max(0, db.slotsConfig.totalSlots - occupiedCount);

      return {
        success: true,
        lead: newLead,
        slotNumber: slotNum,
        remainingSlots: remaining,
      };
    });
  }

  // ADMIN AUTHENTICATION
  public async authenticateAdmin(
    usernameOrEmail: string,
    passwordAttempt: string
  ): Promise<{ token: string; admin: { id: string; username: string; email: string; role: string } } | null> {
    return this.lock(() => {
      const db = this.readSync();
      const cleanIdent = usernameOrEmail.trim().toLowerCase();

      const admin = db.admins.find(
        (a) => a.username.toLowerCase() === cleanIdent || a.email.toLowerCase() === cleanIdent
      );

      if (!admin) {
        return null;
      }

      const computedHash = hashPassword(passwordAttempt, admin.salt);
      if (computedHash !== admin.passwordHash) {
        return null;
      }

      // Generate session token (valid for 7 days)
      const token = generateToken();
      const session: AdminSession = {
        token,
        adminId: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Remove expired sessions & keep active ones
      const now = new Date().toISOString();
      db.sessions = [...(db.sessions || []).filter((s) => s.expiresAt > now), session];

      this.writeSync(db);

      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      };
    });
  }

  public async verifySession(token: string): Promise<AdminSession | null> {
    return this.lock(() => {
      if (!token) return null;
      const db = this.readSync();
      const now = new Date().toISOString();

      const session = db.sessions.find((s) => s.token === token && s.expiresAt > now);
      return session || null;
    });
  }

  public async invalidateSession(token: string): Promise<void> {
    return this.lock(() => {
      const db = this.readSync();
      db.sessions = (db.sessions || []).filter((s) => s.token !== token);
      this.writeSync(db);
    });
  }

  // ADMIN LEADS MANAGEMENT
  public async getLeads(options?: {
    search?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    leads: RegisteredLead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.lock(() => {
      const db = this.readSync();
      let list = [...(db.leads || [])];

      // Sort newest first
      list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

      // Search filter
      if (options?.search) {
        const query = options.search.toLowerCase().trim();
        list = list.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.phoneNumber.toLowerCase().includes(query) ||
            l.email.toLowerCase().includes(query) ||
            l.businessName.toLowerCase().includes(query) ||
            l.city.toLowerCase().includes(query) ||
            l.businessCategory.toLowerCase().includes(query)
        );
      }

      // Status filter
      if (options?.status && options.status !== 'All') {
        list = list.filter((l) => l.status === options.status);
      }

      // Category filter
      if (options?.category && options.category !== 'All') {
        list = list.filter((l) =>
          l.businessCategory.toLowerCase().includes(options.category!.toLowerCase())
        );
      }

      const total = list.length;
      const page = Math.max(1, options?.page || 1);
      const limit = Math.max(1, options?.limit || 10);
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);

      return {
        leads: paginated,
        total,
        page,
        limit,
        totalPages,
      };
    });
  }

  public async updateLead(
    id: string,
    updates: Partial<Pick<RegisteredLead, 'status' | 'notes' | 'name' | 'phoneNumber' | 'email'>>
  ): Promise<RegisteredLead | null> {
    return this.lock(() => {
      const db = this.readSync();
      const index = db.leads.findIndex((l) => l.id === id);
      if (index === -1) return null;

      db.leads[index] = {
        ...db.leads[index],
        ...updates,
      };

      this.writeSync(db);
      return db.leads[index];
    });
  }

  public async deleteLead(id: string): Promise<boolean> {
    return this.lock(() => {
      const db = this.readSync();
      const initialLen = db.leads.length;
      db.leads = db.leads.filter((l) => l.id !== id);

      // Also if any slot references this lead, release it
      db.slotsConfig.slots.forEach((s) => {
        if (s.claimedLeadId === id) {
          s.isOccupied = false;
          s.claimedBy = null;
          s.claimedLeadId = null;
          s.claimedAt = null;
        }
      });

      this.writeSync(db);
      return db.leads.length < initialLen;
    });
  }

  // ADMIN SLOTS MANAGEMENT
  public async resetSlots(specificSlotNumber?: number): Promise<SlotsConfig> {
    return this.lock(() => {
      const db = this.readSync();

      if (specificSlotNumber) {
        const target = db.slotsConfig.slots.find((s) => s.slotNumber === specificSlotNumber);
        if (target) {
          target.isOccupied = false;
          target.claimedBy = null;
          target.claimedLeadId = null;
          target.claimedAt = null;
        }
      } else {
        // Reset all slots
        db.slotsConfig.slots.forEach((s) => {
          s.isOccupied = false;
          s.claimedBy = null;
          s.claimedLeadId = null;
          s.claimedAt = null;
        });
        db.slotsConfig.lastResetAt = new Date().toISOString();
      }

      this.writeSync(db);
      return db.slotsConfig;
    });
  }

  public async toggleSlotStatus(slotNumber: number): Promise<SlotItem | null> {
    return this.lock(() => {
      const db = this.readSync();
      const slot = db.slotsConfig.slots.find((s) => s.slotNumber === slotNumber);
      if (!slot) return null;

      if (slot.isOccupied) {
        slot.isOccupied = false;
        slot.claimedBy = null;
        slot.claimedLeadId = null;
        slot.claimedAt = null;
      } else {
        slot.isOccupied = true;
        slot.claimedBy = 'Admin Reserved';
        slot.claimedLeadId = null;
        slot.claimedAt = new Date().toISOString();
      }

      this.writeSync(db);
      return slot;
    });
  }

  // ADMIN STATS
  public async getAdminStats(): Promise<{
    totalLeads: number;
    availableSlots: number;
    occupiedSlots: number;
    totalSlots: number;
    recentLeads: RegisteredLead[];
    statusBreakdown: Record<string, number>;
    slots: SlotItem[];
  }> {
    return this.lock(() => {
      const db = this.readSync();
      const leads = db.leads || [];
      const totalLeads = leads.length;

      const slots = db.slotsConfig.slots || [];
      const totalSlots = db.slotsConfig.totalSlots || 2;
      const occupiedSlots = slots.filter((s) => s.isOccupied).length;
      const availableSlots = Math.max(0, totalSlots - occupiedSlots);

      const sorted = [...leads].sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
      const recentLeads = sorted.slice(0, 5);

      const statusBreakdown: Record<string, number> = {
        New: 0,
        Contacted: 0,
        'In Progress': 0,
        Qualified: 0,
        Closed: 0,
        Archived: 0,
      };

      leads.forEach((l) => {
        if (statusBreakdown[l.status] !== undefined) {
          statusBreakdown[l.status]++;
        } else {
          statusBreakdown['New']++;
        }
      });

      return {
        totalLeads,
        availableSlots,
        occupiedSlots,
        totalSlots,
        recentLeads,
        statusBreakdown,
        slots,
      };
    });
  }
}

export const db = Database.getInstance();
