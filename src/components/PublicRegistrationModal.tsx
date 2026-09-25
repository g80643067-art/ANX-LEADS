import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Send,
  Loader2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ALL_BUSINESS_CATEGORIES } from '../utils/categoryTemplates';
import { registerPublicLead } from '../services/adminService';
import { RegisteredLead, SlotsStatusResponse } from '../types/admin';

interface PublicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotsStatus: SlotsStatusResponse | null;
  onRegisteredSuccess: (lead: RegisteredLead, slotNumber: number) => void;
}

export const PublicRegistrationModal: React.FC<PublicRegistrationModalProps> = ({
  isOpen,
  onClose,
  slotsStatus,
  onRegisteredSuccess,
}) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<string>('Restaurant');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredLead, setRegisteredLead] = useState<RegisteredLead | null>(null);
  const [claimedSlotNumber, setClaimedSlotNumber] = useState<number | null>(null);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableSlots = slotsStatus?.availableSlots ?? 2;
  const isFull = availableSlots === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick check
    if (!name.trim() || !phoneNumber.trim() || !email.trim() || !businessName.trim() || !city.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerPublicLead({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        businessName: businessName.trim(),
        businessCategory,
        city: city.trim(),
        notes: notes.trim(),
      });

      setRegisteredLead(response.lead);
      setClaimedSlotNumber(response.slotNumber);
      onRegisteredSuccess(response.lead, response.slotNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setPhoneNumber('');
    setEmail('');
    setBusinessName('');
    setCity('');
    setNotes('');
    setRegisteredLead(null);
    setClaimedSlotNumber(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleResetAndClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-stone-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-stone-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0 border-b border-stone-800">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 uppercase tracking-wider">
                Direct Registration
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {availableSlots} of 2 Slots Open
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
              {registeredLead ? 'Registration Confirmed!' : 'Claim Your Registration Slot'}
            </h2>
            <p className="text-xs text-stone-300 leading-snug">
              {registeredLead
                ? 'Your lead profile is permanently stored in our secure backend database.'
                : 'Limited to exactly 2 active consultation slots.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {registeredLead ? (
            // Success Confirmation View
            <div className="space-y-4 sm:space-y-5 text-center py-2 animate-in fade-in">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                  <span>Allocated Slot #{claimedSlotNumber}</span>
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  Welcome aboard, {registeredLead.name}!
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Your business <strong>{registeredLead.businessName}</strong> has been saved directly to our database.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-stone-50 rounded-2xl p-3.5 sm:p-4 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Registration ID:</span>
                  <span className="font-mono font-bold text-stone-800 truncate max-w-[180px]">{registeredLead.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Contact Number:</span>
                  <span className="font-mono font-bold text-stone-800">{registeredLead.phoneNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Email:</span>
                  <span className="font-bold text-stone-800 truncate max-w-[180px]">{registeredLead.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Category & City:</span>
                  <span className="font-bold text-stone-800">{registeredLead.businessCategory} • {registeredLead.city}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Stored In:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Backend DB (Live)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md min-h-[44px]"
              >
                Done / Close
              </button>
            </div>
          ) : isFull ? (
            // Slots Full Notice
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900">
                  All 2 Registration Slots Are Currently Occupied
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  To ensure dedicated attention, only 2 registrations are accepted at a time. The system administrator will reopen slots once current registrations are reviewed.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-100 text-xs text-stone-600 font-mono">
                Status: 0 of 2 Slots Available in Database
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
              >
                Close Notice
              </button>
            </div>
          ) : (
            // Active Registration Form
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Gupta"
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 font-mono"
                  />
                </div>
              </div>

              {/* Email & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    City / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lucknow, Prayagraj"
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              {/* Business Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Business / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Gupta Sweets & Cafe"
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Business Category *
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 cursor-pointer"
                  >
                    {ALL_BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other Commercial">Other Commercial / Retail</option>
                  </select>
                </div>
              </div>

              {/* Notes / Special Requirement */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Business Requirements / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Need website, WhatsApp catalog setup, or Google Maps verification..."
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 resize-none"
                />
              </div>

              {/* Security notice & submit button */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Claiming Slot & Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit & Secure Open Slot</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Permanent Database Persistence • Admin Protected</span>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
