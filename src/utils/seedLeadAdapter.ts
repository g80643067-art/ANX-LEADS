import { BusinessProfile, BusinessCategory } from '../types/business';
import { BusinessLeadItem } from '../types/lead';
import { INITIAL_BUSINESSES } from '../data/seedBusinesses';

export function businessProfileToLeadItem(biz: BusinessProfile): BusinessLeadItem {
  // Format hours
  const openHoursStr = biz.hours && biz.hours.length > 0
    ? `${biz.hours[0].day}: ${biz.hours[0].open} - ${biz.hours[0].close}`
    : 'Mon-Sat: 09:00 AM - 08:30 PM';

  return {
    id: `seed-${biz.id}`,
    placeId: biz.id,
    name: biz.name,
    category: biz.category,
    contactNumber: biz.phone || 'Not Found',
    location: `${biz.city}, ${biz.state}`,
    fullAddress: `${biz.address}, ${biz.city}, ${biz.state} ${biz.zip || ''}`,
    googleRating: biz.leadOpportunityScore === 'High' ? 4.8 : 4.5,
    reviewCount: biz.leadOpportunityScore === 'High' ? 142 : 86,
    googleListingUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${biz.name} ${biz.address} ${biz.city}`
    )}`,
    facebookUrl: null,
    instagramUrl: biz.instagramUrl || null,
    websiteUrl: biz.hasWebsite ? biz.websiteUrl || null : null,
    websiteStatus: biz.hasWebsite ? 'Website Found' : 'No Website Found',
    openingHours: openHoursStr,
    priceLevel: biz.isInternational ? '$$' : '₹₹',
    moreDetails: biz.description || biz.leadOpportunityReason || '',
    personalNotes: biz.adminNotes || '',
    leadStatus: biz.outreachStatus === 'converted'
      ? 'Sold'
      : biz.outreachStatus === 'follow_up'
      ? 'Follow-up'
      : biz.outreachStatus === 'contacted'
      ? 'Contacted'
      : 'New',
    isSaved: false,
    coordinates: biz.coordinates,
    source: 'manual',
    email: biz.email || null,
    country: biz.country || 'India',
  };
}

export function leadItemToBusinessProfile(lead: BusinessLeadItem): BusinessProfile {
  const parts = (lead.location || '').split(',').map((s) => s.trim());
  const city = parts[0] || 'Unknown City';
  const state = parts[1] || 'State';
  const hasWeb = lead.websiteStatus === 'Website Found' && !!lead.websiteUrl;

  return {
    id: lead.id,
    name: lead.name,
    category: (lead.category as BusinessCategory) || 'Mom-and-Pop Eatery',
    address: lead.fullAddress || lead.location,
    city,
    state,
    country: lead.country || 'India',
    zip: '',
    coordinates: lead.coordinates || { lat: 26.8467, lng: 80.9462 },
    phone: lead.contactNumber,
    email: lead.email || undefined,
    instagramUrl: lead.instagramUrl || undefined,
    hours: [
      {
        day: 'Mon-Sat',
        open: '09:00 AM',
        close: '08:30 PM',
      },
    ],
    description: lead.moreDetails || `Local ${lead.category} in ${lead.location}`,
    hasWebsite: hasWeb,
    websiteUrl: lead.websiteUrl || undefined,
    isVerifiedStorefront: true,
    tags: [lead.category, lead.location, lead.websiteStatus],
    leadOpportunityScore: lead.websiteStatus === 'No Website Found' ? 'High' : 'Low',
    leadOpportunityReason: lead.websiteStatus === 'No Website Found' ? 'No website listed on Google Places' : undefined,
    adminNotes: lead.personalNotes || undefined,
    createdDate: new Date().toISOString(),
    isInternational: lead.country ? lead.country !== 'India' : false,
  };
}

export function getDefaultSeedLeads(): BusinessLeadItem[] {
  return INITIAL_BUSINESSES.map(businessProfileToLeadItem);
}
