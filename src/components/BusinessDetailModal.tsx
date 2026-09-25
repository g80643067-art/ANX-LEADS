import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Clock,
  Bookmark,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { BusinessProfile, OutreachStatus } from '../types/business';
import { generateLeadBriefText } from '../utils/storage';

interface BusinessDetailModalProps {
  business: BusinessProfile | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onUpdateBusiness?: (updated: BusinessProfile) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  onClose,
  isSaved,
  onToggleSave,
  onUpdateBusiness,
}) => {
  const [copied, setCopied] = useState(false);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus>(
    business?.outreachStatus || 'uncontacted'
  );
  const [adminNotes, setAdminNotes] = useState(business?.adminNotes || '');
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);

  if (!business) return null;

  const handleCopyLead = async () => {
    const brief = generateLeadBriefText(business);
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSaveOutreachUpdates = () => {
    if (!onUpdateBusiness) return;
    const updated: BusinessProfile = {
      ...business,
      outreachStatus,
      adminNotes,
    };
    onUpdateBusiness(updated);
    setSavedNotesMessage(true);
    setTimeout(() => setSavedNotesMessage(false), 3000);
  };

  const handleVerifyToggle = () => {
    if (!onUpdateBusiness) return;
    const updated: BusinessProfile = {
      ...business,
      isVerifiedStorefront: !business.isVerifiedStorefront,
      verifiedDate: !business.isVerifiedStorefront ? new Date().toISOString().split('T')[0] : undefined,
    };
    onUpdateBusiness(updated);
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${business.address}, ${business.city}, ${business.state} ${business.zip}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Image / Banner */}
        <div className="relative h-56 sm:h-64 bg-stone-900 overflow-hidden">
          {business.image ? (
            <img
              src={business.image}
              alt={business.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
              <span className="text-4xl">🏪</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            {!business.hasWebsite ? (
              <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                No Website · High Prospect
              </span>
            ) : (
              <span className="bg-stone-800/90 text-stone-200 text-xs font-medium px-2.5 py-1 rounded-md shadow-sm">
                Has Website
              </span>
            )}

            {business.isInternational && (
              <span className="bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <span>🌍 {business.country}</span>
              </span>
            )}

            {business.isVerifiedStorefront ? (
              <span className="bg-emerald-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Storefront</span>
              </span>
            ) : (
              <span className="bg-rose-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Unverified</span>
              </span>
            )}
          </div>

          {/* Title and Metadata on Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs text-amber-300 font-semibold mb-1">
              {business.category}
              {business.establishedYear && ` · Est. ${business.establishedYear}`}
              {business.country && ` · ${business.country}`}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {business.name}
            </h2>
            <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>
                {business.address}, {business.city}, {business.state} {business.zip ? `· ${business.zip}` : ''}, {business.country || 'India'}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="bg-stone-100/80 px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {/* Call */}
            <a
              href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Call ({business.phone})</span>
            </a>

            {/* Directions */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-medium transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Directions</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Lead */}
            <button
              onClick={() => onToggleSave(business.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSaved
                  ? 'bg-amber-400 border-amber-500 text-stone-950 font-semibold'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-stone-950' : ''}`} />
              <span>{isSaved ? 'Saved Lead' : 'Save Lead'}</span>
            </button>

            {/* Copy Lead Brief */}
            <button
              onClick={handleCopyLead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-medium transition-colors"
              title="Copy structured lead summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              About This Business
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed">{business.description}</p>
          </div>

          {/* Digital Presence & Lead Opportunity Section (Core Value) */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Lead Intelligence & Digital Presence</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Assessment for web design, marketing, and local directory outreach
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-stone-500">Lead Score:</span>
                <span
                  className={`ml-1.5 text-xs font-bold px-2 py-0.5 rounded ${
                    business.leadOpportunityScore === 'High'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {business.leadOpportunityScore} Opportunity
                </span>
              </div>
            </div>

            {/* Opportunity reason */}
            <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-700 leading-relaxed">
              <span className="font-semibold text-stone-900">Prospect Analysis: </span>
              {business.leadOpportunityReason ||
                (business.hasWebsite
                  ? 'Active digital presence exists.'
                  : 'High volume brick-and-mortar storefront with no website, unmanaged digital menu/catalog, and potential for web design or local SEO outreach.')}
            </div>

            {/* Website link if present */}
            {business.hasWebsite && business.websiteUrl && (
              <div className="text-xs">
                <span className="text-stone-500">Website URL: </span>
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline font-mono inline-flex items-center gap-1"
                >
                  <span>{business.websiteUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Prospect Outreach Tracker Controls */}
            {onUpdateBusiness && (
              <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Outreach Pipeline Status:
                  </label>
                  <select
                    value={outreachStatus}
                    onChange={(e) => setOutreachStatus(e.target.value as OutreachStatus)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-md text-stone-800 font-medium"
                  >
                    <option value="uncontacted">Uncontacted (New Lead)</option>
                    <option value="contacted">Contacted / Cold Call</option>
                    <option value="follow_up">Follow-Up Scheduled</option>
                    <option value="meeting_scheduled">Meeting Scheduled</option>
                    <option value="converted">Converted / Won Client</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Admin / Scout Notes:</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Owner interested in online menu..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-md text-stone-800"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleVerifyToggle}
                    className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
                      business.isVerifiedStorefront
                        ? 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                        : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500'
                    }`}
                  >
                    {business.isVerifiedStorefront ? 'Mark as Unverified' : 'Verify Physical Storefront'}
                  </button>

                  <div className="flex items-center gap-2">
                    {savedNotesMessage && (
                      <span className="text-xs text-emerald-600 font-semibold">Saved!</span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveOutreachUpdates}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded text-xs transition-colors"
                    >
                      Update Lead Status
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operating Hours Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Operating Hours</span>
            </h4>
            <div className="bg-stone-50 rounded-xl border border-stone-200 divide-y divide-stone-200/80 overflow-hidden text-xs">
              {business.hours.map((h) => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const isToday = days[new Date().getDay()] === h.day;
                return (
                  <div
                    key={h.day}
                    className={`flex items-center justify-between px-3.5 py-2 ${
                      isToday ? 'bg-amber-50/70 font-semibold text-amber-950' : 'text-stone-700'
                    }`}
                  >
                    <span className="w-28">{h.day}</span>
                    <span className="font-mono tabular-nums">
                      {h.isClosed ? (
                        <span className="text-stone-400 font-normal">Closed</span>
                      ) : (
                        `${h.open} – ${h.close}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Business Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
              <div className="font-bold text-stone-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Owner / Decision Maker</span>
              </div>
              <div className="text-stone-800 font-medium">
                {business.ownerName || 'Not specified (Walk-in or call inquiry)'}
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
              <div className="font-bold text-stone-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span>Accepted Payment Methods</span>
              </div>
              <div className="text-stone-800 font-medium">
                {business.paymentMethods && business.paymentMethods.length > 0
                  ? business.paymentMethods.join(', ')
                  : 'Cash / Standard Cards'}
              </div>
            </div>
          </div>

          {/* Tags / Services */}
          {business.tags && business.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Services & Specialties
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
                {business.tags.map((tag, i) => (
                  <span key={tag}>
                    {tag}
                    {i < business.tags.length - 1 && <span className="ml-1.5 text-stone-400">·</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
