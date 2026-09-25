import React from 'react';
import {
  Users,
  AlertCircle,
  Bookmark,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  MessageSquare,
  Search,
  Building2,
  ExternalLink,
  CheckCircle2,
  Phone,
  Layers,
  MapPin,
} from 'lucide-react';
import { BusinessLeadItem } from '../types/lead';
import { NavPage } from './Sidebar';
import { ClientContactIcons } from './ClientContactIcons';
import { matchCategoryKey, renderCategoryTemplate, getStoredCategoryTemplates } from '../utils/categoryTemplates';
import { buildWhatsAppCategoryLink } from '../utils/contactUtils';
import { SlotsStatusResponse } from '../types/admin';
import { PublicSlotBanner } from './PublicSlotBanner';

interface DashboardViewProps {
  leads: BusinessLeadItem[];
  savedLeads: BusinessLeadItem[];
  onNavigate: (page: NavPage) => void;
  onSelectLead: (lead: BusinessLeadItem) => void;
  onToggleSaveLead: (lead: BusinessLeadItem) => void;
  slotsStatus?: SlotsStatusResponse | null;
  onOpenRegistration?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  savedLeads,
  onNavigate,
  onSelectLead,
  onToggleSaveLead,
  slotsStatus,
  onOpenRegistration,
}) => {
  // Key Stats calculation
  const totalLeads = leads.length;
  const noWebsiteLeads = leads.filter((l) => l.websiteStatus === 'No Website Found');
  const highOpportunityCount = noWebsiteLeads.length;
  const savedCount = savedLeads.length;
  const inPipelineCount = leads.filter(
    (l) => l.leadStatus === 'Contacted' || l.leadStatus === 'Follow-up' || l.leadStatus === 'Sold'
  ).length;

  // Top high-opportunity leads (no website, top rating)
  const topOpportunities = [...noWebsiteLeads]
    .sort((a, b) => (b.googleRating || 0) - (a.googleRating || 0))
    .slice(0, 5);

  const handleWhatsAppContact = (lead: BusinessLeadItem) => {
    const templates = getStoredCategoryTemplates();
    const categoryKey = matchCategoryKey(lead.category);
    const template = templates[categoryKey];
    const populated = renderCategoryTemplate(template, lead);
    const url = buildWhatsAppCategoryLink(lead.contactNumber, populated, lead.location, lead.country);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white rounded-2xl p-6 border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Outreach & Discovery Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            ANX Leads Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            Streamlined local business intelligence, category-tailored WhatsApp outreach, and lead pipeline tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('leads')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search & Manage Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Public Registration Slot Banner */}
      {onOpenRegistration && (
        <PublicSlotBanner
          slotsStatus={slotsStatus || null}
          onOpenRegistration={onOpenRegistration}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Discovered Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{totalLeads}</span>
            <span className="text-xs text-stone-500 font-medium">In workspace</span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Verified businesses</span>
            <button
              onClick={() => onNavigate('leads')}
              className="text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-0.5"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* High Opportunity Leads */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-gradient-to-b from-amber-50/30 to-transparent shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              No Website (Top Leads)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-900">{highOpportunityCount}</span>
            <span className="text-xs font-bold text-amber-700">
              {totalLeads > 0 ? Math.round((highOpportunityCount / totalLeads) * 100) : 0}% of leads
            </span>
          </div>
          <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Prime website pitch targets</span>
            <span className="font-semibold text-amber-800">High Opportunity</span>
          </div>
        </div>

        {/* Saved CRM Shortlist */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Saved Shortlist
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{savedCount}</span>
            <span className="text-xs text-stone-500 font-medium">Shortlisted</span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Ready for outreach</span>
            <button
              onClick={() => onNavigate('leads')}
              className="text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-0.5"
            >
              Open CRM <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Outreach In Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Outreach Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-stone-900">{inPipelineCount}</span>
            <span className="text-xs text-emerald-700 font-bold">Contacted / Engaged</span>
          </div>
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Active deals tracking</span>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-0.5"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick Card 1: Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-400/80 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
              Lead Finder & Data Sheet
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore the complete leads table with real phone numbers, website detection, and CRM status updates.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-amber-700 group-hover:text-amber-800">
            <span>Open Leads Table</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Quick Card 2: Menu Templates */}
        <div
          onClick={() => onNavigate('menu')}
          className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-emerald-400/80 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
              Category WhatsApp Pitch Templates
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Edit category-specific pre-written WhatsApp messages (Restaurant, Beauty Parlour, Gym, etc.) with variables.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
            <span>Manage 12 Categories</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Quick Card 3: Analytics & Settings */}
        <div
          onClick={() => onNavigate('analytics')}
          className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-blue-400/80 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
              Outreach & Conversion Analytics
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Review market opportunity distribution, website ratio, and outreach conversion pipeline metrics.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-blue-700 group-hover:text-blue-800">
            <span>View Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* High-Opportunity Leads Snapshot */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900">
                Prime Target Prospects (No Website)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                High Conversion Potential
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified local establishments with active operations and Google listings but no website.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('leads')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>View All Leads ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lead items list */}
        <div className="divide-y divide-stone-100">
          {topOpportunities.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              No leads currently found. Navigate to the <strong>Leads</strong> tab to run a discovery search.
            </div>
          ) : (
            topOpportunities.map((lead) => {
              const isSaved = savedLeads.some((l) => l.id === lead.id);
              return (
                <div
                  key={lead.id}
                  className="p-4 sm:px-5 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onSelectLead(lead)}
                        className="text-xs sm:text-sm font-bold text-stone-900 hover:text-amber-700 text-left transition-colors truncate"
                      >
                        {lead.name}
                      </button>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {lead.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        No Website
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{lead.location}</span>
                      </span>
                      {lead.contactNumber && lead.contactNumber !== 'Not Found' && (
                        <span className="flex items-center gap-1 font-mono text-stone-600">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{lead.contactNumber}</span>
                        </span>
                      )}
                      {lead.googleRating && (
                        <span className="text-amber-600 font-bold text-[11px]">
                          ★ {lead.googleRating.toFixed(1)} ({lead.reviewCount || 0} reviews)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onToggleSaveLead(lead)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                        isSaved
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-stone-600 hover:text-stone-900 border-stone-200 hover:bg-stone-50'
                      }`}
                      title={isSaved ? 'Saved in CRM' : 'Save to CRM shortlist'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact(lead)}
                      disabled={!lead.contactNumber || lead.contactNumber === 'Not Found'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lead.contactNumber && lead.contactNumber !== 'Not Found'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.491 1.198.534 1.285.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                      </svg>
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectLead(lead)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
