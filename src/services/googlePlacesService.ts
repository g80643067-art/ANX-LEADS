/**
 * Google Places API (New) Loader & Search Service
 *
 * Implements Text Search (New) on the Places JavaScript SDK to retrieve real,
 * verified Google Business / Maps listings without synthetic or fake data.
 */

import { BusinessLeadItem } from '../types/lead';
import { analyzeWebsiteStatus, formatOpeningHours } from '../utils/leadVerification';

export const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsScriptPromise: Promise<void> | null = null;

export function hasApiKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim() !== '' && API_KEY !== 'MY_GOOGLE_MAPS_API_KEY');
}

/**
 * Ensures Google Maps JS SDK with places library is loaded dynamically.
 */
export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ((window as any).google?.maps?.places?.Place) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-gmp-places]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (err) => reject(err));
      return;
    }

    if (!hasApiKey()) {
      reject(new Error('Connect Google Places API to search real businesses.'));
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-gmp-places', 'true');
    // Using weekly release with places, core and marker libraries
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      API_KEY
    )}&libraries=places,core,marker&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (err) => {
      console.warn('Failed to load Google Maps script', err);
      reject(new Error('Failed to load Google Maps Places SDK. Please check your internet connection or API key restrictions.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

export interface SearchPlacesParams {
  city: string;
  area?: string;
  category?: string;
  keyword?: string;
}

/**
 * Helper to map price level enum or number to text
 */
function formatPriceLevel(priceLevel: any): string | null {
  if (priceLevel === undefined || priceLevel === null) return null;
  if (typeof priceLevel === 'string') {
    if (priceLevel.includes('FREE')) return 'Free';
    if (priceLevel.includes('INEXPENSIVE')) return '$ (Inexpensive)';
    if (priceLevel.includes('MODERATE')) return '$$ (Moderate)';
    if (priceLevel.includes('EXPENSIVE')) return '$$$ (Expensive)';
    if (priceLevel.includes('VERY_EXPENSIVE')) return '$$$$ (Very Expensive)';
    return priceLevel;
  }
  if (typeof priceLevel === 'number') {
    return '$'.repeat(Math.max(1, Math.min(priceLevel, 4)));
  }
  return null;
}

/**
 * Searches real local business listings via Google Places API (New)
 */
export async function searchGooglePlaces(params: SearchPlacesParams): Promise<BusinessLeadItem[]> {
  const queryParts = [params.keyword, params.category, params.area, params.city].filter(Boolean);
  const textQuery = queryParts.join(' ').trim();

  if (!textQuery) return [];

  if (!hasApiKey()) {
    throw new Error('Connect Google Places API to search real businesses.');
  }

  try {
    await loadGoogleMapsScript();

    const placesLib = (window as any).google?.maps?.places;
    if (!placesLib?.Place) {
      throw new Error('Google Maps Places library not initialized.');
    }

    // Places API (New) searchByText using exact Maps JS SDK Place class field names:
    const request = {
      textQuery,
      fields: [
        'id',
        'displayName',
        'primaryTypeDisplayName',
        'types',
        'formattedAddress',
        'location',
        'nationalPhoneNumber',
        'internationalPhoneNumber',
        'websiteURI',
        'rating',
        'userRatingCount',
        'googleMapsURI',
        'regularOpeningHours',
        'priceLevel',
      ],
      maxResultCount: 20,
    };

    const { places } = await placesLib.Place.searchByText(request);

    if (!places || !Array.isArray(places)) {
      return [];
    }

    const leads: BusinessLeadItem[] = places.map((p: any) => {
      const name = p.displayName || 'Unknown Business';
      const rawCategory =
        p.primaryTypeDisplayName ||
        (Array.isArray(p.types) && p.types[0]
          ? p.types[0].replace(/_/g, ' ')
          : params.category || 'Local Business');

      const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || 'Not Found';
      const address = p.formattedAddress || 'Not Found';
      const location = params.area && params.city
        ? `${params.area}, ${params.city}`
        : params.city || (address !== 'Not Found' ? address.split(',')[1]?.trim() || address : 'Not Found');

      const rating = typeof p.rating === 'number' ? p.rating : null;
      const reviews = typeof p.userRatingCount === 'number' ? p.userRatingCount : null;
      const googleMapsUrl = p.googleMapsURI || (p.id ? `https://www.google.com/maps/place/?q=place_id:${p.id}` : null);

      // Verify official website existence
      const rawWebsite = p.websiteURI || p.websiteUri || null;
      const { status, label, verifiedUrl } = analyzeWebsiteStatus(rawWebsite);

      const openingHours = formatOpeningHours(p.regularOpeningHours);
      const priceRange = formatPriceLevel(p.priceLevel);

      // Extract coordinates if available
      let coordinates: { lat: number; lng: number } | undefined;
      if (p.location && typeof p.location.lat === 'function') {
        coordinates = {
          lat: p.location.lat(),
          lng: p.location.lng(),
        };
      } else if (p.location && typeof p.location.lat === 'number') {
        coordinates = {
          lat: p.location.lat,
          lng: p.location.lng,
        };
      }

      return {
        id: p.id ? `gmp-${p.id}` : `lead-${Math.random().toString(36).substring(2, 9)}`,
        placeId: p.id,
        name,
        category: capitalizeWords(rawCategory),
        contactNumber: phone,
        location,
        fullAddress: address,
        googleRating: rating,
        reviewCount: reviews,
        googleListingUrl: googleMapsUrl,
        facebookUrl: null, // Google Places API does not return social profiles; marked Not Found as per rule
        instagramUrl: null,
        websiteUrl: verifiedUrl,
        websiteStatus: label,
        openingHours,
        priceLevel: priceRange,
        moreDetails: address !== 'Not Found' ? address : `${params.category || 'Business'} in ${params.city}`,
        personalNotes: '',
        leadStatus: 'New',
        isSaved: false,
        coordinates,
        source: 'google_places',
      };
    });

    return leads;
  } catch (err: any) {
    console.error('Error during Google Places search:', err);
    throw err;
  }
}

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
