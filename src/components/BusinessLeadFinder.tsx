import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Globe,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  MessageSquare,
  Info,
  ArrowUpDown,
  Building2,
  Phone,
  Clock,
  Bookmark,
  BookmarkCheck,
  Eye,
  SlidersHorizontal,
  X,
  Plus,
} from 'lucide-react';
import { BusinessLeadItem, LeadLifecycleStatus, VerifiedWebsiteStatus } from '../types/lead';
import { searchGooglePlaces, hasApiKey } from '../services/googlePlacesService';
import { exportLeadsToCsv, exportLeadsToExcel, getPersistedSavedLeads, persistSavedLeads, getPersistedLastSearchResults, persistLastSearchResults } from '../utils/leadExport';
import { RealLeadMap } from './RealLeadMap';
import { LeadDetailModal } from './LeadDetailModal';
import { OutreachAssistantModal } from './OutreachAssistantModal';
import { CategoryTemplateModal } from './CategoryTemplateModal';
import { ClientContactIcons } from './ClientContactIcons';
import {
  BusinessCategoryKey,
  ALL_BUSINESS_CATEGORIES,
  DEFAULT_CATEGORY_WHATSAPP_TEMPLATES,
  getStoredCategoryTemplates,
  saveStoredCategoryTemplates,
  saveCategoryTemplate,
  resetCategoryTemplate,
  matchCategoryKey,
  renderCategoryTemplate,
} from '../utils/categoryTemplates';
import {
  buildWhatsAppCategoryLink,
  buildEmailMailtoLink,
  getInstagramPitchMessage,
  formatInstagramProfileUrl,
  hasClientRealPhone,
  hasClientRealEmail,
  hasClientRealInstagram,
} from '../utils/contactUtils';

interface BusinessLeadFinderProps {
  initialLeads?: BusinessLeadItem[];
}

export const BusinessLeadFinder: React.FC<BusinessLeadFinderProps> = () => {
  // Navigation mode inside Lead Finder: 'all_results' or 'saved_crm'
  const [activeSubTab, setActiveSubTab] = useState<'all_results' | 'saved_crm'>('all_results');

  // Search Query Inputs
  const [searchCity, setSearchCity] = useState('Prayagraj');
  const [searchArea, setSearchArea] = useState('Civil Lines');
  const [searchCategory, setSearchCategory] = useState('Restaurant');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Main Lead Results & CRM state
  const [leads, setLeads] = useState<BusinessLeadItem[]>(() => {
    return getPersistedLastSearchResults();
  });

  const [savedLeads, setSavedLeads] = useState<BusinessLeadItem[]>(() => {
    return getPersistedSavedLeads();
  });

  // Category WhatsApp Templates State
  const [categoryTemplates, setCategoryTemplates] = useState<Record<BusinessCategoryKey, string>>(() => {
    return getStoredCategoryTemplates();
  });
  const [activeCategoryModal, setActiveCategoryModal] = useState<BusinessCategoryKey | null>(null);

  // Sync category templates to storage
  useEffect(() => {
    saveStoredCategoryTemplates(categoryTemplates);
  }, [categoryTemplates]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccessNotice, setSearchSuccessNotice] = useState<string | null>(null);

  // Selected Lead for Map & Detail Modal
  const [selectedLead, setSelectedLead] = useState<BusinessLeadItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Outreach Assistant Modal State
  const [outreachLead, setOutreachLead] = useState<BusinessLeadItem | null>(null);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);

  // In-sheet search and filter bar
  const [tableSearch, setTableSearch] = useState('');
  const [filterWebsiteStatus, setFilterWebsiteStatus] = useState<string>('all');
  const [filterLeadStatus, setFilterLeadStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Table Column Sorting
  const [sortField, setSortField] = useState<'rating' | 'reviews' | 'category' | 'location' | 'status' | 'name' | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Direct Inline edit cell
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineNotesValue, setInlineNotesValue] = useState('');

  // Lead deletion confirmation state
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Floating Toast Notification
  const [toastNotification, setToastNotification] = useState<{
    text: string;
    type: 'warning' | 'success' | 'info';
  } | null>(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Sync saved leads to localStorage
  useEffect(() => {
    persistSavedLeads(savedLeads);
  }, [savedLeads]);

  // Listen for saved leads changes from other parts of the application
  useEffect(() => {
    const handleSyncSavedLeads = () => {
      const freshSaved = getPersistedSavedLeads();
      setSavedLeads(freshSaved);
    };
    window.addEventListener('anx_leads_saved_changed', handleSyncSavedLeads);
    window.addEventListener('storage', handleSyncSavedLeads);
    return () => {
      window.removeEventListener('anx_leads_saved_changed', handleSyncSavedLeads);
      window.removeEventListener('storage', handleSyncSavedLeads);
    };
  }, []);

  // Sync search results to localStorage
  useEffect(() => {
    persistLastSearchResults(leads);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anx_leads_search_changed', {
          detail: { leads },
        })
      );
    }
  }, [leads]);

  // Handle template save from modal
  const handleSaveCategoryTemplate = (cat: BusinessCategoryKey, updatedTemplate: string) => {
    const updated = saveCategoryTemplate(cat, updatedTemplate);
    setCategoryTemplates({ ...updated });
    setToastNotification({
      text: `Saved custom WhatsApp template for ${cat}`,
      type: 'success',
    });
  };

  // Handle template reset to default
  const handleResetCategoryTemplate = (cat: BusinessCategoryKey) => {
    const updated = resetCategoryTemplate(cat);
    setCategoryTemplates({ ...updated });
    setToastNotification({
      text: `Restored original default message for ${cat}`,
      type: 'info',
    });
  };

  // Check if a lead is saved in the CRM
  const isLeadSaved = (leadId: string) => {
    if (!leadId) return false;
    return savedLeads.some(
      (l) =>
        l.id === leadId ||
        (l.placeId && l.placeId === leadId) ||
        (leadId.startsWith('seed-') && l.placeId && `seed-${l.placeId}` === leadId)
    );
  };

  // Save / Unsave Lead
  const handleToggleSave = (targetLead: BusinessLeadItem) => {
    const currentlySaved = isLeadSaved(targetLead.id);
    let nextSavedList: BusinessLeadItem[];

    if (currentlySaved) {
      nextSavedList = savedLeads.filter(
        (l) =>
          l.id !== targetLead.id &&
          (!targetLead.placeId || l.placeId !== targetLead.placeId) &&
          (!l.placeId || targetLead.id !== `seed-${l.placeId}`)
      );
      setToastNotification({
        text: `Removed "${targetLead.name}" from Saved Leads.`,
        type: 'info',
      });
    } else {
      const savedItem: BusinessLeadItem = {
        ...targetLead,
        isSaved: true,
        savedAt: new Date().toISOString(),
      };
      nextSavedList = [
        savedItem,
        ...savedLeads.filter(
          (l) =>
            l.id !== targetLead.id &&
            (!targetLead.placeId || l.placeId !== targetLead.placeId)
        ),
      ];
      setToastNotification({
        text: `Saved "${targetLead.name}" to Saved Leads!`,
        type: 'success',
      });
    }

    setSavedLeads(nextSavedList);
    persistSavedLeads(nextSavedList);

    // Update targetLead in leads array
    setLeads((prev) =>
      prev.map((l) =>
        l.id === targetLead.id || (targetLead.placeId && l.placeId === targetLead.placeId)
          ? { ...l, isSaved: !currentlySaved }
          : l
      )
    );

    // Update selectedLead if currently open in modal
    if (
      selectedLead &&
      (selectedLead.id === targetLead.id ||
        (targetLead.placeId && selectedLead.placeId === targetLead.placeId))
    ) {
      setSelectedLead({
        ...selectedLead,
        isSaved: !currentlySaved,
      });
    }

    // Dispatch global event for header and drawers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anx_leads_saved_changed', {
          detail: { savedLeads: nextSavedList },
        })
      );
    }
  };

  // Update lead item in either list
  const handleUpdateLead = (updated: BusinessLeadItem) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSavedLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    if (selectedLead && selectedLead.id === updated.id) {
      setSelectedLead(updated);
    }
  };

  // Delete lead from list
  const confirmDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSavedLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
    }
    setDeleteCandidateId(null);
    setToastNotification({
      text: 'Lead removed from current sheet.',
      type: 'info',
    });
  };

  // Direct Contact Action Implementation for WhatsApp, Email, Instagram
  const handleClientContactAction = (
    lead: BusinessLeadItem,
    channel: 'whatsapp' | 'email' | 'instagram'
  ) => {
    if (channel === 'whatsapp') {
      if (!hasClientRealPhone(lead.contactNumber)) {
        setToastNotification({
          text: 'No WhatsApp number available for this business.',
          type: 'warning',
        });
        return;
      }

      // 1. Detect lead's category
      const matchedCategory = matchCategoryKey(lead.category);

      // 2. Load that category's saved WhatsApp message
      const template =
        categoryTemplates[matchedCategory] ||
        DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[matchedCategory] ||
        DEFAULT_CATEGORY_WHATSAPP_TEMPLATES['Other'];

      // 3. Replace supported variables: {business_name} and {category}
      const populatedMessage = renderCategoryTemplate(template, lead);

      // 4. Use client's real phone/WhatsApp number with proper country code
      const waLink = buildWhatsAppCategoryLink(
        lead.contactNumber,
        populatedMessage,
        lead.location,
        lead.country
      );

      if (!waLink) {
        setToastNotification({
          text: `Cannot format phone number "${lead.contactNumber}". Please check the digits.`,
          type: 'warning',
        });
        return;
      }

      // 5. Open WhatsApp with pre-filled category template message
      window.open(waLink, '_blank', 'noopener,noreferrer');

      setToastNotification({
        text: `WhatsApp opened for ${lead.name} (${matchedCategory} template)`,
        type: 'success',
      });

      if (lead.leadStatus === 'New' || lead.leadStatus === 'Follow-up') {
        handleUpdateLead({ ...lead, leadStatus: 'Contacted' });
      }
    } else if (channel === 'email') {
      if (!hasClientRealEmail(lead.email)) {
        setToastNotification({
          text: `No verified client email registered for ${lead.name}.`,
          type: 'warning',
        });
        return;
      }
      const mailto = buildEmailMailtoLink(lead.email!, lead.name);
      window.location.href = mailto;
      setToastNotification({
        text: `Email composer opened for ${lead.name}`,
        type: 'success',
      });
      if (lead.leadStatus === 'New') {
        handleUpdateLead({ ...lead, leadStatus: 'Contacted' });
      }
    } else if (channel === 'instagram') {
      if (!hasClientRealInstagram(lead.instagramUrl)) {
        setToastNotification({
          text: `No Instagram profile found for ${lead.name}.`,
          type: 'warning',
        });
        return;
      }
      const igMessage = getInstagramPitchMessage(lead.name, lead.category);
      navigator.clipboard.writeText(igMessage).catch((err) => {
        console.warn('Clipboard write failed, fallback', err);
      });

      const igUrl = formatInstagramProfileUrl(lead.instagramUrl!);
      window.open(igUrl, '_blank', 'noopener,noreferrer');

      setToastNotification({
        text: 'Message copied — paste it into Instagram DM.',
        type: 'info',
      });

      if (lead.leadStatus === 'New') {
        handleUpdateLead({ ...lead, leadStatus: 'Contacted' });
      }
    }
  };

  // Perform Google Places Lead Search
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setSearchError(null);
    setSearchSuccessNotice(null);

    try {
      const results = await searchGooglePlaces({
        city: searchCity.trim(),
        area: searchArea.trim(),
        category: searchCategory.trim(),
        keyword: searchKeyword.trim(),
      });

      if (results.length === 0) {
        setSearchError(`No business profiles found in ${searchCity}. Try another area or category.`);
      } else {
        setLeads(results);
        setActiveSubTab('all_results');
        const noWebsiteCount = results.filter((r) => r.websiteStatus === 'No Website Found').length;
        setSearchSuccessNotice(
          `Discovered ${results.length} leads in ${searchCity}. ${noWebsiteCount} have no website listed!`
        );
      }
    } catch (err) {
      console.error('Lead search error:', err);
      setSearchError('Search failed. Please verify your connection or Google Places API parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  // Current working lead dataset
  const currentWorkingSet = activeSubTab === 'saved_crm' ? savedLeads : leads;

  // Filter and Sort leads for spreadsheet display
  const displayedLeads = useMemo(() => {
    let result = [...currentWorkingSet];

    // Filter by table search string
    if (tableSearch.trim() !== '') {
      const q = tableSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.contactNumber.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.personalNotes && l.personalNotes.toLowerCase().includes(q)) ||
          l.moreDetails.toLowerCase().includes(q)
      );
    }

    // Filter by website status
    if (filterWebsiteStatus !== 'all') {
      result = result.filter((l) => l.websiteStatus === filterWebsiteStatus);
    }

    // Filter by lead lifecycle status
    if (filterLeadStatus !== 'all') {
      result = result.filter((l) => l.leadStatus === filterLeadStatus);
    }

    // Filter by business category
    if (filterCategory !== 'all') {
      result = result.filter((l) => l.category.toLowerCase() === filterCategory.toLowerCase());
    }

    // Apply Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortField === 'rating') {
          valA = a.googleRating ?? -1;
          valB = b.googleRating ?? -1;
        } else if (sortField === 'reviews') {
          valA = a.reviewCount ?? -1;
          valB = b.reviewCount ?? -1;
        } else if (sortField === 'category') {
          valA = a.category.toLowerCase();
          valB = b.category.toLowerCase();
        } else if (sortField === 'location') {
          valA = a.location.toLowerCase();
          valB = b.location.toLowerCase();
        } else if (sortField === 'status') {
          valA = a.leadStatus;
          valB = b.leadStatus;
        } else if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [currentWorkingSet, tableSearch, filterWebsiteStatus, filterLeadStatus, filterCategory, sortField, sortAsc]);

  // Unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    currentWorkingSet.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set).sort();
  }, [currentWorkingSet]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = currentWorkingSet.length;
    const noWebsite = currentWorkingSet.filter((l) => l.websiteStatus === 'No Website Found').length;
    const withPhone = currentWorkingSet.filter((l) => hasClientRealPhone(l.contactNumber)).length;
    const contacted = currentWorkingSet.filter((l) => l.leadStatus === 'Contacted').length;
    const interested = currentWorkingSet.filter((l) => l.leadStatus === 'Interested' || l.leadStatus === 'Sold').length;

    return { total, noWebsite, withPhone, contacted, interested };
  }, [currentWorkingSet]);

  const handleSortColumn = (field: 'rating' | 'reviews' | 'category' | 'location' | 'status' | 'name') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    const filename = `anx_leads_${activeSubTab}_${new Date().toISOString().split('T')[0]}.csv`;
    exportLeadsToCsv(displayedLeads, filename);
  };

  const handleExportExcel = () => {
    const filename = `anx_leads_${activeSubTab}_${new Date().toISOString().split('T')[0]}.xls`;
    exportLeadsToExcel(displayedLeads, filename);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Search Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Local Business Leads & CRM
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Search verified local businesses, identify high-value prospects without websites, and initiate direct outreach with category-tailored templates.
            </p>
          </div>

          {/* Quick Sub-Tab Switcher: Search Results vs Saved CRM */}
          <div className="inline-flex bg-stone-950/80 p-1 rounded-xl border border-stone-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('all_results')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'all_results'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Search Results ({leads.length})
            </button>
            <button
              onClick={() => setActiveSubTab('saved_crm')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'saved_crm'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved CRM ({savedLeads.length})</span>
            </button>
          </div>
        </div>

        {/* Search Filter Form */}
        <form onSubmit={handleExecuteSearch} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* City */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Target City
            </label>
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="e.g. Prayagraj, Lucknow, Delhi"
              required
              className="w-full px-3 py-2 text-xs bg-stone-800 text-stone-100 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
            />
          </div>

          {/* Area / Locality */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Locality / Area
            </label>
            <input
              type="text"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="e.g. Civil Lines, Gomti Nagar"
              className="w-full px-3 py-2 text-xs bg-stone-800 text-stone-100 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Business Category
            </label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-800 text-stone-100 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {ALL_BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Keyword */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Keyword (Optional)
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="e.g. Dhaba, Bakery, Bridal"
              className="w-full px-3 py-2 text-xs bg-stone-800 text-stone-100 border border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
            />
          </div>

          {/* Submit Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Find Businesses</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Connection & Workspace Status Banner */}
        <div className="mt-3.5 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasApiKey() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>
              {hasApiKey()
                ? 'Live Business Directory Connected'
                : 'Verified Local Business Database Active'}
            </span>
          </div>

          <span className="text-[11px] text-stone-400">
            Workspace: {currentWorkingSet.length} Leads in View | {stats.noWebsite} Without Website
          </span>
        </div>
      </div>

      {/* Category WhatsApp Message Templates Area */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.491 1.198.534 1.285.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Category Templates
              </h2>
              <p className="text-[11px] text-stone-400">
                Click <strong className="text-amber-400">[+]</strong> next to any category to edit its pre-written WhatsApp pitch message.
              </p>
            </div>
          </div>

          <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
            Variables: <code className="text-amber-400">{'{business_name}'}</code>, <code className="text-amber-400">{'{category}'}</code>
          </span>
        </div>

        {/* Category List with [+] Button */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALL_BUSINESS_CATEGORIES.map((categoryKey) => {
            const isCustom = categoryTemplates[categoryKey] !== DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[categoryKey];
            return (
              <button
                key={categoryKey}
                type="button"
                onClick={() => setActiveCategoryModal(categoryKey)}
                className="group flex items-center justify-between px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700/80 hover:border-amber-500/60 transition-all text-xs font-semibold cursor-pointer shadow-2xs text-left"
                title={`Edit pre-written WhatsApp message for ${categoryKey}`}
              >
                <span className="truncate mr-1.5">{categoryKey}</span>
                <span className="shrink-0 font-mono font-bold text-amber-400 bg-stone-950/70 group-hover:bg-amber-500 group-hover:text-stone-950 px-1.5 py-0.5 rounded text-[11px] border border-stone-700 group-hover:border-transparent transition-colors">
                  +
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {searchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{searchError}</span>
        </div>
      )}

      {searchSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{searchSuccessNotice}</span>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Leads</p>
          <p className="text-xl font-black text-stone-900 font-mono">{stats.total}</p>
        </div>

        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <span>⚡ No Website</span>
          </p>
          <p className="text-xl font-black text-amber-900 font-mono">{stats.noWebsite}</p>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">With Direct Phone</p>
          <p className="text-xl font-black text-emerald-900 font-mono">{stats.withPhone}</p>
        </div>

        <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 shadow-2xs">
          <p className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">Contacted</p>
          <p className="text-xl font-black text-sky-900 font-mono">{stats.contacted}</p>
        </div>

        <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Interested / Sold</p>
          <p className="text-xl font-black text-purple-900 font-mono">{stats.interested}</p>
        </div>
      </div>

      {/* Spreadsheet Control Strip */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Live Table Filter Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search table by name, phone, city, notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {displayedLeads.length > 0 && (
              <button
                onClick={() => {
                  const targetLead = selectedLead || displayedLeads[0];
                  setOutreachLead(targetLead);
                  setIsOutreachModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
                title="Generate tailored pitch for selected lead"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outreach Assistant</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              disabled={displayedLeads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 font-bold rounded-lg text-xs transition-colors border border-stone-300"
              title="Export current spreadsheet as CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              disabled={displayedLeads.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
              title="Export current spreadsheet as Excel workbook"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200 text-xs">
          <span className="text-stone-500 flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Website Status Filter */}
          <select
            value={filterWebsiteStatus}
            onChange={(e) => setFilterWebsiteStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Website Statuses</option>
            <option value="No Website Found">⚡ No Website Found Only</option>
            <option value="Website Found">Website Found</option>
            <option value="Needs Verification">Needs Verification</option>
          </select>

          {/* Lead Lifecycle Filter */}
          <select
            value={filterLeadStatus}
            onChange={(e) => setFilterLeadStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All CRM Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Sold">Sold</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(filterWebsiteStatus !== 'all' || filterLeadStatus !== 'all' || filterCategory !== 'all' || tableSearch !== '') && (
            <button
              onClick={() => {
                setFilterWebsiteStatus('all');
                setFilterLeadStatus('all');
                setFilterCategory('all');
                setTableSearch('');
              }}
              className="text-amber-700 hover:text-amber-900 font-bold ml-1 text-xs underline"
            >
              Reset Filters
            </button>
          )}

          {/* Active Results Count */}
          <span className="ml-auto text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{displayedLeads.length}</strong> of{' '}
            {currentWorkingSet.length} rows
          </span>
        </div>
      </div>

      {/* Horizontal Spreadsheet Lead Management Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            {/* Sticky Table Header */}
            <thead className="bg-stone-100 text-stone-700 sticky top-0 z-20 border-b border-stone-200 select-none shadow-xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center font-bold text-stone-600 border-r border-stone-200">
                  S.N.
                </th>

                <th
                  onClick={() => handleSortColumn('name')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Shop Name</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                {/* Contact Column (WhatsApp, Email, Instagram) */}
                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 text-center min-w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Contact Client</span>
                  </div>
                </th>

                <th
                  onClick={() => handleSortColumn('category')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200">
                  Contact Number
                </th>

                <th
                  onClick={() => handleSortColumn('location')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSortColumn('rating')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Google Rating</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                <th
                  onClick={() => handleSortColumn('reviews')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Review Count</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 text-center">
                  Google Listing
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 text-center">
                  Facebook
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 text-center">
                  Instagram
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200">
                  Website
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200">
                  Website Status
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200">
                  Opening Hours
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 min-w-[200px]">
                  More Details / Notes
                </th>

                <th
                  onClick={() => handleSortColumn('status')}
                  className="py-3 px-3 font-bold text-stone-800 border-r border-stone-200 cursor-pointer hover:bg-stone-200/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Lead Status</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>

                <th className="py-3 px-3 font-bold text-stone-800 text-center sticky right-0 bg-stone-100 z-10 shadow-xs">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-stone-200 bg-white">
              {displayedLeads.map((item, index) => {
                const isSelected = selectedLead?.id === item.id;
                const isSaved = isLeadSaved(item.id);
                const hasPhone = hasClientRealPhone(item.contactNumber);
                const cleanPhone = hasPhone ? item.contactNumber.replace(/[^0-9+]/g, '') : '';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-amber-50/40 transition-colors ${
                      isSelected ? 'bg-amber-50/80 font-medium' : ''
                    }`}
                  >
                    {/* S.N. */}
                    <td className="py-2.5 px-3 text-center font-mono text-stone-500 border-r border-stone-200">
                      {index + 1}
                    </td>

                    {/* Shop Name */}
                    <td className="py-2.5 px-3 font-bold text-stone-900 border-r border-stone-200 max-w-[220px] truncate">
                      <button
                        onClick={() => {
                          setSelectedLead(item);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-left hover:text-amber-700 hover:underline flex items-center gap-1"
                        title={item.name}
                      >
                        <span className="truncate">{item.name}</span>
                        {isSaved && <Bookmark className="w-3 h-3 text-amber-600 shrink-0 fill-amber-500" />}
                      </button>
                    </td>

                    {/* Contact Column (WhatsApp, Email, Instagram) */}
                    <td className="py-2.5 px-3 text-center border-r border-stone-200 whitespace-nowrap">
                      <ClientContactIcons
                        lead={item}
                        onAction={handleClientContactAction}
                        size="sm"
                      />
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 border-r border-stone-200">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold text-[11px] border border-stone-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Contact Number */}
                    <td className="py-2.5 px-3 font-mono text-stone-700 border-r border-stone-200">
                      {hasPhone ? (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="hover:text-amber-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{item.contactNumber}</span>
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">Not Found</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 text-stone-700 border-r border-stone-200 max-w-[160px] truncate" title={item.fullAddress || item.location}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </td>

                    {/* Google Rating */}
                    <td className="py-2.5 px-3 text-center font-mono border-r border-stone-200">
                      {item.googleRating !== null ? (
                        <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                          {item.googleRating.toFixed(1)} ★
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Review Count */}
                    <td className="py-2.5 px-3 text-center font-mono text-stone-600 border-r border-stone-200">
                      {item.reviewCount !== null ? item.reviewCount : '—'}
                    </td>

                    {/* Google Listing */}
                    <td className="py-2.5 px-3 text-center border-r border-stone-200">
                      {item.googleListingUrl ? (
                        <a
                          href={item.googleListingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 hover:text-amber-900 underline inline-flex items-center gap-0.5"
                        >
                          <span>Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Facebook */}
                    <td className="py-2.5 px-3 text-center border-r border-stone-200">
                      {item.facebookUrl ? (
                        <a
                          href={item.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          FB
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Instagram */}
                    <td className="py-2.5 px-3 text-center border-r border-stone-200">
                      {item.instagramUrl ? (
                        <a
                          href={formatInstagramProfileUrl(item.instagramUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>IG</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Website */}
                    <td className="py-2.5 px-3 border-r border-stone-200 max-w-[140px] truncate">
                      {item.websiteUrl ? (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:underline truncate block"
                          title={item.websiteUrl}
                        >
                          {item.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>

                    {/* Website Status */}
                    <td className="py-2.5 px-3 border-r border-stone-200">
                      {item.websiteStatus === 'No Website Found' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 inline-block shadow-2xs">
                          ⚡ No Website
                        </span>
                      ) : item.websiteStatus === 'Website Found' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 inline-block">
                          Website Found
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-200 text-stone-700 inline-block">
                          Verify
                        </span>
                      )}
                    </td>

                    {/* Opening Hours */}
                    <td className="py-2.5 px-3 text-stone-600 border-r border-stone-200 max-w-[150px] truncate" title={item.openingHours}>
                      {item.openingHours}
                    </td>

                    {/* More Details / Notes */}
                    <td className="py-2.5 px-3 text-stone-700 border-r border-stone-200 max-w-[240px]">
                      {inlineEditingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={inlineNotesValue}
                            onChange={(e) => setInlineNotesValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateLead({ ...item, personalNotes: inlineNotesValue });
                                setInlineEditingId(null);
                              } else if (e.key === 'Escape') {
                                setInlineEditingId(null);
                              }
                            }}
                            className="w-full px-2 py-1 text-xs border border-amber-400 rounded focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              handleUpdateLead({ ...item, personalNotes: inlineNotesValue });
                              setInlineEditingId(null);
                            }}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setInlineEditingId(item.id);
                            setInlineNotesValue(item.personalNotes || item.moreDetails || '');
                          }}
                          className="cursor-pointer hover:bg-stone-100 p-1 rounded flex items-center justify-between group truncate"
                          title="Click to edit notes"
                        >
                          <span className="truncate">
                            {item.personalNotes || item.moreDetails || (
                              <span className="text-stone-300 italic">+ Add note...</span>
                            )}
                          </span>
                          <Edit2 className="w-2.5 h-2.5 text-stone-400 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                        </div>
                      )}
                    </td>

                    {/* Lead Status Select */}
                    <td className="py-2.5 px-3 border-r border-stone-200">
                      <select
                        value={item.leadStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value as LeadLifecycleStatus;
                          handleUpdateLead({ ...item, leadStatus: newStatus });
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                          item.leadStatus === 'New'
                            ? 'bg-stone-100 text-stone-700 border-stone-300'
                            : item.leadStatus === 'Contacted'
                            ? 'bg-sky-50 text-sky-800 border-sky-300'
                            : item.leadStatus === 'Interested'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : item.leadStatus === 'Follow-up'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Sold">Sold</option>
                      </select>
                    </td>

                    {/* Actions column */}
                    <td className="py-2.5 px-3 text-center sticky right-0 bg-white group-hover:bg-amber-50/40 z-10">
                      <div className="flex items-center justify-center gap-1">
                        {/* Outreach Pitch */}
                        <button
                          onClick={() => {
                            setOutreachLead(item);
                            setIsOutreachModalOpen(true);
                          }}
                          className="p-1 rounded text-amber-600 hover:text-amber-800 hover:bg-amber-100/60 transition-colors"
                          title="Generate WhatsApp or Email outreach pitch"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick View Details */}
                        <button
                          onClick={() => {
                            setSelectedLead(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1 rounded text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                          title="View complete business profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Save Lead */}
                        <button
                          onClick={() => handleToggleSave(item)}
                          className={`p-1 rounded transition-colors ${
                            isSaved
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                          }`}
                          title={isSaved ? 'Remove from Saved CRM' : 'Save in CRM'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Delete Row */}
                        {deleteCandidateId === item.id ? (
                          <div className="flex items-center gap-0.5 bg-red-50 p-0.5 rounded border border-red-200">
                            <button
                              onClick={() => confirmDeleteLead(item.id)}
                              className="text-[10px] bg-red-600 text-white font-bold px-1 rounded hover:bg-red-700"
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setDeleteCandidateId(null)}
                              className="text-[10px] text-stone-500 px-0.5 hover:text-stone-800"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteCandidateId(item.id)}
                            className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {displayedLeads.length === 0 && (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Bookmark className="w-8 h-8 text-amber-400" />
                      {activeSubTab === 'saved_crm' ? (
                        savedLeads.length === 0 ? (
                          <>
                            <p className="font-bold text-stone-800 text-sm">No Saved Leads in CRM Yet</p>
                            <p className="text-xs text-stone-500 max-w-sm">
                              Click the bookmark icon (<Bookmark className="w-3 h-3 inline text-amber-500" />) or &ldquo;Save Lead&rdquo; on any business to shortlist it here.
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveSubTab('all_results')}
                              className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
                            >
                              Browse Search Results ({leads.length})
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-stone-800 text-sm">No saved leads match your active filters</p>
                            <p className="text-xs text-stone-500 max-w-sm">
                              You have {savedLeads.length} saved leads, but your current search or status filter is filtering them out.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setTableSearch('');
                                setFilterWebsiteStatus('all');
                                setFilterLeadStatus('all');
                                setFilterCategory('all');
                              }}
                              className="mt-2 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-semibold rounded-lg text-xs transition-colors"
                            >
                              Clear In-Sheet Filters
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <p className="font-bold text-stone-700 text-sm">No business leads found in this view.</p>
                          <p className="text-xs text-stone-400 max-w-sm">
                            Try searching another city/area above or adjust your active table filters.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Status Strip */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Total in active view: <strong className="text-stone-900">{displayedLeads.length}</strong>
            </span>
            <span>•</span>
            <span>
              No Website Prospects:{' '}
              <strong className="text-amber-800">
                {displayedLeads.filter((l) => l.websiteStatus === 'No Website Found').length}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Auto-saved locally</span>
            <span>•</span>
            <button
              onClick={() => {
                if (window.confirm('Clear all leads from the current view?')) {
                  if (activeSubTab === 'saved_crm') {
                    setSavedLeads([]);
                  } else {
                    setLeads([]);
                  }
                }
              }}
              className="text-stone-500 hover:text-red-600 hover:underline"
            >
              Clear View
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateLead={handleUpdateLead}
        onToggleSave={handleToggleSave}
        isSaved={selectedLead ? isLeadSaved(selectedLead.id) : false}
        onDeleteLead={confirmDeleteLead}
        onShowOnMap={(lead) => {
          setSelectedLead(lead);
        }}
        onOpenOutreach={(lead) => {
          setOutreachLead(lead);
          setIsOutreachModalOpen(true);
        }}
        onClientContactAction={handleClientContactAction}
      />

      {/* Category WhatsApp Template Editor Modal */}
      <CategoryTemplateModal
        category={activeCategoryModal}
        currentTemplate={
          activeCategoryModal
            ? categoryTemplates[activeCategoryModal] || DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[activeCategoryModal]
            : ''
        }
        isOpen={activeCategoryModal !== null}
        onClose={() => setActiveCategoryModal(null)}
        onSave={handleSaveCategoryTemplate}
        onResetToDefault={handleResetCategoryTemplate}
      />

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md ${
              toastNotification.type === 'warning'
                ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold'
                : toastNotification.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                : 'bg-stone-900 text-white border-stone-800'
            }`}
          >
            {toastNotification.type === 'warning' && (
              <AlertCircle className="w-5 h-5 text-stone-950 shrink-0" />
            )}
            {toastNotification.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            )}
            {toastNotification.type === 'info' && (
              <Info className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm">{toastNotification.text}</span>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="ml-auto text-current opacity-70 hover:opacity-100 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Automated Outreach Assistant Modal */}
      <OutreachAssistantModal
        lead={outreachLead}
        isOpen={isOutreachModalOpen}
        onClose={() => setIsOutreachModalOpen(false)}
        onMarkContacted={(updated) => {
          handleUpdateLead(updated);
        }}
      />
    </div>
  );
};
