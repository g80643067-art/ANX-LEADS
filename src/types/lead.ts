export type LeadLifecycleStatus = 'New' | 'Contacted' | 'Interested' | 'Follow-up' | 'Sold';

export type VerifiedWebsiteStatus = 'No Website Found' | 'Website Found' | 'Needs Verification';

export interface BusinessLeadItem {
  id: string; // unique ID or place_id
  placeId?: string;
  name: string; // Shop Name
  category: string; // Category
  contactNumber: string; // Phone or "Not Found"
  location: string; // City / Locality formatted
  fullAddress?: string;
  googleRating: number | null; // e.g. 4.6 or null
  reviewCount: number | null; // e.g. 125 or null
  googleListingUrl: string | null; // Clickable Google Maps URL
  facebookUrl: string | null; // Official Facebook URL or null
  instagramUrl: string | null; // Official Instagram URL or null
  websiteUrl: string | null; // Official Website URL or null
  websiteStatus: VerifiedWebsiteStatus; // "No Website Found" | "Website Found" | "Needs Verification"
  openingHours: string; // Opening hours string or "Not Found"
  priceLevel?: string | null; // e.g. "$$", "₹₹" or "Not Found"
  moreDetails: string; // Highlights / Overview
  personalNotes?: string; // User personal notes / outreach log
  leadStatus: LeadLifecycleStatus; // "New" | "Contacted" | "Interested" | "Follow-up" | "Sold"
  isSaved?: boolean; // Whether saved in leads CRM
  savedAt?: string; // ISO date timestamp
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: 'google_places' | 'manual';
  email?: string | null; // Real client contact email
  country?: string;
}
