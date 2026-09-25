import { BusinessLeadItem } from '../types/lead';

/**
 * Validates and formats real client phone numbers for WhatsApp wa.me links.
 * Preserves the client's real phone digits and attaches the correct country calling code
 * without ever inventing fake numbers.
 */
export function formatWhatsAppPhoneNumber(
  rawPhone: string,
  location?: string,
  country?: string
): string | null {
  if (!rawPhone || rawPhone.trim() === '' || rawPhone.toLowerCase() === 'not found' || rawPhone.toLowerCase() === 'none') {
    return null;
  }

  // Extract digits and check if original had '+' prefix
  const hasPlus = rawPhone.trim().startsWith('+');
  const digitsOnly = rawPhone.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return null;
  }

  // If phone already had a plus sign, the digits include the country code
  if (hasPlus) {
    return digitsOnly;
  }

  const combinedLoc = `${location || ''} ${country || ''}`.toLowerCase();

  // If already starts with 91 and has 12 digits (India international format)
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return digitsOnly;
  }

  // International country detection
  const isUS = combinedLoc.includes('united states') || combinedLoc.includes('usa') || combinedLoc.includes('ny') || combinedLoc.includes('brooklyn');
  const isUK = combinedLoc.includes('united kingdom') || combinedLoc.includes('uk') || combinedLoc.includes('london');
  const isFrance = combinedLoc.includes('france') || combinedLoc.includes('paris');
  const isItaly = combinedLoc.includes('italy') || combinedLoc.includes('rome');
  const isUAE = combinedLoc.includes('uae') || combinedLoc.includes('dubai') || combinedLoc.includes('emirates');
  const isGermany = combinedLoc.includes('germany') || combinedLoc.includes('berlin');
  const isAustralia = combinedLoc.includes('australia') || combinedLoc.includes('sydney');
  const isCanada = combinedLoc.includes('canada') || combinedLoc.includes('toronto');

  if (isUS || isCanada) {
    if (digitsOnly.length === 10) return `1${digitsOnly}`;
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return digitsOnly;
    return digitsOnly;
  }

  if (isUK) {
    if (digitsOnly.startsWith('0')) return `44${digitsOnly.slice(1)}`;
    if (digitsOnly.length === 10) return `44${digitsOnly}`;
    return digitsOnly;
  }

  if (isFrance) {
    if (digitsOnly.startsWith('0')) return `33${digitsOnly.slice(1)}`;
    return `33${digitsOnly}`;
  }

  if (isItaly) {
    if (digitsOnly.startsWith('0')) return `39${digitsOnly.slice(1)}`;
    return `39${digitsOnly}`;
  }

  if (isGermany) {
    if (digitsOnly.startsWith('0')) return `49${digitsOnly.slice(1)}`;
    return `49${digitsOnly}`;
  }

  if (isAustralia) {
    if (digitsOnly.startsWith('0')) return `61${digitsOnly.slice(1)}`;
    return `61${digitsOnly}`;
  }

  if (isUAE) {
    if (digitsOnly.startsWith('0')) return `971${digitsOnly.slice(1)}`;
    return `971${digitsOnly}`;
  }

  // Default to India (+91) for 10-digit mobile numbers or local numbers starting with 0
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `91${digitsOnly.slice(1)}`;
  }

  return digitsOnly;
}

/**
 * Builds the complete wa.me deep link with pre-filled category template message
 */
export function buildWhatsAppCategoryLink(
  phone: string,
  message: string,
  location?: string,
  country?: string
): string | null {
  const formattedNumber = formatWhatsAppPhoneNumber(phone, location, country);
  if (!formattedNumber) return null;

  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates email subject
 */
export function getEmailPitchSubject(businessName: string): string {
  return `Website Opportunity for ${businessName}`;
}

/**
 * Builds standard mailto URL
 */
export function buildEmailMailtoLink(
  email: string,
  businessName: string,
  customBody?: string
): string {
  const subject = getEmailPitchSubject(businessName);
  const body = customBody || `Hi ${businessName} Team,\n\nI came across your business and noticed your great local reputation. A dedicated, modern website could help showcase your offerings and capture more direct customer inquiries.\n\nWould you be open to seeing a quick concept tailored for your business?\n\nThank you.`;
  return `mailto:${email.trim()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates Instagram DM clipboard message
 */
export function getInstagramPitchMessage(businessName: string, category: string): string {
  return `Hi! I came across ${businessName} and noticed your great profile. I put together a website concept that could help showcase your services and bring you more direct customers. Would you like to take a look?`;
}

/**
 * Formats a clean, direct Instagram profile URL
 */
export function formatInstagramProfileUrl(instagramUrlOrHandle: string): string {
  const raw = instagramUrlOrHandle.trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  const handle = raw.startsWith('@') ? raw.slice(1) : raw;
  return `https://www.instagram.com/${handle}/`;
}

/**
 * Checks if client has a valid, non-placeholder phone number
 */
export function hasClientRealPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const lower = phone.trim().toLowerCase();
  if (lower === '' || lower === 'not found' || lower === 'none') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7;
}

/**
 * Checks if client has a valid, non-placeholder email address
 */
export function hasClientRealEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  if (lower === '' || lower === 'not found' || lower === 'none') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Checks if client has a valid, non-placeholder Instagram handle or link
 */
export function hasClientRealInstagram(instagram?: string | null): boolean {
  if (!instagram) return false;
  const lower = instagram.trim().toLowerCase();
  if (lower === '' || lower === 'not found' || lower === 'none') return false;
  return true;
}
