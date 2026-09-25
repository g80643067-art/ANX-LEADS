import React, { useState, useEffect, useRef } from 'react';
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
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  KeyRound,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { ALL_BUSINESS_CATEGORIES } from '../utils/categoryTemplates';
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  resendRegistrationOtp,
} from '../services/adminService';
import {
  RegisteredLead,
  SlotsStatusResponse,
  InitiateOtpResponse,
} from '../types/admin';

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
  // Step Management: 'form' | 'otp' | 'success' | 'full'
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Step 1 Form Fields
  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<string>('Restaurant / Food');
  const [city, setCity] = useState('');

  // Step 2 OTP Fields
  const [otpSession, setOtpSession] = useState<InitiateOtpResponse | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300); // 5 min timer

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredLead, setRegisteredLead] = useState<RegisteredLead | null>(null);
  const [claimedSlotNumber, setClaimedSlotNumber] = useState<number | null>(null);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

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

  // Handle OTP countdown & cooldown timers
  useEffect(() => {
    if (step !== 'otp') return;

    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setOtpExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Focus OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
    }
  }, [step]);

  if (!isOpen) return null;

  const availableSlots = slotsStatus?.availableSlots ?? 2;
  const isFull = availableSlots === 0 && step === 'form';

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Submit Form to Send WhatsApp OTP
  const handleInitiateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !whatsappNumber.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in your Name, WhatsApp Number, Email, and Password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await sendRegistrationOtp({
        name: name.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        password,
        businessName: businessName.trim() || undefined,
        businessCategory,
        city: city.trim() || undefined,
      });

      setOtpSession(response);
      setOtpCooldown(response.cooldownSeconds || 30);
      setOtpExpiresIn(response.expiresInSeconds || 300);
      setStep('otp');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send WhatsApp verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!otpSession || otpCooldown > 0 || isResending) return;
    setErrorMessage(null);
    setIsResending(true);

    try {
      const response = await resendRegistrationOtp(otpSession.sessionId);
      setOtpSession(response);
      setOtpCooldown(response.cooldownSeconds || 30);
      setOtpExpiresIn(response.expiresInSeconds || 300);
      setOtpValue('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Verify OTP & Claim Slot
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSession) return;
    setErrorMessage(null);

    const cleanOtp = otpValue.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit WhatsApp code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyRegistrationOtp({
        sessionId: otpSession.sessionId,
        otp: cleanOtp,
      });

      setRegisteredLead(response.lead);
      setClaimedSlotNumber(response.slotNumber);
      setStep('success');
      onRegisteredSuccess(response.lead, response.slotNumber);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setWhatsappNumber('');
    setEmail('');
    setPassword('');
    setBusinessName('');
    setCity('');
    setOtpSession(null);
    setOtpValue('');
    setRegisteredLead(null);
    setClaimedSlotNumber(null);
    setErrorMessage(null);
    setStep('form');
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
                {step === 'otp' ? 'WhatsApp Verification' : step === 'success' ? 'Verified' : '2-Slot Registration'}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {availableSlots} of 2 Slots Open
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
              {step === 'success'
                ? 'Registration & OTP Verified!'
                : step === 'otp'
                ? 'Verify WhatsApp Code'
                : 'Claim Your Registration Slot'}
            </h2>

            <p className="text-xs text-stone-300 leading-snug">
              {step === 'success'
                ? 'Your slot is permanently locked and stored in our secure database.'
                : step === 'otp'
                ? 'Enter the 6-digit OTP code sent to your WhatsApp number.'
                : 'Limited to exactly 2 active slots. Verified via WhatsApp OTP.'}
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
          
          {/* ==========================================
              STEP 3: SUCCESS VIEW
              ========================================== */}
          {step === 'success' && registeredLead && (
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
                  Your registration has been verified and permanently stored in our backend database.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-stone-50 rounded-2xl p-3.5 sm:p-4 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Registrant Name:</span>
                  <span className="font-bold text-stone-800">{registeredLead.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">WhatsApp Number:</span>
                  <span className="font-mono font-bold text-stone-800">{registeredLead.phoneNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Email Address:</span>
                  <span className="font-bold text-stone-800 truncate max-w-[180px]">{registeredLead.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-200/80">
                  <span className="text-stone-500">Allocated Slot:</span>
                  <span className="font-mono font-bold text-amber-600">Slot #{claimedSlotNumber} (Occupied)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Verification Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> WhatsApp OTP Verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md min-h-[44px]"
              >
                Done / Finish
              </button>
            </div>
          )}

          {/* ==========================================
              SLOTS FULL NOTICE (If no slots and in form step)
              ========================================== */}
          {isFull && (
            <div className="space-y-4 text-center py-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900">
                  All 2 Registration Slots Are Currently Occupied
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  To ensure dedicated attention, only 2 verified registrations are accepted at a time. The system administrator will reopen slots once current registrations are reviewed.
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
          )}

          {/* ==========================================
              STEP 2: DEDICATED OTP VERIFICATION SCREEN
              ========================================== */}
          {step === 'otp' && otpSession && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              
              {/* Back to Edit Info */}
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>

              {/* Status Header Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OTP Sent to WhatsApp</span>
                </div>
                <p className="text-xs text-emerald-800 leading-snug">
                  A 6-digit verification code was sent to{' '}
                  <strong className="font-mono">{otpSession.maskedWhatsApp}</strong>.
                </p>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* OTP Input Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Enter 6-Digit OTP *
                  </label>
                  <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expires in {formatTimer(otpExpiresIn)}</span>
                  </span>
                </div>

                <div className="relative">
                  <KeyRound className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtpValue(val);
                    }}
                    placeholder="• • • • • •"
                    className="w-full pl-11 pr-4 py-3 text-center text-lg sm:text-xl font-mono font-black tracking-widest bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              {/* Demo Helper Pill (for seamless test review in development environment) */}
              {otpSession.demoOtpPreview && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-900 leading-tight">
                    <span className="font-bold">Test/Dev OTP: </span>
                    <span className="font-mono font-black text-xs text-amber-950">{otpSession.demoOtpPreview}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpValue(otpSession.demoOtpPreview || '')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* Action Buttons: Verify & Resend */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || otpValue.length !== 6}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Locking Slot...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify OTP & Claim Slot</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || isResending}
                    className="font-bold text-amber-600 hover:text-amber-700 disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending
                      ? 'Sending...'
                      : otpCooldown > 0
                      ? `Resend in ${otpCooldown}s`
                      : 'Resend OTP Code'}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Slots become occupied only after successful OTP verification</span>
                </div>
              </div>
            </form>
          )}

          {/* ==========================================
              STEP 1: REGISTRATION DETAILS FORM
              ========================================== */}
          {step === 'form' && !isFull && (
            <form onSubmit={handleInitiateOtp} className="space-y-3.5 animate-in fade-in">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Full Name *
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

              {/* WhatsApp Number */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  WhatsApp Number (For OTP Verification) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  A 6-digit verification code will be dispatched to this number.
                </span>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Encrypted securely with PBKDF2 salt on the backend server.
                </span>
              </div>

              {/* Business Name & City (Optional / Compact) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Business / Shop Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Gupta Sweets & Cafe"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    City / Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lucknow"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                  />
                </div>
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
                      <span>Sending WhatsApp Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Continue to WhatsApp OTP Verification</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Slots remain open until OTP is successfully confirmed</span>
                </div>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
