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
// PUBLIC API ENDPOINTS (2-SLOT REGISTRATION WITH OTP)
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

// POST /api/leads/send-otp -> Step 1 of registration: validates user info & dispatches OTP to WhatsApp
app.post('/api/leads/send-otp', async (req, res) => {
  try {
    const { name, whatsappNumber, phoneNumber, email, password, businessName, businessCategory, city, notes } = req.body;

    const finalPhone = (whatsappNumber || phoneNumber || '').trim();

    // Server-side strict validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your Full Name (minimum 2 characters).' });
    }

    const digitsOnly = finalPhone.replace(/[^0-9]/g, '');
    if (!finalPhone || digitsOnly.length < 8) {
      return res.status(400).json({
        error: 'Please enter a valid WhatsApp number with country code (e.g., +91 98765 43210).',
      });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const result = await db.initiateRegistration({
      name: name.trim(),
      whatsappNumber: finalPhone,
      email: email.trim(),
      password,
      businessName,
      businessCategory,
      city,
      notes,
    });

    res.status(200).json({
      success: true,
      message: `Verification code sent to WhatsApp (${result.maskedWhatsApp}).`,
      sessionId: result.sessionId,
      maskedWhatsApp: result.maskedWhatsApp,
      expiresInSeconds: result.expiresInSeconds,
      cooldownSeconds: result.cooldownSeconds,
      demoOtpPreview: result.demoOtpPreview,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to initiate registration.' });
  }
});

// POST /api/leads/resend-otp -> Resends OTP code to WhatsApp with rate limiting
app.post('/api/leads/resend-otp', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required to resend OTP.' });
    }

    const result = await db.resendRegistrationOtp(sessionId);
    res.json({
      success: true,
      message: 'New verification code dispatched to your WhatsApp number.',
      sessionId: result.sessionId,
      expiresInSeconds: result.expiresInSeconds,
      cooldownSeconds: result.cooldownSeconds,
      demoOtpPreview: result.demoOtpPreview,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to resend verification code.' });
  }
});

// POST /api/leads/verify-otp -> Step 2 of registration: verifies OTP, claims available slot, and securely saves user
app.post('/api/leads/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing registration session.' });
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter the complete 6-digit WhatsApp verification code.' });
    }

    const result = await db.verifyOtpAndClaimSlot(sessionId, otp);

    res.status(201).json({
      success: true,
      message: `WhatsApp verified successfully! Slot #${result.slotNumber} has been secured.`,
      lead: result.lead,
      slotNumber: result.slotNumber,
      remainingSlots: result.remainingSlots,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Verification failed.' });
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
    res.status(500).json({ error: err.message || 'Logout error.' });
  }
});

// ==========================================
// ADMIN PROTECTED DASHBOARD & LEADS API
// ==========================================

// GET /api/admin/stats -> Dashboard metrics & live slot status
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/leads -> Query verified registered leads with filters & pagination
app.get('/api/admin/leads', requireAdminAuth, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);

    const result = await db.getLeads({ search, status, category, page, limit });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch leads' });
  }
});

// PATCH /api/admin/leads/:id -> Update lead status or notes
app.patch('/api/admin/leads/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, name, phoneNumber, whatsappNumber, email } = req.body;

    const updated = await db.updateLead(id, {
      status,
      notes,
      name,
      phoneNumber,
      whatsappNumber,
      email,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found in database.' });
    }

    res.json({ success: true, lead: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update lead' });
  }
});

// DELETE /api/admin/leads/:id -> Permanently delete lead and release slot
app.delete('/api/admin/leads/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteLead(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found or already deleted.' });
    }

    res.json({ success: true, message: 'Lead permanently deleted from database.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete lead' });
  }
});

// POST /api/admin/slots/reset -> Reopen slots (optional slotNumber in body)
app.post('/api/admin/slots/reset', requireAdminAuth, async (req, res) => {
  try {
    const { slotNumber } = req.body;
    const updated = await db.resetSlots(slotNumber ? parseInt(slotNumber, 10) : undefined);
    res.json({
      success: true,
      message: slotNumber ? `Slot #${slotNumber} reopened.` : 'All 2 slots reset to available.',
      slotsConfig: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset slots' });
  }
});

// POST /api/admin/slots/toggle -> Manually lock or release slot
app.post('/api/admin/slots/toggle', requireAdminAuth, async (req, res) => {
  try {
    const { slotNumber } = req.body;
    if (!slotNumber) {
      return res.status(400).json({ error: 'Slot number is required.' });
    }

    const slot = await db.toggleSlotStatus(parseInt(slotNumber, 10));
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found.' });
    }

    res.json({ success: true, slot });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle slot' });
  }
});

// ==========================================
// VITE CLIENT MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ANX Backend] Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
});
