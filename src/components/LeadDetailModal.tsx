import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Share2,
  Send,
  MessageSquare,
  Mail,
  Instagram,
  Check,
} from 'lucide-react';
import { BusinessLeadItem, LeadLifecycleStatus } from '../types/lead';
import { ClientContactIcons } from './ClientContactIcons';
import {
  hasClientRealPhone,
  hasClientRealEmail,
  hasClientRealInstagram,
} from '../utils/contactUtils';

interface LeadDetailModalProps {
  lead: BusinessLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: BusinessLeadItem) => void;
  onToggleSave: (lead: BusinessLeadItem) => void;
  isSaved?: boolean;
  onDeleteLead: (id: string) => void;
  onShowOnMap: (lead: BusinessLeadItem) => void;
  onOpenOutreach?: (lead: BusinessLeadItem) => void;
  onClientContactAction?: (lead: BusinessLeadItem, channel: 'whatsapp' | 'email' | 'instagram') => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  onToggleSave,
  isSaved: isSavedProp,
  onDeleteLead,
  onShowOnMap,
  onOpenOutreach,
  onClientContactAction,
}) => {
  if (!isOpen || !lead) return null;

  const isLeadSaved = isSavedProp !== undefined ? isSavedProp : !!lead.isSaved;

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [personalNotesText, setPersonalNotesText] = useState(lead.personalNotes || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Email & Instagram editing states
  const [emailInput, setEmailInput] = useState(lead.email || '');
  const [instagramInput, setInstagramInput] = useState(lead.instagramUrl || '');
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);

  useEffect(() => {
    setEmailInput(lead.email || '');
    setInstagramInput(lead.instagramUrl || '');
    setPersonalNotesText(lead.personalNotes || '');
  }, [lead]);

  const handleSaveContactInfo = () => {
    const updated = {
      ...lead,
      email: emailInput.trim() || null,
      instagramUrl: instagramInput.trim() || null,
    };
    onUpdateLead(updated);
    setIsEditingContactInfo(false);
  };

  const handleSaveNotes = () => {
    onUpdateLead({
      ...lead,
      personalNotes: personalNotesText,
    });
    setIsEditingNotes(false);
  };

  const handleStatusChange = (status: LeadLifecycleStatus) => {
    onUpdateLead({
      ...lead,
      leadStatus: status,
    });
  };

  const hasPhone = hasClientRealPhone(lead.contactNumber);
  const hasEmail = hasClientRealEmail(lead.email);
  const hasInstagram = hasClientRealInstagram(lead.instagramUrl);
  const cleanPhone = hasPhone ? lead.contactNumber.replace(/[^0-9+]/g, '') : '';

  const handleTriggerContact = (
    channelOrLead: BusinessLeadItem | ('whatsapp' | 'email' | 'instagram'),
    maybeChannel?: 'whatsapp' | 'email' | 'instagram'
  ) => {
    const channel = typeof channelOrLead === 'string' ? channelOrLead : maybeChannel!;
    if (onClientContactAction) {
      onClientContactAction(lead, channel);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Strip */}
        <div className="p-6 bg-stone-900 text-white flex items-start justify-between relative">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {lead.category}
              </span>
              
              {lead.websiteStatus === 'No Website Found' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-xs">
                  ⚡ High Opportunity: No Website
                </span>
              )}

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                lead.leadStatus === 'New' ? 'bg-stone-700 text-stone-200' :
                lead.leadStatus === 'Contacted' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                lead.leadStatus === 'Interested' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                lead.leadStatus === 'Follow-up' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {lead.leadStatus}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {lead.name}
            </h2>

            <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
              <span className="flex items-center gap-1 text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lead.location}</span>
              </span>

              {lead.googleRating && (
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{lead.googleRating}</span>
                  {lead.reviewCount && <span className="text-stone-400 font-normal">({lead.reviewCount})</span>}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Phone */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Direct Phone</p>
                {hasPhone ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-mono text-xs font-bold text-stone-900 hover:text-amber-700 hover:underline block truncate"
                  >
                    {lead.contactNumber}
                  </a>
                ) : (
                  <p className="text-xs text-stone-400 italic">Not Found</p>
                )}
              </div>
            </div>

            {/* Official Website */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-stone-200 text-stone-700 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Official Website</p>
                {lead.websiteUrl ? (
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{lead.websiteUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span>No Official Website</span>
                  </p>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Business Hours</p>
                <p className="text-xs text-stone-800 line-clamp-2">
                  {lead.openingHours}
                </p>
              </div>
            </div>

            {/* Price & Rating */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Price & Status</p>
                <p className="text-xs text-stone-800">
                  <span className="font-bold">{lead.priceLevel || 'Standard pricing'}</span> · {lead.googleRating ? `${lead.googleRating} ★ (${lead.reviewCount || 0} reviews)` : 'No rating'}
                </p>
              </div>
            </div>
          </div>

          {/* Lifecycle Status Management */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                CRM Lead Stage:
              </label>
              <select
                value={lead.leadStatus}
                onChange={(e) => handleStatusChange(e.target.value as LeadLifecycleStatus)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
              >
                <option value="New">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Client Direct Contact Channels Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500 text-white font-bold">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Direct Client Outreach
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Reach this client directly via WhatsApp, Email, or Instagram with tailored category messaging.
                  </p>
                </div>
              </div>

              {/* Direct Working Contact Icons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Quick Contact:</span>
                <ClientContactIcons
                  lead={lead}
                  onAction={handleTriggerContact}
                  size="md"
                />
              </div>
            </div>

            {/* Direct Contact Channels Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  Client Direct Channels ({[hasPhone, hasEmail, hasInstagram].filter(Boolean).length} Available)
                </span>
                {!isEditingContactInfo ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingContactInfo(true)}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Edit Email & Social
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveContactInfo}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Save Contacts
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingContactInfo(false)}
                      className="text-xs text-stone-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditingContactInfo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-amber-300">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. contact@business.com"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Client Instagram URL / Handle
                    </label>
                    <input
                      type="text"
                      value={instagramInput}
                      onChange={(e) => setInstagramInput(e.target.value)}
                      placeholder="e.g. https://instagram.com/business or @business"
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* WhatsApp */}
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                        WhatsApp
                      </span>
                      {hasPhone ? (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">No Phone</span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-stone-700 truncate">{lead.contactNumber}</span>
                    {hasPhone && (
                      <button
                        type="button"
                        onClick={() => handleTriggerContact('whatsapp')}
                        className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Send WhatsApp</span>
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sky-800 flex items-center gap-1 text-[11px]">
                        Email
                      </span>
                      {hasEmail ? (
                        <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Unlisted</span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-stone-700 truncate">
                      {lead.email || 'Not listed'}
                    </span>
                    {hasEmail ? (
                      <button
                        type="button"
                        onClick={() => handleTriggerContact('email')}
                        className="mt-2 w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Send Email</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingContactInfo(true)}
                        className="mt-2 text-[10px] text-stone-500 hover:text-stone-800 underline"
                      >
                        + Add Email
                      </button>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-800 flex items-center gap-1 text-[11px]">
                        Instagram
                      </span>
                      {hasInstagram ? (
                        <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Unlisted</span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-stone-700 truncate">
                      {lead.instagramUrl || 'Not listed'}
                    </span>
                    {hasInstagram ? (
                      <button
                        type="button"
                        onClick={() => handleTriggerContact('instagram')}
                        className="mt-2 w-full py-1.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-xs transition-opacity"
                      >
                        <span>Open Instagram</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingContactInfo(true)}
                        className="mt-2 text-[10px] text-stone-500 hover:text-stone-800 underline"
                      >
                        + Add Instagram
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Automated Outreach Pitch Banner */}
          {onOpenOutreach && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs">Outreach Assistant</p>
                  <p className="text-[11px] text-stone-600">
                    Generate tailored WhatsApp & Email outreach templates for {lead.name} based on its category & status.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenOutreach(lead)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Outreach Generator</span>
              </button>
            </div>
          )}

          {/* Personal Outreach Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Sales Notes & Outreach History</span>
              </label>

              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  Edit Notes
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalNotesText(lead.personalNotes || '');
                      setIsEditingNotes(false);
                    }}
                    className="text-xs text-stone-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={personalNotesText}
                onChange={(e) => setPersonalNotesText(e.target.value)}
                placeholder="e.g. Called owner on Monday. Interested in digital catalog, follow up next Friday..."
                rows={4}
                className="w-full p-3 text-xs border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 bg-white"
              />
            ) : (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 min-h-[70px]">
                {lead.personalNotes ? (
                  <p className="text-xs text-stone-700 whitespace-pre-wrap">{lead.personalNotes}</p>
                ) : (
                  <p className="text-xs text-stone-400 italic">No notes recorded yet. Click &apos;Edit Notes&apos; to log calls, pitch feedback, or follow-ups.</p>
                )}
              </div>
            )}
          </div>

          {/* Overview & Highlights */}
          {lead.moreDetails && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Profile Overview
              </label>
              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                {lead.moreDetails}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {lead.googleListingUrl && (
              <a
                href={lead.googleListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50"
              >
                <span>Google Maps Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => {
                onShowOnMap(lead);
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50"
            >
              <MapPin className="w-3.5 h-3.5 text-stone-600" />
              <span>Show On Map</span>
            </button>

            {onOpenOutreach && (
              <button
                type="button"
                onClick={() => onOpenOutreach(lead)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outreach Pitch</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                <span className="text-[11px] font-bold text-red-800 px-1">Delete lead?</span>
                <button
                  onClick={() => {
                    onDeleteLead(lead.id);
                    onClose();
                  }}
                  className="px-2 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete this lead"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onToggleSave(lead)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                isLeadSaved
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {isLeadSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-amber-600" />
                  <span>Saved in CRM</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Lead</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
