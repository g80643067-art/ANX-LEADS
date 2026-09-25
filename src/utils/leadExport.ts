import { BusinessLeadItem } from '../types/lead';
import { getDefaultSeedLeads } from './seedLeadAdapter';

const STORAGE_KEY_SAVED_LEADS = 'pro_business_leads_saved_v3';
const STORAGE_KEY_LAST_SEARCH = 'pro_business_leads_last_search_v3';

/**
 * Retrieves persisted saved leads from localStorage
 */
export function getPersistedSavedLeads(): BusinessLeadItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_LEADS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load saved leads', e);
    return [];
  }
}

/**
 * Persists saved leads to localStorage
 */
export function persistSavedLeads(leads: BusinessLeadItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_LEADS, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to persist saved leads', e);
  }
}

/**
 * Retrieves last search results from localStorage if present, or defaults to verified initial leads
 */
export function getPersistedLastSearchResults(): BusinessLeadItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_SEARCH);
    if (!raw) return getDefaultSeedLeads();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultSeedLeads();
  } catch (e) {
    console.error('Failed to load last search results', e);
    return getDefaultSeedLeads();
  }
}

/**
 * Persists search results to localStorage
 */
export function persistLastSearchResults(leads: BusinessLeadItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_SEARCH, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to persist search results', e);
  }
}

/**
 * Exports leads to CSV format preserving exact horizontal spreadsheet columns
 */
export function exportLeadsToCsv(leads: BusinessLeadItem[], filename = 'anx_leads.csv'): void {
  const headers = [
    'S.N.',
    'Shop Name',
    'Category',
    'Contact Number',
    'Contact Email',
    'Location',
    'Google Rating',
    'Review Count',
    'Google Listing',
    'Facebook',
    'Instagram',
    'Website',
    'Website Status',
    'Opening Hours',
    'Price Range',
    'More Details',
    'Personal Notes',
    'Lead Status',
  ];

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((lead, idx) => [
    escapeCell(idx + 1),
    escapeCell(lead.name),
    escapeCell(lead.category),
    escapeCell(lead.contactNumber),
    escapeCell(lead.email || 'Not Found'),
    escapeCell(lead.location),
    escapeCell(lead.googleRating !== null ? lead.googleRating.toFixed(1) : 'Not Found'),
    escapeCell(lead.reviewCount !== null ? lead.reviewCount : 'Not Found'),
    escapeCell(lead.googleListingUrl || 'Not Found'),
    escapeCell(lead.facebookUrl || 'Not Found'),
    escapeCell(lead.instagramUrl || 'Not Found'),
    escapeCell(lead.websiteUrl || 'Not Found'),
    escapeCell(lead.websiteStatus),
    escapeCell(lead.openingHours),
    escapeCell(lead.priceLevel || 'Not Found'),
    escapeCell(lead.moreDetails),
    escapeCell(lead.personalNotes || ''),
    escapeCell(lead.leadStatus),
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
 * Exports leads to clean HTML-based Excel format (.xls) recognizable by Microsoft Excel & Google Sheets
 */
export function exportLeadsToExcel(leads: BusinessLeadItem[], filename = 'anx_leads.xls'): void {
  const headers = [
    'S.N.',
    'Shop Name',
    'Category',
    'Contact Number',
    'Contact Email',
    'Location',
    'Google Rating',
    'Review Count',
    'Google Listing',
    'Facebook',
    'Instagram',
    'Website',
    'Website Status',
    'Opening Hours',
    'Price Range',
    'More Details',
    'Personal Notes',
    'Lead Status',
  ];

  const rowsHtml = leads
    .map(
      (lead, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(lead.name)}</td>
      <td>${escapeHtml(lead.category)}</td>
      <td>${escapeHtml(lead.contactNumber)}</td>
      <td>${escapeHtml(lead.email || 'Not Found')}</td>
      <td>${escapeHtml(lead.location)}</td>
      <td>${lead.googleRating !== null ? lead.googleRating.toFixed(1) : 'Not Found'}</td>
      <td>${lead.reviewCount !== null ? lead.reviewCount : 'Not Found'}</td>
      <td>${lead.googleListingUrl ? `<a href="${lead.googleListingUrl}">View Listing</a>` : 'Not Found'}</td>
      <td>${lead.facebookUrl ? `<a href="${lead.facebookUrl}">View Profile</a>` : 'Not Found'}</td>
      <td>${lead.instagramUrl ? `<a href="${lead.instagramUrl}">View Profile</a>` : 'Not Found'}</td>
      <td>${lead.websiteUrl ? `<a href="${lead.websiteUrl}">${escapeHtml(lead.websiteUrl)}</a>` : '—'}</td>
      <td>${escapeHtml(lead.websiteStatus)}</td>
      <td>${escapeHtml(lead.openingHours)}</td>
      <td>${escapeHtml(lead.priceLevel || 'Not Found')}</td>
      <td>${escapeHtml(lead.moreDetails)}</td>
      <td>${escapeHtml(lead.personalNotes || '')}</td>
      <td>${escapeHtml(lead.leadStatus)}</td>
    </tr>`
    )
    .join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Business Leads</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
        th { background-color: #f3f4f6; color: #111827; font-weight: bold; border: 1px solid #d1d5db; padding: 8px 12px; }
        td { border: 1px solid #e5e7eb; padding: 6px 10px; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
