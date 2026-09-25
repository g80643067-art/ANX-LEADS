import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Lightbulb,
  Phone,
  Send,
  Building2,
  RefreshCw,
  HelpCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { BusinessLeadItem, LeadLifecycleStatus } from '../types/lead';
import {
  generateOutreachMessage,
  OutreachChannel,
  OutreachTone,
  OutreachTemplateConfig,
} from '../utils/outreachTemplates';

interface OutreachAssistantModalProps {
  lead: BusinessLeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkContacted?: (lead: BusinessLeadItem) => void;
}

export const OutreachAssistantModal: React.FC<OutreachAssistantModalProps> = ({
  lead,
  isOpen,
  onClose,
  onMarkContacted,
}) => {
  if (!isOpen || !lead) return null;

  // Outreach configuration
  const [channel, setChannel] = useState<OutreachChannel>('whatsapp');
  const [tone, setTone] = useState<OutreachTone>('friendly');
  const [senderName, setSenderName] = useState(() => localStorage.getItem('anx_leads_sender_name') || localStorage.getItem('pro_lead_sender_name') || 'ANX Growth Team');
  const [agencyName, setAgencyName] = useState(() => localStorage.getItem('anx_leads_agency_name') || localStorage.getItem('pro_lead_agency_name') || 'ANX Leads Studio');
  
  // Custom edited message body state
  const [customBody, setCustomBody] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate initial or updated template
  const generated = useMemo(() => {
    return generateOutreachMessage(lead, {
      channel,
      tone,
      senderName,
      agencyName,
    });
  }, [lead, channel, tone, senderName, agencyName]);

  const activeBody = customBody !== null ? customBody : generated.body;

  // Persist Sender Name and Agency Name
  const handleSenderChange = (val: string) => {
    setSenderName(val);
    localStorage.setItem('anx_leads_sender_name', val);
    setCustomBody(null);
  };

  const handleAgencyChange = (val: string) => {
    setAgencyName(val);
    localStorage.setItem('anx_leads_agency_name', val);
    setCustomBody(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetTemplate = () => {
    setCustomBody(null);
  };

  // Construct links with active body
  const cleanPhone = lead.contactNumber ? lead.contactNumber.replace(/[^0-9]/g, '') : '';
  const finalWhatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(activeBody)}`
    : `https://wa.me/?text=${encodeURIComponent(activeBody)}`;

  const finalMailtoUrl = `mailto:?subject=${encodeURIComponent(generated.subject || `Inquiry for ${lead.name}`)}&body=${encodeURIComponent(activeBody)}`;

  const handleLaunchOutreach = () => {
    if (channel === 'whatsapp') {
      window.open(finalWhatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = finalMailtoUrl;
    }

    if (onMarkContacted && (lead.leadStatus === 'New' || lead.leadStatus === 'Follow-up')) {
      onMarkContacted({
        ...lead,
        leadStatus: 'Contacted',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Strip */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 text-white flex items-start justify-between relative">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Send className="w-3 h-3" />
                <span>Outreach Assistant</span>
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                {lead.category}
              </span>
            </div>

            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Pitch Template for: {lead.name}</span>
            </h2>

            <p className="text-xs text-stone-300 flex items-center gap-2">
              <span>📍 {lead.location}</span>
              <span>•</span>
              <span className={lead.websiteStatus === 'No Website Found' ? 'text-amber-400 font-bold' : 'text-stone-300'}>
                {lead.websiteStatus === 'No Website Found' ? '⚡ High Opportunity: No Website' : lead.websiteStatus}
              </span>
              <span>•</span>
              <span>Status: <strong className="text-amber-300">{lead.leadStatus}</strong></span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-stone-700">
          
          {/* Channel Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Channel:</span>
              <div className="flex items-center bg-stone-200 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setChannel('whatsapp');
                    setCustomBody(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChannel('email');
                    setCustomBody(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${
                    channel === 'email'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Cold Email</span>
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">Tone:</span>
              <select
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value as OutreachTone);
                  setCustomBody(null);
                }}
                className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="friendly">Friendly & Warm</option>
                <option value="direct_roi">Direct & ROI-Focused</option>
                <option value="consultative">Professional Consultative</option>
                <option value="urgent">Quick Question / High Impact</option>
              </select>
            </div>
          </div>

          {/* Sender & Agency Profile Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Your Name / Representative
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => handleSenderChange(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Agency / Company Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => handleAgencyChange(e.target.value)}
                placeholder="e.g. Acme Web Studio"
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Email Subject Line (If Email) */}
          {channel === 'email' && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Email Subject Line
              </label>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs text-stone-900 font-semibold flex items-center justify-between">
                <span>{generated.subject}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (generated.subject) {
                      navigator.clipboard.writeText(generated.subject);
                    }
                  }}
                  className="text-stone-500 hover:text-stone-800 p-1 text-[11px] font-sans flex items-center gap-1"
                  title="Copy subject line"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}

          {/* Message Preview & Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Message Body (Editable)</span>
                {customBody !== null && (
                  <span className="text-amber-600 font-normal lowercase">(custom edited)</span>
                )}
              </label>

              <div className="flex items-center gap-2">
                {customBody !== null && (
                  <button
                    type="button"
                    onClick={handleResetTemplate}
                    className="text-stone-500 hover:text-stone-800 flex items-center gap-1 text-[11px]"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded text-[11px] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={activeBody}
              onChange={(e) => setCustomBody(e.target.value)}
              rows={8}
              className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed bg-stone-50/50"
              placeholder="Your generated outreach message appears here..."
            />
          </div>

          {/* Lead Context Summary Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] text-amber-950">
              <p className="font-bold">Tailored to {lead.category}s & {lead.leadStatus} Lifecycle</p>
              <p className="text-stone-600 leading-normal">
                This template dynamically addresses the exact pain points of local {lead.category.toLowerCase()} businesses: capturing direct customer orders/bookings, avoiding aggregator commission, and building high-trust presence online.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {lead.contactNumber && lead.contactNumber !== 'Not Found' && (
              <span className="text-xs text-stone-600 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-mono font-bold text-stone-800">{lead.contactNumber}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {channel === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleLaunchOutreach}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchOutreach}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
