import { BusinessLeadItem } from '../types/lead';

/**
 * Checks whether an official standalone business website exists.
 * Rules:
 * - Do NOT count Google Maps, Facebook, Instagram, Justdial, Zomato, Swiggy, Sulekha, IndiaMart,
 *   TripAdvisor, Yelp, YellowPages or generic directory links as an official website.
 * - If no URL or directory-only URL -> 'no_website' ("No Website Found")
 * - If valid custom domain/independent site -> 'website_found' ("Website Found")
 * - If uncertain or invalid format -> 'needs_verification' ("Needs Verification")
 */
export function analyzeWebsiteStatus(rawUrl?: string | null): {
  status: 'no_website' | 'website_found' | 'needs_verification';
  label: 'No Website Found' | 'Website Found' | 'Needs Verification';
  verifiedUrl: string | null;
} {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      status: 'no_website',
      label: 'No Website Found',
      verifiedUrl: null,
    };
  }

  const cleaned = rawUrl.trim();

  // Check URL validity
  let hostname = '';
  try {
    const urlObj = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    hostname = urlObj.hostname.toLowerCase();
  } catch {
    // If not a valid URL
    return {
      status: 'needs_verification',
      label: 'Needs Verification',
      verifiedUrl: null,
    };
  }

  // Directory / aggregator / social domains that do NOT qualify as an official website
  const directoryDomains = [
    'google.com',
    'goo.gl',
    'maps.google.com',
    'g.page',
    'business.site', // Legacy google business sites or free redirects
    'facebook.com',
    'fb.com',
    'instagram.com',
    'wa.me',
    'whatsapp.com',
    'justdial.com',
    'jdmagicbox.com',
    'zomato.com',
    'swiggy.com',
    'indiamart.com',
    'tradeindia.com',
    'sulekha.com',
    'yelp.com',
    'tripadvisor.com',
    'yellowpages.com',
    'magicpin.in',
    'nearbuy.com',
    'dineout.co.in',
    'eatsure.com',
    'linkedin.com',
    'twitter.com',
    'x.com',
    'youtube.com',
  ];

  const isDirectory = directoryDomains.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );

  if (isDirectory) {
    return {
      status: 'no_website',
      label: 'No Website Found',
      verifiedUrl: null,
    };
  }

  // Valid official domain
  return {
    status: 'website_found',
    label: 'Website Found',
    verifiedUrl: cleaned.startsWith('http') ? cleaned : `https://${cleaned}`,
  };
}

/**
 * Formats Google opening hours object/array into readable string
 */
export function formatOpeningHours(regularOpeningHours: any): string {
  if (!regularOpeningHours) return 'Not Found';
  if (Array.isArray(regularOpeningHours.weekdayDescriptions) && regularOpeningHours.weekdayDescriptions.length > 0) {
    // Find today's hours or join compact
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayDesc = regularOpeningHours.weekdayDescriptions.find((d: string) =>
      d.toLowerCase().startsWith(todayName.toLowerCase())
    );
    if (todayDesc) {
      const parts = todayDesc.split(': ');
      return parts.length > 1 ? `${todayName}: ${parts[1]}` : todayDesc;
    }
    return regularOpeningHours.weekdayDescriptions[0] || 'Open';
  }
  return 'Not Found';
}
