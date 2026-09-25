import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Admin Auth Middleware
async function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const session = await db.verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  (req as any).adminSession = session;
  next();
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// GET /api/slots -> Returns live slot counts and statuses
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await db.getSlotsStatus();
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch slots' });
  }
});

// POST /api/leads/register -> Validates & atomically allocates slot in persistent backend DB
app.post('/api/leads/register', async (req, res) => {
  try {
    const { name, phoneNumber, email, businessName, businessCategory, city, notes } = req.body;

    // Server-side validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (minimum 2 characters).' });
    }
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 7) {
      return res.status(400).json({ error: 'Please enter a valid contact phone number (minimum 7 digits).' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your business or establishment name.' });
    }
    if (!businessCategory || typeof businessCategory !== 'string') {
      return res.status(400).json({ error: 'Please select a business category.' });
    }
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your city or locality.' });
    }

    const result = await db.registerLead({
      name,
      phoneNumber,
      email,
      businessName,
      businessCategory,
      city,
      notes,
      source: 'Public Web Registration Form',
    });

    res.status(201).json({
      success: true,
      message: `Registration confirmed! Slot #${result.slotNumber} successfully claimed.`,
      lead: result.lead,
      slotNumber: result.slotNumber,
      remainingSlots: result.remainingSlots,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/admin/login -> Secure admin authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    const auth = await db.authenticateAdmin(usernameOrEmail, password);
    if (!auth) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify username/email and password.' });
    }

    res.json({
      success: true,
      token: auth.token,
      admin: auth.admin,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Authentication error.' });
  }
});

// GET /api/admin/verify -> Verifies existing admin session token
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  const session = (req as any).adminSession;
  res.json({
    valid: true,
    admin: {
      id: session.adminId,
      username: session.username,
      email: session.email,
    },
  });
});

// POST /api/admin/logout -> Invalidates session token
app.post('/api/admin/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await db.invalidateSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Logout error' });
  }
});

// ==========================================
// ADMIN PROTECTED CRM & LEADS ENDPOINTS
// ==========================================

// GET /api/admin/leads -> Get paginated, filtered registered leads (newest first)
app.get('/api/admin/leads', requireAdminAuth, async (req, res) => {
  try {
    const { search, status, category, page, limit } = req.query;
    const result = await db.getLeads({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      category: category ? String(category) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 10,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch registered leads.' });
  }
});

// GET /api/admin/stats -> Get admin dashboard stats
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch stats.' });
  }
});

// POST /api/admin/slots/reset -> Reopen/reset slots
app.post('/api/admin/slots/reset', requireAdminAuth, async (req, res) => {
  try {
    const { slotNumber } = req.body;
    const specificSlot = slotNumber ? parseInt(String(slotNumber), 10) : undefined;
    const slots = await db.resetSlots(specificSlot);
    res.json({ success: true, slots });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset slots.' });
  }
});

// POST /api/admin/slots/toggle -> Toggle specific slot
app.post('/api/admin/slots/toggle', requireAdminAuth, async (req, res) => {
  try {
    const { slotNumber } = req.body;
    if (!slotNumber) return res.status(400).json({ error: 'slotNumber is required' });
    const slot = await db.toggleSlotStatus(parseInt(String(slotNumber), 10));
    res.json({ success: true, slot });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle slot.' });
  }
});

// PUT /api/admin/leads/:id -> Update registered lead
app.put('/api/admin/leads/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, name, phoneNumber, email } = req.body;
    const updated = await db.updateLead(id, { status, notes, name, phoneNumber, email });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true, lead: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update lead.' });
  }
});

// DELETE /api/admin/leads/:id -> Delete registered lead
app.delete('/api/admin/leads/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteLead(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete lead.' });
  }
});

// ==========================================
// VITE SPA INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ANX Leads Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
