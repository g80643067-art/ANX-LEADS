export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CityHub {
  name: string;
  label: string;
  country: string;
  isInternational?: boolean;
  coords: GeoPoint;
}

export const CITY_HUBS: CityHub[] = [
  // Primary Indian Cities
  { name: 'prayagraj', label: 'Prayagraj (Allahabad), UP', country: 'India', coords: { lat: 25.4358, lng: 81.8463 } },
  { name: 'lucknow', label: 'Lucknow, Uttar Pradesh', country: 'India', coords: { lat: 26.8467, lng: 80.9462 } },
  { name: 'varanasi', label: 'Varanasi, Uttar Pradesh', country: 'India', coords: { lat: 25.3176, lng: 82.9739 } },
  { name: 'delhi', label: 'New Delhi & NCR', country: 'India', coords: { lat: 28.6139, lng: 77.2090 } },
  { name: 'mumbai', label: 'Mumbai, Maharashtra', country: 'India', coords: { lat: 19.0760, lng: 72.8777 } },
  { name: 'kanpur', label: 'Kanpur, Uttar Pradesh', country: 'India', coords: { lat: 26.4499, lng: 80.3319 } },
  { name: 'jaipur', label: 'Jaipur, Rajasthan', country: 'India', coords: { lat: 26.9124, lng: 75.7873 } },
  { name: 'bengaluru', label: 'Bengaluru, Karnataka', country: 'India', coords: { lat: 12.9716, lng: 77.5946 } },
  { name: 'kolkata', label: 'Kolkata, West Bengal', country: 'India', coords: { lat: 22.5726, lng: 88.3639 } },
  
  // International Hubs
  { name: 'tokyo', label: 'Tokyo (Asakusa & Yanaka)', country: 'Japan', isInternational: true, coords: { lat: 35.7148, lng: 139.7967 } },
  { name: 'london', label: 'London (East End & Soho)', country: 'United Kingdom', isInternational: true, coords: { lat: 51.5074, lng: -0.1278 } },
  { name: 'paris', label: 'Paris (Belleville & Marais)', country: 'France', isInternational: true, coords: { lat: 48.8566, lng: 2.3522 } },
  { name: 'brooklyn', label: 'Brooklyn & Queens, NY', country: 'United States', isInternational: true, coords: { lat: 40.6782, lng: -73.9442 } },
  { name: 'rome', label: 'Rome (Trastevere & Monti)', country: 'Italy', isInternational: true, coords: { lat: 41.9028, lng: 12.4964 } },
  { name: 'dubai', label: 'Dubai (Deira Old Souk)', country: 'UAE', isInternational: true, coords: { lat: 25.2697, lng: 55.3095 } },
];

/**
 * Calculates Haversine distance in kilometers or miles between two coordinates
 */
export function calculateDistanceMiles(point1: GeoPoint, point2: GeoPoint): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
  return calculateDistanceMiles(point1, point2) * 1.60934;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Comprehensive geocoding resolver for Indian and International cities & localities
 */
export function resolveLocationQuery(query: string): GeoPoint | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  // 1. Direct check against hubs
  for (const hub of CITY_HUBS) {
    if (
      normalized === hub.name ||
      normalized.includes(hub.name) ||
      hub.label.toLowerCase().includes(normalized)
    ) {
      return hub.coords;
    }
  }

  // 2. Localities and neighborhoods in Uttar Pradesh & India
  // Prayagraj (Allahabad) localities
  if (
    normalized.includes('prayagraj') ||
    normalized.includes('allahabad') ||
    normalized.includes('civil lines prayagraj') ||
    normalized.includes('civil lines allahabad') ||
    normalized.includes('civil lines') ||
    normalized.includes('katra') ||
    normalized.includes('chowk prayagraj') ||
    normalized.includes('chowk allahabad') ||
    normalized.includes('naini') ||
    normalized.includes('johnstonganj') ||
    normalized.includes('georgetown') ||
    normalized.includes('ashok nagar') ||
    normalized.includes('sangam')
  ) {
    return { lat: 25.4358, lng: 81.8463 };
  }

  // Lucknow localities
  if (normalized.includes('hazratganj') || normalized.includes('aminabad') || normalized.includes('chowk lucknow') || normalized.includes('gomti nagar') || normalized.includes('alambagh') || normalized.includes('indira nagar')) {
    return { lat: 26.8500, lng: 80.9400 };
  }
  // Varanasi localities
  if (normalized.includes('godowlia') || normalized.includes('dashashwamedh') || normalized.includes('assi ghat') || normalized.includes('chowk varanasi') || normalized.includes('thatheri') || normalized.includes('bhelupur')) {
    return { lat: 25.3100, lng: 83.0100 };
  }
  // Delhi localities
  if (normalized.includes('chandni chowk') || normalized.includes('karol bagh') || normalized.includes('lajpat nagar') || normalized.includes('daryaganj') || normalized.includes('sadar bazar')) {
    return { lat: 28.6506, lng: 77.2303 };
  }
  // Mumbai localities
  if (normalized.includes('bandra') || normalized.includes('dadar') || normalized.includes('colaba') || normalized.includes('andheri') || normalized.includes('fort mumbai')) {
    return { lat: 19.0596, lng: 72.8295 };
  }
  // Kanpur
  if (normalized.includes('gumti') || normalized.includes('mall road kanpur') || normalized.includes('govind nagar')) {
    return { lat: 26.4600, lng: 80.3200 };
  }
  // Jaipur
  if (normalized.includes('johari bazar') || normalized.includes('tripolia') || normalized.includes('bapu bazar') || normalized.includes('hawa mahal')) {
    return { lat: 26.9200, lng: 75.8200 };
  }
  // Bengaluru
  if (normalized.includes('indiranagar') || normalized.includes('koramangala') || normalized.includes('jayanagar') || normalized.includes('chickpet')) {
    return { lat: 12.9780, lng: 77.5700 };
  }
  // Kolkata
  if (normalized.includes('burrabazar') || normalized.includes('college street') || normalized.includes('park street') || normalized.includes('shyambazar')) {
    return { lat: 22.5850, lng: 88.3550 };
  }

  // 3. International cities & popular districts
  if (normalized.includes('tokyo') || normalized.includes('asakusa') || normalized.includes('shinjuku') || normalized.includes('shibuya') || normalized.includes('kyoto') || normalized.includes('osaka')) {
    return { lat: 35.6762, lng: 139.6503 };
  }
  if (normalized.includes('london') || normalized.includes('soho') || normalized.includes('shoreditch') || normalized.includes('camden') || normalized.includes('covent garden')) {
    return { lat: 51.5074, lng: -0.1278 };
  }
  if (normalized.includes('paris') || normalized.includes('montmartre') || normalized.includes('marais') || normalized.includes('bastille')) {
    return { lat: 48.8566, lng: 2.3522 };
  }
  if (normalized.includes('rome') || normalized.includes('roma') || normalized.includes('trastevere') || normalized.includes('milan')) {
    return { lat: 41.9028, lng: 12.4964 };
  }
  if (normalized.includes('dubai') || normalized.includes('deira') || normalized.includes('bur dubai') || normalized.includes('sharjah')) {
    return { lat: 25.2048, lng: 55.2708 };
  }
  if (normalized.includes('new york') || normalized.includes('nyc') || normalized.includes('manhattan') || normalized.includes('brooklyn') || normalized.includes('queens')) {
    return { lat: 40.7128, lng: -74.0060 };
  }
  if (normalized.includes('san francisco') || normalized.includes('bay area')) {
    return { lat: 37.7749, lng: -122.4194 };
  }
  if (normalized.includes('chicago')) {
    return { lat: 41.8781, lng: -87.6298 };
  }
  if (normalized.includes('austin')) {
    return { lat: 30.2672, lng: -97.7431 };
  }
  if (normalized.includes('berlin') || normalized.includes('munich') || normalized.includes('frankfurt')) {
    return { lat: 52.5200, lng: 13.4050 };
  }
  if (normalized.includes('toronto') || normalized.includes('vancouver') || normalized.includes('montreal')) {
    return { lat: 43.6532, lng: -79.3832 };
  }
  if (normalized.includes('bangkok') || normalized.includes('singapore') || normalized.includes('kathmandu') || normalized.includes('dhaka') || normalized.includes('colombo')) {
    return { lat: 13.7563, lng: 100.5018 };
  }

  return null;
}

/**
 * Gets the user's current GPS position via browser Geolocation API
 */
export function getCurrentBrowserLocation(): Promise<{ coords: GeoPoint; label: string }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          label: 'Current GPS Location',
        });
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access or type your city.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}
