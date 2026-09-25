/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu as MenuIcon,
  Bookmark,
  Bell,
  Sparkles,
  Search,
  Users,
  MessageSquare,
  BarChart3,
  Settings as SettingsIcon,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { BusinessLeadItem } from './types/lead';
import { BusinessProfile } from './types/business';
import { SlotsStatusResponse, RegisteredLead } from './types/admin';
import { fetchSlotsStatus } from './services/adminService';
import { getStoredBusinesses, getSavedLeadIds, saveSavedLeadIds } from './utils/storage';
import {
  getPersistedSavedLeads,
  persistSavedLeads,
  getPersistedLastSearchResults,
  persistLastSearchResults,
} from './utils/leadExport';
import { leadItemToBusinessProfile } from './utils/seedLeadAdapter';
import { Sidebar, NavPage } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BusinessLeadFinder } from './components/BusinessLeadFinder';
import { MenuTemplatesView } from './components/MenuTemplatesView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { SavedLeadsDrawer } from './components/SavedLeadsDrawer';
import { LeadDetailModal } from './components/LeadDetailModal';
import { AdminPortal } from './components/AdminPortal';
import { PublicRegistrationModal } from './components/PublicRegistrationModal';
import { Lock } from 'lucide-react';

export default function App() {
  // Check URL for /admin route
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname === '/admin' ||
        window.location.hash === '#/admin' ||
        window.location.search.includes('view=admin')
      );
    }
    return false;
  });

  // Navigation State
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Leads & CRM state synced with localStorage
  const [leads, setLeads] = useState<BusinessLeadItem[]>(() => {
    return getPersistedLastSearchResults();
  });

  const [savedLeads, setSavedLeads] = useState<BusinessLeadItem[]>(() => {
    return getPersistedSavedLeads();
  });

  // Slot and Public Registration State
  const [slotsStatus, setSlotsStatus] = useState<SlotsStatusResponse | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // Modals & Drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<BusinessLeadItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Google Maps quota exceeded flag
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Route Synchronization
  useEffect(() => {
    const handlePopState = () => {
      const isAdm =
        window.location.pathname === '/admin' ||
        window.location.hash === '#/admin' ||
        window.location.search.includes('view=admin');
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToAdmin = () => {
    setIsAdminRoute(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const navigateToPublic = () => {
    setIsAdminRoute(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  // Load Slot Status from Backend
  const refreshSlots = async () => {
    try {
      const data = await fetchSlotsStatus();
      setSlotsStatus(data);
    } catch (err) {
      console.warn('Slot status query warning:', err);
    }
  };

  useEffect(() => {
    refreshSlots();
    const interval = setInterval(refreshSlots, 15000); // 15s live sync
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Listen for saved leads & search changes from BusinessLeadFinder / other views
  useEffect(() => {
    const handleSyncSaved = () => {
      setSavedLeads(getPersistedSavedLeads());
    };
    const handleSyncSearch = () => {
      setLeads(getPersistedLastSearchResults());
    };

    window.addEventListener('anx_leads_saved_changed', handleSyncSaved);
    window.addEventListener('anx_leads_search_changed', handleSyncSearch);
    window.addEventListener('storage', handleSyncSaved);
    window.addEventListener('storage', handleSyncSearch);

    return () => {
      window.removeEventListener('anx_leads_saved_changed', handleSyncSaved);
      window.removeEventListener('anx_leads_search_changed', handleSyncSearch);
      window.removeEventListener('storage', handleSyncSaved);
      window.removeEventListener('storage', handleSyncSearch);
    };
  }, []);

  // Convert saved leads for SavedLeadsDrawer
  const savedBusinessesForDrawer: BusinessProfile[] = useMemo(() => {
    return savedLeads.map(leadItemToBusinessProfile);
  }, [savedLeads]);

  // Lead Save / Unsave handler from Dashboard or Modals
  const handleToggleSaveLead = (targetLead: BusinessLeadItem) => {
    const exists = savedLeads.some(
      (l) =>
        l.id === targetLead.id ||
        (targetLead.placeId && l.placeId === targetLead.placeId) ||
        (l.placeId && targetLead.id === `seed-${l.placeId}`)
    );

    let updatedList: BusinessLeadItem[];
    if (exists) {
      updatedList = savedLeads.filter(
        (l) =>
          l.id !== targetLead.id &&
          (!targetLead.placeId || l.placeId !== targetLead.placeId)
      );
    } else {
      updatedList = [
        { ...targetLead, isSaved: true, savedAt: new Date().toISOString() },
        ...savedLeads.filter((l) => l.id !== targetLead.id),
      ];
    }

    setSavedLeads(updatedList);
    persistSavedLeads(updatedList);

    // Update leads list isSaved flag
    setLeads((prev) =>
      prev.map((l) =>
        l.id === targetLead.id || (targetLead.placeId && l.placeId === targetLead.placeId)
          ? { ...l, isSaved: !exists }
          : l
      )
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anx_leads_saved_changed', {
          detail: { savedLeads: updatedList },
        })
      );
    }
  };

  // Remove single lead from Saved Leads Drawer
  const handleRemoveSavedFromDrawer = (id: string) => {
    const updated = savedLeads.filter(
      (l) => l.id !== id && l.placeId !== id && `seed-${l.placeId}` !== id
    );
    setSavedLeads(updated);
    persistSavedLeads(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anx_leads_saved_changed', {
          detail: { savedLeads: updated },
        })
      );
    }
  };

  // Clear all saved leads
  const handleClearAllSaved = () => {
    setSavedLeads([]);
    persistSavedLeads([]);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anx_leads_saved_changed', {
          detail: { savedLeads: [] },
        })
      );
    }
  };

  // Open Lead Detail
  const handleOpenLeadDetail = (lead: BusinessLeadItem) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  // Update lead from Detail Modal
  const handleUpdateLead = (updated: BusinessLeadItem) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSavedLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  // Get Page Title & Subtitle for Top Bar
  const getPageHeaderInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Dashboard Overview',
          subtitle: 'Real-time pipeline metrics & high-opportunity prospects',
          icon: LayoutDashboard,
        };
      case 'leads':
        return {
          title: 'Leads & Discovery Sheet',
          subtitle: 'Search, filter, contact & export verified local businesses',
          icon: Users,
        };
      case 'menu':
        return {
          title: 'WhatsApp Message Templates (Menu)',
          subtitle: 'Category-specific pre-written WhatsApp pitch messages',
          icon: MessageSquare,
        };
      case 'analytics':
        return {
          title: 'Analytics & Pipeline Performance',
          subtitle: 'Website presence ratio, conversion stages & category breakdown',
          icon: BarChart3,
        };
      case 'settings':
        return {
          title: 'System Settings & API Configuration',
          subtitle: 'Google Places API connection, dialing codes & storage tools',
          icon: SettingsIcon,
        };
    }
  };

  const headerInfo = getPageHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  const handleRegisteredSuccess = (lead: RegisteredLead, slotNumber: number) => {
    refreshSlots();
  };

  // If user is accessing /admin route, render secure Admin Portal
  if (isAdminRoute) {
    return <AdminPortal onBackToPublicWebsite={navigateToPublic} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-row font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Fixed Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        savedLeadsCount={savedLeads.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        totalLeadsCount={leads.length}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Map connection notice if limit reached */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs text-center sticky top-0 z-40 shadow-xs font-medium">
            <span>
              Map data service rate limit reached. Search listings and offline database remain fully operational.
            </span>
          </div>
        )}

        {/* Top App Bar / Breadcrumb */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Current Page Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                <HeaderIcon className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-none">
                  {headerInfo.title}
                </h1>
                <p className="text-[11px] text-stone-500 hidden sm:block mt-0.5">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-2">
            {/* Open Slot Claim Trigger Button */}
            <button
              type="button"
              onClick={() => setIsRegistrationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-2xs cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-stone-950 animate-pulse" />
              <span className="hidden sm:inline">Claim Slot</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-stone-950 text-amber-400 font-mono">
                {slotsStatus?.availableSlots ?? 2}/2
              </span>
            </button>

            {/* Quick Saved Leads Trigger */}
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 shadow-2xs cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span className="hidden md:inline">Saved</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 font-mono">
                {savedLeads.length}
              </span>
            </button>

            {/* Admin Portal Direct Trigger */}
            <button
              type="button"
              onClick={navigateToAdmin}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
              title="Open Secure Admin Portal"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <DashboardView
              leads={leads}
              savedLeads={savedLeads}
              onNavigate={setActivePage}
              onSelectLead={handleOpenLeadDetail}
              onToggleSaveLead={handleToggleSaveLead}
              slotsStatus={slotsStatus}
              onOpenRegistration={() => setIsRegistrationModalOpen(true)}
            />
          )}

          {activePage === 'leads' && (
            <div className="space-y-6">
              <BusinessLeadFinder initialLeads={leads} />
            </div>
          )}

          {activePage === 'menu' && (
            <MenuTemplatesView />
          )}

          {activePage === 'analytics' && (
            <AnalyticsView leads={leads} savedLeads={savedLeads} />
          )}

          {activePage === 'settings' && (
            <SettingsView
              leads={leads}
              savedLeads={savedLeads}
              onResetData={() => {
                setSavedLeads(getPersistedSavedLeads());
              }}
            />
          )}
        </main>
      </div>

      {/* Saved Leads Shortlist Drawer */}
      <SavedLeadsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedBusinesses={savedBusinessesForDrawer}
        onRemoveLead={handleRemoveSavedFromDrawer}
        onSelectBusiness={(biz) => {
          const leadMatch = leads.find((l) => l.id === biz.id || l.placeId === biz.id);
          if (leadMatch) {
            setSelectedLead(leadMatch);
            setIsDetailModalOpen(true);
          }
        }}
        onClearAll={handleClearAllSaved}
      />

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateLead={handleUpdateLead}
          onToggleSave={handleToggleSaveLead}
          isSaved={savedLeads.some((l) => l.id === selectedLead.id || (selectedLead.placeId && l.placeId === selectedLead.placeId))}
          onDeleteLead={(id) => {
            setLeads((prev) => prev.filter((l) => l.id !== id));
            setSavedLeads((prev) => prev.filter((l) => l.id !== id));
            setIsDetailModalOpen(false);
          }}
          onShowOnMap={() => {
            setActivePage('leads');
            setIsDetailModalOpen(false);
          }}
        />
      )}

      {/* Public Lead Registration Modal with 2 Open Slots */}
      <PublicRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        slotsStatus={slotsStatus}
        onRegisteredSuccess={handleRegisteredSuccess}
      />
    </div>
  );
}
