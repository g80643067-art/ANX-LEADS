import { BusinessProfile } from '../types/business';
import { INITIAL_BUSINESSES } from '../data/seedBusinesses';

const STORAGE_KEY_BUSINESSES = 'anx_leads_businesses_v2';
const STORAGE_KEY_SAVED_LEADS = 'anx_leads_saved_lead_ids_v2';
const LEGACY_STORAGE_KEY_BUSINESSES = 'offlinead_businesses_v2';
const LEGACY_STORAGE_KEY_SAVED_LEADS = 'offlinead_saved_lead_ids_v2';

export function getStoredBusinesses(): BusinessProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUSINESSES) || localStorage.getItem(LEGACY_STORAGE_KEY_BUSINESSES);
    if (!raw) {
      // Initialize with seed
      saveStoredBusinesses(INITIAL_BUSINESSES);
      return INITIAL_BUSINESSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure country and isInternational fields are populated
      return parsed.map((item) => ({
        ...item,
        country: item.country || (item.state === 'NY' ? 'United States' : 'India'),
        isInternational: item.isInternational !== undefined ? item.isInternational : (item.country && item.country !== 'India'),
      }));
    }
    return INITIAL_BUSINESSES;
  } catch (e) {
    console.error('Failed to load stored businesses', e);
    return INITIAL_BUSINESSES;
  }
}

export function saveStoredBusinesses(businesses: BusinessProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BUSINESSES, JSON.stringify(businesses));
  } catch (e) {
    console.error('Failed to persist businesses', e);
  }
}

export function getSavedLeadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LEADS) || localStorage.getItem(LEGACY_STORAGE_KEY_SAVED_LEADS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved leads', e);
    return [];
  }
}

export function saveSavedLeadIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LEADS, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to persist saved lead IDs', e);
  }
}

export function resetToSeedData(): BusinessProfile[] {
  saveStoredBusinesses(INITIAL_BUSINESSES);
  return INITIAL_BUSINESSES;
}

/**
 * CSV Exporter for CRM / Outreach lead collection
 */
export function exportBusinessesToCsv(
  businesses: BusinessProfile[],
  filename = 'anx_leads_export.csv'
): void {
  const headers = [
    'ID',
    'Business Name',
    'Category',
    'Phone',
    'Address',
    'City',
    'State / Region',
    'Country',
    'Zip / Postal Code',
    'Latitude',
    'Longitude',
    'Has Website',
    'Website URL',
    'Verified Storefront',
    'Lead Opportunity Score',
    'Opportunity Reason',
    'Owner Contact',
    'Established Year',
    'Payment Methods',
    'Outreach Status',
    'Admin Notes',
    'Description',
    'Market Type',
  ];

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = businesses.map((b) => [
    escapeCell(b.id),
    escapeCell(b.name),
    escapeCell(b.category),
    escapeCell(b.phone),
    escapeCell(b.address),
    escapeCell(b.city),
    escapeCell(b.state),
    escapeCell(b.country || 'India'),
    escapeCell(b.zip),
    escapeCell(b.coordinates.lat),
    escapeCell(b.coordinates.lng),
    escapeCell(b.hasWebsite ? 'Yes' : 'No (High Opportunity)'),
    escapeCell(b.websiteUrl || 'None'),
    escapeCell(b.isVerifiedStorefront ? 'Verified Storefront' : 'Unverified'),
    escapeCell(b.leadOpportunityScore),
    escapeCell(b.leadOpportunityReason || ''),
    escapeCell(b.ownerName || 'Unknown'),
    escapeCell(b.establishedYear || ''),
    escapeCell(b.paymentMethods ? b.paymentMethods.join(', ') : ''),
    escapeCell(b.outreachStatus || 'uncontacted'),
    escapeCell(b.adminNotes || ''),
    escapeCell(b.description),
    escapeCell(b.isInternational ? 'International' : 'Domestic / Local'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON Exporter
 */
export function exportBusinessesToJson(
  businesses: BusinessProfile[],
  filename = 'anx_leads_export.json'
): void {
  const jsonContent = JSON.stringify(businesses, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates formatted text summary for sharing or copying a lead
 */
export function generateLeadBriefText(biz: BusinessProfile): string {
  const websiteLine = biz.hasWebsite
    ? `Website: ${biz.websiteUrl || 'Available'}`
    : 'Website: NONE (High-Value Offline Lead)';

  return `
[ANX LEADS · OFFLINE LEAD PROFILE]
Business Name: ${biz.name}
Category: ${biz.category}
Location: ${biz.address}, ${biz.city}, ${biz.state} ${biz.zip || ''}, ${biz.country || 'India'}
Phone: ${biz.phone}
${websiteLine}
Storefront Status: ${biz.isVerifiedStorefront ? 'Verified Storefront' : 'Pending Verification'}
Opportunity Score: ${biz.leadOpportunityScore}
Opportunity Reason: ${biz.leadOpportunityReason || 'No digital presence; high prospect for web solutions.'}
Contact / Owner: ${biz.ownerName || 'Walk-in inquiries'}
Established: ${biz.establishedYear || 'N/A'}
Description: ${biz.description}
`.trim();
}
