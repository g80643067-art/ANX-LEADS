export type BusinessCategory =
  | 'Bakery & Pastries'
  | 'Auto Repair & Mechanics'
  | 'Tailoring & Alterations'
  | 'Carpentry & Woodwork'
  | 'Plumbing & Drain'
  | 'Dry Cleaning & Laundry'
  | 'Shoe Repair & Cobbler'
  | 'Landscaping & Tree Service'
  | 'Locksmith & Security'
  | 'Hardware & Home Goods'
  | 'Barbershop & Hair Salon'
  | 'Diner & Mom-and-Pop Eatery'
  | 'Traditional Sweets & Snacks'
  | 'Handicrafts & Artisans'
  | 'Spices & Kirana Store'
  | 'Handloom & Textile Crafts'
  | 'Jewelry & Metal Craft'
  | 'Tea Stall & Street Cafe';

export type OutreachStatus =
  | 'uncontacted'
  | 'contacted'
  | 'follow_up'
  | 'meeting_scheduled'
  | 'converted'
  | 'not_interested';

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  city: string;
  state: string;
  country: string; // e.g. 'India', 'United States', 'United Kingdom', 'Japan', etc.
  zip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email?: string;
  instagramUrl?: string;
  hours: BusinessHours[];
  description: string;
  hasWebsite: boolean;
  websiteUrl?: string;
  isVerifiedStorefront: boolean;
  verifiedDate?: string;
  image?: string;
  tags: string[];
  ownerName?: string;
  establishedYear?: number;
  paymentMethods?: string[];
  leadOpportunityScore: 'High' | 'Medium' | 'Low';
  leadOpportunityReason?: string;
  outreachStatus?: OutreachStatus;
  adminNotes?: string;
  createdDate: string;
  isInternational?: boolean; // Flag for international showcase
}

export interface SearchFilterState {
  keyword: string;
  locationQuery: string;
  centerCoords: { lat: number; lng: number } | null;
  radiusMiles: number; // 0 means all/any
  category: string;
  websiteStatus: 'all' | 'no_website' | 'has_website';
  verificationStatus: 'all' | 'verified_only' | 'unverified_only';
  marketScope: 'all' | 'domestic' | 'international';
  sortBy: 'distance' | 'name' | 'opportunity' | 'newest';
}
