export type BusinessCategoryKey =
  | 'Restaurant'
  | 'Beauty Parlour'
  | 'Salon'
  | 'Gym'
  | 'Hotel'
  | 'Cafe'
  | 'Bakery'
  | 'Dental Clinic'
  | 'Retail Shop'
  | 'Coaching'
  | 'Service Business'
  | 'Other';

export const ALL_BUSINESS_CATEGORIES: BusinessCategoryKey[] = [
  'Restaurant',
  'Beauty Parlour',
  'Salon',
  'Gym',
  'Hotel',
  'Cafe',
  'Bakery',
  'Dental Clinic',
  'Retail Shop',
  'Coaching',
  'Service Business',
  'Other',
];

export const DEFAULT_CATEGORY_WHATSAPP_TEMPLATES: Record<BusinessCategoryKey, string> = {
  Restaurant: `Hi, I came across {business_name} and noticed that your business has a great presence online. I’ve created a professional website concept that could help showcase your menu and attract more customers.

I’d love to show you the idea. Would you be interested in taking a look?`,

  'Beauty Parlour': `Hi, I came across {business_name} and really liked your business presence. I’ve created a professional website concept that could help showcase your services and make it easier for customers to find and contact you.

Would you like to have a look at the idea?`,

  Salon: `Hi, I came across {business_name} and really liked your salon's work. A dedicated modern website would help showcase your styling portfolios, rate card, and let clients easily book appointments with you.

Would you be open to seeing a quick concept tailored for your salon?`,

  Gym: `Hi, I came across {business_name} and noticed your great fitness community. Having a clean modern website could help showcase your workout facilities, trainers, membership packages, and drive new member sign-ups.

Would you be open to taking a quick look at an idea I put together?`,

  Hotel: `Hi, I came across {business_name} and really liked your hospitality profile. A sleek direct-booking website can help showcase your rooms, amenities, and let guests book directly without high platform commissions.

Would you be interested in seeing a quick preview?`,

  Cafe: `Hi, I came across {business_name} and loved your cafe's vibe. Having a modern website would make it super easy for customers to browse your special drinks, food menu, and find your location.

Would you like to see a quick concept I prepared for your cafe?`,

  Bakery: `Hi, I came across {business_name} and loved your bakery creations. A dedicated website would help customers browse your fresh menu, custom cakes, and place orders directly with you.

Would you be open to taking a quick look at a website idea for your bakery?`,

  'Dental Clinic': `Hi, I came across {business_name} and noticed your healthcare practice. A professional, trustworthy website can help patients review your dental treatments, doctor profiles, and request appointments easily.

Would you be open to reviewing a quick website concept for your clinic?`,

  'Retail Shop': `Hi, I came across {business_name} and really liked your shop. A sleek digital catalog website can help showcase your top products, latest arrivals, and drive more foot traffic to your store.

Would you like to take a look at a website concept for your shop?`,

  Coaching: `Hi, I came across {business_name} and noticed your educational institute. A modern website would help students and parents view your course schedules, faculty, achievements, and enroll easily.

Would you be open to seeing a quick website idea designed for your coaching center?`,

  'Service Business': `Hi, I came across {business_name} and really liked your services. A dedicated professional website can help establish instant credibility, highlight your service offerings, and capture direct customer inquiries.

Would you be open to seeing a quick website concept tailored for your business?`,

  Other: `Hi, I came across {business_name} and noticed that your business has a great presence online. A modern, dedicated website would help showcase your offerings and make it easier for new customers to find and contact you.

Would you be open to taking a look at a quick concept?`,
};

const STORAGE_KEY = 'anx_leads_category_whatsapp_templates_v1';

/**
 * Loads saved category templates from localStorage with fallback to defaults.
 */
export function getStoredCategoryTemplates(): Record<BusinessCategoryKey, string> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      return { ...DEFAULT_CATEGORY_WHATSAPP_TEMPLATES };
    }
    const parsed = JSON.parse(raw);
    const result = { ...DEFAULT_CATEGORY_WHATSAPP_TEMPLATES };
    ALL_BUSINESS_CATEGORIES.forEach((cat) => {
      if (parsed[cat] && typeof parsed[cat] === 'string' && parsed[cat].trim() !== '') {
        result[cat] = parsed[cat];
      }
    });
    return result;
  } catch (err) {
    console.warn('Error reading category templates from localStorage:', err);
    return { ...DEFAULT_CATEGORY_WHATSAPP_TEMPLATES };
  }
}

/**
 * Persists all category templates to localStorage.
 */
export function saveStoredCategoryTemplates(
  templates: Record<BusinessCategoryKey, string>
): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  } catch (err) {
    console.warn('Error saving category templates to localStorage:', err);
  }
}

/**
 * Saves a single category template directly to localStorage and returns the complete updated record.
 */
export function saveCategoryTemplate(
  category: BusinessCategoryKey,
  templateText: string
): Record<BusinessCategoryKey, string> {
  const current = getStoredCategoryTemplates();
  current[category] = templateText;
  saveStoredCategoryTemplates(current);
  return current;
}

/**
 * Resets a single category template back to its default message in localStorage.
 */
export function resetCategoryTemplate(
  category: BusinessCategoryKey
): Record<BusinessCategoryKey, string> {
  const current = getStoredCategoryTemplates();
  current[category] = DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[category];
  saveStoredCategoryTemplates(current);
  return current;
}

/**
 * Gets active template for a category from localStorage.
 */
export function getActiveCategoryTemplate(category: BusinessCategoryKey): string {
  const all = getStoredCategoryTemplates();
  return all[category] || DEFAULT_CATEGORY_WHATSAPP_TEMPLATES[category] || DEFAULT_CATEGORY_WHATSAPP_TEMPLATES['Other'];
}

/**
 * Matches any arbitrary category string from Google Places / manual entry to the closest standard category.
 */
export function matchCategoryKey(rawCategory?: string | null): BusinessCategoryKey {
  if (!rawCategory) return 'Other';
  const norm = rawCategory.toLowerCase();

  if (
    norm.includes('restaurant') ||
    norm.includes('dining') ||
    norm.includes('food') ||
    norm.includes('eatery') ||
    norm.includes('dhaba') ||
    norm.includes('bistro') ||
    norm.includes('cuisine') ||
    norm.includes('pizza') ||
    norm.includes('biryani') ||
    norm.includes('burger')
  ) {
    return 'Restaurant';
  }

  if (
    norm.includes('beauty') ||
    norm.includes('parlour') ||
    norm.includes('parlor') ||
    norm.includes('makeup') ||
    norm.includes('cosmetic') ||
    norm.includes('bridal')
  ) {
    return 'Beauty Parlour';
  }

  if (
    norm.includes('salon') ||
    norm.includes('barber') ||
    norm.includes('hair') ||
    norm.includes('spa') ||
    norm.includes('massage')
  ) {
    return 'Salon';
  }

  if (
    norm.includes('gym') ||
    norm.includes('fitness') ||
    norm.includes('workout') ||
    norm.includes('crossfit') ||
    norm.includes('yoga') ||
    norm.includes('pilates') ||
    norm.includes('athletic')
  ) {
    return 'Gym';
  }

  if (
    norm.includes('hotel') ||
    norm.includes('resort') ||
    norm.includes('lodge') ||
    norm.includes('motel') ||
    norm.includes('guest house') ||
    norm.includes('stay') ||
    norm.includes('inn') ||
    norm.includes('hostel')
  ) {
    return 'Hotel';
  }

  if (
    norm.includes('cafe') ||
    norm.includes('café') ||
    norm.includes('coffee') ||
    norm.includes('tea') ||
    norm.includes('espresso')
  ) {
    return 'Cafe';
  }

  if (
    norm.includes('bakery') ||
    norm.includes('cake') ||
    norm.includes('pastry') ||
    norm.includes('bakes') ||
    norm.includes('confectionery') ||
    norm.includes('sweets') ||
    norm.includes('sweet shop')
  ) {
    return 'Bakery';
  }

  if (
    norm.includes('dent') ||
    norm.includes('dental') ||
    norm.includes('orthodont') ||
    norm.includes('tooth') ||
    norm.includes('teeth') ||
    norm.includes('clinic') ||
    norm.includes('hospital') ||
    norm.includes('doctor') ||
    norm.includes('medical')
  ) {
    return 'Dental Clinic';
  }

  if (
    norm.includes('retail') ||
    norm.includes('shop') ||
    norm.includes('store') ||
    norm.includes('mart') ||
    norm.includes('clothing') ||
    norm.includes('boutique') ||
    norm.includes('jewel') ||
    norm.includes('grocery') ||
    norm.includes('apparel') ||
    norm.includes('footwear') ||
    norm.includes('optician')
  ) {
    return 'Retail Shop';
  }

  if (
    norm.includes('coach') ||
    norm.includes('tuition') ||
    norm.includes('institute') ||
    norm.includes('academy') ||
    norm.includes('school') ||
    norm.includes('class') ||
    norm.includes('education') ||
    norm.includes('training') ||
    norm.includes('college')
  ) {
    return 'Coaching';
  }

  if (
    norm.includes('service') ||
    norm.includes('repair') ||
    norm.includes('mechanic') ||
    norm.includes('garage') ||
    norm.includes('plumb') ||
    norm.includes('electric') ||
    norm.includes('clean') ||
    norm.includes('carpenter') ||
    norm.includes('tailor') ||
    norm.includes('agency') ||
    norm.includes('contractor') ||
    norm.includes('legal') ||
    norm.includes('accounting') ||
    norm.includes('ca ') ||
    norm.includes('consultant')
  ) {
    return 'Service Business';
  }

  return 'Other';
}

/**
 * Replaces supported variables ({business_name}, {category}) with actual lead info.
 */
export function renderCategoryTemplate(
  template: string,
  lead: { name: string; category?: string }
): string {
  let output = template;
  output = output.replace(/\{business_name\}/gi, lead.name || 'your business');
  output = output.replace(/\{category\}/gi, lead.category || 'business');
  return output;
}
