import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Key,
  LogOut,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Download,
  Trash2,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Calendar,
  Layers,
  LayoutList,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  RegisteredLead,
  LeadStatus,
  AdminStatsResponse,
  AdminUser,
} from '../types/admin';
import {
  loginAdmin,
  verifyAdminSession,
  logoutAdmin,
  fetchAdminStats,
  fetchAdminLeads,
  resetAdminSlots,
  toggleAdminSlot,
  updateAdminLeadStatus,
  deleteAdminLead,
  getStoredAdminUser,
} from '../services/adminService';
import { ALL_BUSINESS_CATEGORIES } from '../utils/categoryTemplates';

interface AdminPortalProps {
  onBackToPublicWebsite?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToPublicWebsite }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'slots'>('dashboard');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [leads, setLeads] = useState<RegisteredLead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Mobile leads view mode toggle (cards vs table)
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Selected Lead for Detail Modal
  const [selectedLead, setSelectedLead] = useState<RegisteredLead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Delete Confirmation Modal State
  const [leadToDelete, setLeadToDelete] = useState<RegisteredLead | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);

  // Slot Reset Confirmation Modal State
  const [slotResetConfirm, setSlotResetConfirm] = useState<{
    isOpen: boolean;
    slotNumber?: number;
  }>({ isOpen: false });
  const [isResettingSlot, setIsResettingSlot] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Body scroll locking when any modal is open
  const isAnyModalOpen = isDetailModalOpen || !!leadToDelete || slotResetConfirm.isOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isAnyModalOpen]);

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsVerifyingAuth(true);
      try {
        const isValid = await verifyAdminSession();
        setIsAuthenticated(isValid);
        if (isValid) {
          const user = getStoredAdminUser();
          if (user) setCurrentAdmin(user);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsVerifyingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch Dashboard Stats & Leads when authenticated
  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const statsData = await fetchAdminStats();
      setStats(statsData);

      const leadsData = await fetchAdminLeads({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
        page: currentPage,
        limit: pageSize,
      });

      setLeads(leadsData.leads);
      setTotalLeads(leadsData.total);
      setTotalPages(leadsData.totalPages);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      if (err.message && err.message.includes('Unauthorized')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, currentPage, statusFilter, categoryFilter]);

  // Debounced search
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadDashboardData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const result = await loginAdmin(loginUsername, loginPassword);
      setIsAuthenticated(true);
      setCurrentAdmin(result.admin);
      setLoginPassword('');
      showToast('Admin authentication successful. Welcome!');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    showToast('Logged out successfully.');
  };

  // Open Slot Reset Confirmation
  const openResetSlotsModal = (slotNumber?: number) => {
    setSlotResetConfirm({ isOpen: true, slotNumber });
  };

  // Confirm Slot Reset
  const handleConfirmResetSlots = async () => {
    setIsResettingSlot(true);
    try {
      await resetAdminSlots(slotResetConfirm.slotNumber);
      await loadDashboardData();
      showToast(
        slotResetConfirm.slotNumber
          ? `Slot #${slotResetConfirm.slotNumber} has been reopened.`
          : 'All 2 slots have been reset to available.'
      );
      setSlotResetConfirm({ isOpen: false });
    } catch (err: any) {
      showToast(err.message || 'Failed to reset slot.');
    } finally {
      setIsResettingSlot(false);
    }
  };

  // Handle Slot Toggle
  const handleToggleSlot = async (slotNumber: number) => {
    try {
      await toggleAdminSlot(slotNumber);
      await loadDashboardData();
      showToast(`Slot #${slotNumber} status updated.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle slot.');
    }
  };

  // Handle Status Change on a Lead
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateAdminLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Lead status updated to ${newStatus}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.');
    }
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (lead: RegisteredLead) => {
    setLeadToDelete(lead);
  };

  // Confirm Delete Lead
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeletingLead(true);
    try {
      await deleteAdminLead(leadToDelete.id);
      await loadDashboardData();
      if (selectedLead?.id === leadToDelete.id) {
        setIsDetailModalOpen(false);
        setSelectedLead(null);
      }
      showToast(`Lead "${leadToDelete.name}" removed from database.`);
      setLeadToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete lead.');
    } finally {
      setIsDeletingLead(false);
    }
  };

  // Save Notes on Lead
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      const updated = await updateAdminLeadStatus(selectedLead.id, selectedLead.status, editingNotes);
      setSelectedLead(updated);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast('Lead notes saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Export Registered Leads to CSV
  const handleExportCsv = () => {
    if (leads.length === 0) {
      showToast('No registered leads to export.');
      return;
    }

    const headers = [
      'Lead ID',
      'Registrant Name',
      'Phone Number',
      'Email',
      'Business Name',
      'Business Category',
      'City / Location',
      'Slot Number',
      'Lead Status',
      'Registered At',
      'Notes',
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phoneNumber}"`,
      `"${l.email}"`,
      `"${(l.businessName || '').replace(/"/g, '""')}"`,
      `"${(l.businessCategory || '').replace(/"/g, '""')}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      l.slotNumber,
      l.status,
      `"${l.registeredAt}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ANX_Registered_Leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported registered leads to CSV.');
  };

  // Format Date Nicely
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Direct WhatsApp Link
  const buildWhatsAppLink = (phone: string, name: string, biz: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${name}, thank you for registering ${biz} on ANX Leads. We are following up regarding your digital setup and consultation slot.`
    );
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
  };

  // Direct Tel Link
  const buildTelLink = (phone: string) => {
    return `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  // Render Verification Loading
  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3 text-stone-300">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs font-mono">Verifying secure admin authorization...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-stone-100 flex flex-col justify-center items-center p-4 sm:p-6">
        
        {/* Top Back Link */}
        {onBackToPublicWebsite && (
          <div className="w-full max-w-md mb-4 flex justify-start">
            <button
              type="button"
              onClick={onBackToPublicWebsite}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold border border-stone-800 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Public Website</span>
            </button>
          </div>
        )}

        <div className="max-w-md w-full space-y-5 sm:space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 font-black text-xl">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              ANX Leads Admin Portal
            </h1>
            <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
              Secure authentication required to manage registered leads, slot allocations, and database records.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-stone-900/95 rounded-3xl p-5 sm:p-7 border border-stone-800 shadow-2xl backdrop-blur-md space-y-5">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="leading-snug">{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="admin@anxleads.com or admin"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Authenticate & Access Leads</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-stone-800/80 text-center">
              <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Protected by Server Auth & Database Persistence</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 text-center text-xs text-stone-400">
            <span>Admin credentials default: </span>
            <span className="font-mono text-amber-400 font-bold">admin</span> / <span className="font-mono text-amber-400 font-bold">Admin@ANX2026!</span>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // 2. AUTHENTICATED ADMIN PORTAL
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl border border-amber-500/50 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-3 pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navbar (Fully Responsive) */}
      <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Left Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white truncate">
                  ANX Leads <span className="text-amber-400">Admin</span>
                </h1>
                <span className="hidden xs:inline-flex px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  Live DB
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden sm:block truncate">
                Logged in as <strong className="text-stone-300">{currentAdmin?.email || 'Admin'}</strong>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Public Website Switcher */}
            {onBackToPublicWebsite && (
              <button
                type="button"
                onClick={onBackToPublicWebsite}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] sm:text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                title="Return to Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Public Website</span>
                <span className="md:hidden">Site</span>
              </button>
            )}

            {/* Refresh Data */}
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700 cursor-pointer disabled:opacity-50"
              title="Refresh database records"
              aria-label="Refresh database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white text-[11px] sm:text-xs font-bold border border-red-800/60 transition-colors cursor-pointer"
              title="Log out from Admin session"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        
        {/* Navigation Tabs Bar & Mobile Layout Switcher */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 gap-2 flex-wrap">
          
          {/* Tabs Group */}
          <div className="flex items-center gap-1 sm:gap-2 bg-stone-900 p-1 rounded-2xl border border-stone-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Leads ({totalLeads})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slots')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'slots'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Slots ({stats?.availableSlots ?? 2} Open)</span>
            </button>
          </div>

          {/* Quick Actions (Export CSV + Mobile View Switcher) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeTab === 'leads' && (
              <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    mobileViewMode === 'cards'
                      ? 'bg-stone-800 text-amber-400 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Card View"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    mobileViewMode === 'table'
                      ? 'bg-stone-800 text-amber-400 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Table View (Scrollable)"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            TAB 1: OVERVIEW / DASHBOARD
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Total Leads */}
              <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
                    Total Registered Leads
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-stone-800 text-amber-400 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">{stats?.totalLeads ?? 0}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> Persistent DB
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Permanent records saved in backend
                </p>
              </div>

              {/* Available Slots */}
              <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
                    Available Slots
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/40 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {stats?.availableSlots ?? 2} <span className="text-sm text-stone-500">/ 2</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Public Open
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Ready for instant web registrations
                </p>
              </div>

              {/* Occupied Slots */}
              <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
                    Occupied Slots
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center border border-amber-800/40 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">
                    {stats?.occupiedSlots ?? 0} <span className="text-sm text-stone-500">/ 2</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => openResetSlotsModal()}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Reset Slots
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Currently claimed by registrants
                </p>
              </div>

              {/* Pipeline Breakdown */}
              <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400">
                    New / Uncontacted
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-stone-800 text-stone-300 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {stats?.statusBreakdown?.New ?? 0}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">Needs Outreach</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Awaiting WhatsApp contact
                </p>
              </div>

            </div>

            {/* Two Open Slots Control Panel */}
            <div className="bg-stone-900 rounded-2xl p-4 sm:p-6 border border-stone-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-amber-500 text-stone-950">
                      <Clock className="w-4 h-4" />
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      Live Two-Slot Concurrency & Reservation Manager
                    </h2>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Control public availability. When a visitor submits the registration form, their slot locks immediately in the database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openResetSlotsModal()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer min-h-[42px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Both Slots to Open</span>
                  </button>
                </div>
              </div>

              {/* Slot 1 & Slot 2 Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
                
                {/* Slot 1 */}
                {(() => {
                  const slot1 = stats?.slots?.find((s) => s.slotNumber === 1);
                  const isOccupied = slot1?.isOccupied;
                  return (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isOccupied
                          ? 'bg-stone-950/80 border-amber-500/40 shadow-xs'
                          : 'bg-stone-950/40 border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-stone-800 text-amber-400 border border-stone-700">
                            Slot #1
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isOccupied
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {isOccupied ? 'Occupied' : '🟢 Open for Registration'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openResetSlotsModal(1)}
                          className="text-[11px] font-semibold text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer py-1.5 px-2.5 rounded-xl bg-stone-900 border border-stone-800"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen #1</span>
                        </button>
                      </div>

                      <div className="mt-3.5 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span className="text-stone-500">Claimant:</span>
                          <span className="font-bold text-stone-200 truncate max-w-[180px]">
                            {slot1?.claimedBy || 'None (Open)'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span className="text-stone-500">Claimed At:</span>
                          <span className="font-mono text-stone-300 text-[11px]">
                            {slot1?.claimedAt ? formatDate(slot1.claimedAt) : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-stone-500">Manual Toggle:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSlot(1)}
                            className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            {isOccupied ? 'Release Slot' : 'Lock / Reserve'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Slot 2 */}
                {(() => {
                  const slot2 = stats?.slots?.find((s) => s.slotNumber === 2);
                  const isOccupied = slot2?.isOccupied;
                  return (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isOccupied
                          ? 'bg-stone-950/80 border-amber-500/40 shadow-xs'
                          : 'bg-stone-950/40 border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-stone-800 text-amber-400 border border-stone-700">
                            Slot #2
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isOccupied
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {isOccupied ? 'Occupied' : '🟢 Open for Registration'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openResetSlotsModal(2)}
                          className="text-[11px] font-semibold text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer py-1.5 px-2.5 rounded-xl bg-stone-900 border border-stone-800"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen #2</span>
                        </button>
                      </div>

                      <div className="mt-3.5 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span className="text-stone-500">Claimant:</span>
                          <span className="font-bold text-stone-200 truncate max-w-[180px]">
                            {slot2?.claimedBy || 'None (Open)'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span className="text-stone-500">Claimed At:</span>
                          <span className="font-mono text-stone-300 text-[11px]">
                            {slot2?.claimedAt ? formatDate(slot2.claimedAt) : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-stone-500">Manual Toggle:</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSlot(2)}
                            className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                          >
                            {isOccupied ? 'Release Slot' : 'Lock / Reserve'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Recent Leads Preview */}
            <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-md space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">Recent Registrations</h3>
                  <p className="text-[11px] text-stone-400">Latest leads submitted via public registration form</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('leads')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({totalLeads})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-stone-800">
                {stats?.recentLeads?.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-500">
                    No registered leads in database yet.
                  </div>
                ) : (
                  stats?.recentLeads?.map((lead) => (
                    <div key={lead.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white truncate">{lead.name}</span>
                          <span className="px-2 py-0.2 rounded text-[10px] bg-stone-800 text-stone-300">
                            {lead.businessCategory}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                            Slot #{lead.slotNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span>{lead.businessName} • {lead.city}</span>
                          <span className="font-mono text-stone-500">{lead.phoneNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lead.status === 'New'
                              ? 'bg-blue-500/20 text-blue-300'
                              : lead.status === 'Contacted'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {lead.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={buildTelLink(lead.phoneNumber)}
                            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Call Lead"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={buildWhatsAppLink(lead.phoneNumber, lead.name, lead.businessName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="WhatsApp Registrant"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setEditingNotes(lead.notes || '');
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="View Lead Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: REGISTERED LEADS (Fully Responsive Cards on Mobile + Table on Desktop)
            ========================================== */}
        {(activeTab === 'leads' || activeTab === 'slots') && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-800 shadow-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                
                {/* Search Input */}
                <div className="sm:col-span-1 lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Name, Phone, Email, City..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {ALL_BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-1 flex-wrap gap-2">
                <span>
                  Showing <strong>{leads.length}</strong> of <strong>{totalLeads}</strong> leads
                </span>
                <span className="font-mono text-[11px] text-stone-500">
                  Newest First • Slot Concurrency Protected
                </span>
              </div>
            </div>

            {/* A. MOBILE RESPONSIVE CARDS VIEW (< lg screens or when cards mode is active) */}
            <div className={`space-y-3 ${mobileViewMode === 'cards' ? 'block lg:hidden' : 'hidden'}`}>
              {leads.length === 0 ? (
                <div className="bg-stone-900 rounded-2xl border border-stone-800 p-8 text-center text-xs text-stone-500">
                  {isLoadingData ? (
                    <div className="flex items-center justify-center gap-2 text-stone-400">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Loading leads from backend...</span>
                    </div>
                  ) : (
                    <span>No registered leads found matching your criteria.</span>
                  )}
                </div>
              ) : (
                leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-stone-900 rounded-2xl p-4 border border-stone-800 shadow-md space-y-3 transition-all"
                  >
                    {/* Card Top: Name, Business, Slot badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-white truncate">{lead.name}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Slot #{lead.slotNumber}
                          </span>
                        </div>
                        <div className="text-xs text-stone-300 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{lead.businessName}</span>
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none cursor-pointer shrink-0 ${
                          lead.status === 'New'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                            : lead.status === 'Contacted'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : lead.status === 'In Progress'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                            : lead.status === 'Qualified'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : 'bg-stone-800 text-stone-400 border-stone-700'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    {/* Card Body: Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
                      <div className="flex items-center gap-2 text-stone-300">
                        <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span className="font-mono">{lead.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-400 truncate">
                        <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-400">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{lead.city} • <strong className="text-stone-300">{lead.businessCategory}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-500 text-[11px] font-mono">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDate(lead.registeredAt)}</span>
                      </div>
                    </div>

                    {/* Notes Preview if available */}
                    {lead.notes && (
                      <div className="text-[11px] text-stone-400 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60 line-clamp-2">
                        <span className="font-semibold text-stone-300">Notes: </span>
                        {lead.notes}
                      </div>
                    )}

                    {/* Card Action Bar (Touch Friendly, No Hidden Controls) */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-1">
                        {/* WhatsApp Button */}
                        <a
                          href={buildWhatsAppLink(lead.phoneNumber, lead.name, lead.businessName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors min-h-[40px]"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Call Button */}
                        <a
                          href={buildTelLink(lead.phoneNumber)}
                          className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* View / Edit Notes */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(lead);
                            setEditingNotes(lead.notes || '');
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer min-h-[40px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Delete Lead (Custom Modal) */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(lead)}
                          className="p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white transition-colors border border-red-900/60 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* B. DESKTOP / TABLET DATA TABLE VIEW (Visible on lg+ screens or when toggled) */}
            <div className={`bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden ${mobileViewMode === 'table' ? 'block' : 'hidden lg:block'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[760px]">
                  
                  <thead className="bg-stone-950 text-stone-400 text-[10px] font-bold uppercase tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3.5 px-4">Registrant & Business</th>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Category & City</th>
                      <th className="py-3.5 px-4">Registered Date</th>
                      <th className="py-3.5 px-4">Slot</th>
                      <th className="py-3.5 px-4">Lead Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-800">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-500">
                          {isLoadingData ? (
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                              <span>Loading registered leads from backend database...</span>
                            </div>
                          ) : (
                            <span>No registered leads found matching your criteria.</span>
                          )}
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-stone-850/60 transition-colors">
                          
                          {/* Registrant Name & Business */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{lead.name}</span>
                              </div>
                              <div className="text-[11px] text-stone-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="truncate max-w-[160px]">{lead.businessName}</span>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info (Phone & Email) */}
                          <td className="py-3.5 px-4 font-mono text-stone-300">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-stone-200">
                                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <span>{lead.phoneNumber}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-sans">
                                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <span className="truncate max-w-[140px]">{lead.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category & City */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-200 border border-stone-700">
                                {lead.businessCategory}
                              </span>
                              <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                <span>{lead.city}</span>
                              </div>
                            </div>
                          </td>

                          {/* Registered Timestamp */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">
                            {formatDate(lead.registeredAt)}
                          </td>

                          {/* Slot Badge */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
                              Slot #{lead.slotNumber}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                                lead.status === 'New'
                                  ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                                  : lead.status === 'Contacted'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                  : lead.status === 'In Progress'
                                  ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                                  : lead.status === 'Qualified'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                  : 'bg-stone-800 text-stone-400 border-stone-700'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Closed">Closed</option>
                              <option value="Archived">Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Pitch Action */}
                              <a
                                href={buildWhatsAppLink(lead.phoneNumber, lead.name, lead.businessName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors"
                                title="Open WhatsApp Chat"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>

                              {/* Call Action */}
                              <a
                                href={buildTelLink(lead.phoneNumber)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                                title="Call Lead"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* View / Edit Notes */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setEditingNotes(lead.notes || '');
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                                title="View Lead Details & Notes"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete (Custom Modal) */}
                              <button
                                type="button"
                                onClick={() => openDeleteModal(lead)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>

            {/* Pagination Controls (Fully Responsive) */}
            {totalPages > 1 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
                <div className="text-center sm:text-left">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalLeads} total records)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 transition-colors flex items-center gap-1 cursor-pointer min-h-[38px]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-200 transition-colors flex items-center gap-1 cursor-pointer min-h-[38px]"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ==========================================
          POPUP 1: LEAD DETAIL & NOTES MODAL (Mobile-First, Scrollable, Sticky Headers/Footers)
          ========================================== */}
      {isDetailModalOpen && selectedLead && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailModalOpen(false);
          }}
        >
          <div className="bg-stone-900 rounded-3xl shadow-2xl max-w-xl w-full border border-stone-800 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Sticky Modal Header */}
            <div className="sticky top-0 z-10 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-stone-800 bg-stone-950/95 backdrop-blur-sm flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0 shadow-xs">
                  <User className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">{selectedLead.name}</h3>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      Slot #{selectedLead.slotNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">{selectedLead.businessName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 space-y-4 text-xs">
              {/* Quick Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stone-950/70 rounded-2xl border border-stone-800">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Current Pipeline Stage:
                </span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 border border-stone-700 text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Closed">Closed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* Lead Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-stone-950 p-3.5 sm:p-4 rounded-2xl border border-stone-800">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Contact Number:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-mono font-bold text-stone-200">{selectedLead.phoneNumber}</p>
                    <a
                      href={buildTelLink(selectedLead.phoneNumber)}
                      className="text-[10px] text-amber-400 hover:underline ml-1"
                    >
                      (Call)
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Email Address:</span>
                  <p className="font-semibold text-stone-200 truncate mt-0.5">{selectedLead.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Business Category:</span>
                  <p className="font-semibold text-stone-200 mt-0.5">{selectedLead.businessCategory}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">City / Location:</span>
                  <p className="font-semibold text-stone-200 mt-0.5">{selectedLead.city}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Registration Slot:</span>
                  <p className="font-mono font-bold text-amber-400 mt-0.5">Slot #{selectedLead.slotNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Registered Timestamp:</span>
                  <p className="font-mono text-stone-300 text-[11px] mt-0.5">{formatDate(selectedLead.registeredAt)}</p>
                </div>
              </div>

              {/* Notes Input Area */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1.5">
                  Admin Internal Notes & Follow-up Log:
                </label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes about client discussion, requirements, website quotes, or consultation feedback..."
                  className="w-full p-3 bg-stone-950 border border-stone-800 rounded-2xl text-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none placeholder-stone-600"
                />
              </div>

              {/* Quick Outreach Links */}
              <div className="p-3 bg-stone-950/60 rounded-2xl border border-stone-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className="text-stone-400">Direct Outreach:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppLink(selectedLead.phoneNumber, selectedLead.name, selectedLead.businessName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Pitch</span>
                  </a>
                  <a
                    href={`mailto:${selectedLead.email}?subject=Follow-up%20from%20ANX%20Leads`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-[11px] transition-colors border border-stone-700"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div className="sticky bottom-0 z-10 px-4 py-3.5 sm:px-6 sm:py-4 border-t border-stone-800 bg-stone-950/95 backdrop-blur-sm flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openDeleteModal(selectedLead);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/80 text-red-300 font-semibold text-xs border border-red-900/60 transition-colors cursor-pointer min-h-[42px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer min-h-[42px]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 min-h-[42px]"
                >
                  {isSavingNotes ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          POPUP 2: DELETE CONFIRMATION MODAL (Responsive, Safe & Touch-Friendly)
          ========================================== */}
      {leadToDelete && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingLead) setLeadToDelete(null);
          }}
        >
          <div className="bg-stone-900 rounded-3xl shadow-2xl max-w-md w-full border border-red-900/60 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">Confirm Permanent Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeletingLead}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <p className="text-stone-300 leading-relaxed">
                Are you sure you want to permanently delete this registered lead from the server database? This action cannot be undone.
              </p>

              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-1.5 text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-500">Registrant:</span>
                  <span className="font-bold text-white">{leadToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Business:</span>
                  <span className="font-semibold text-stone-200">{leadToDelete.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone Number:</span>
                  <span className="font-mono text-stone-200">{leadToDelete.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Slot Claimed:</span>
                  <span className="font-mono font-bold text-amber-400">Slot #{leadToDelete.slotNumber}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-800 bg-stone-950 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeletingLead}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer min-h-[42px] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingLead}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors min-h-[42px] disabled:opacity-50"
              >
                {isDeletingLead ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeletingLead ? 'Deleting from DB...' : 'Delete Permanently'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          POPUP 3: SLOT RESET CONFIRMATION MODAL (Responsive & Touch-Friendly)
          ========================================== */}
      {slotResetConfirm.isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResettingSlot) {
              setSlotResetConfirm({ isOpen: false });
            }
          }}
        >
          <div className="bg-stone-900 rounded-3xl shadow-2xl max-w-md w-full border border-stone-800 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {slotResetConfirm.slotNumber ? `Reopen Slot #${slotResetConfirm.slotNumber}` : 'Reset Both Slots to Open'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSlotResetConfirm({ isOpen: false })}
                disabled={isResettingSlot}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white cursor-pointer transition-colors shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <p className="text-stone-300 leading-relaxed">
                {slotResetConfirm.slotNumber
                  ? `Are you sure you want to release Slot #${slotResetConfirm.slotNumber}? It will immediately become open for new website visitors to claim.`
                  : 'Are you sure you want to reset both Slot #1 and Slot #2 to open status? This clears active claims and opens slots for immediate public registration.'}
              </p>

              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 text-stone-400 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Existing registered leads are kept safely in database</span>
                </div>
                <p className="text-[11px] text-stone-500 pl-5.5">
                  Resetting slots only updates public availability and does not erase lead history.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-800 bg-stone-950 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSlotResetConfirm({ isOpen: false })}
                disabled={isResettingSlot}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer min-h-[42px] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmResetSlots}
                disabled={isResettingSlot}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors min-h-[42px] disabled:opacity-50"
              >
                {isResettingSlot ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isResettingSlot ? 'Updating Slots...' : 'Confirm & Open Slot'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
