import { BusinessLeadItem, LeadLifecycleStatus } from '../types/lead';

export type OutreachChannel = 'whatsapp' | 'email';
export type OutreachTone = 'friendly' | 'direct_roi' | 'consultative' | 'urgent';

export interface OutreachTemplateConfig {
  channel: OutreachChannel;
  tone: OutreachTone;
  senderName?: string;
  agencyName?: string;
  customOffer?: string;
}

export interface GeneratedOutreach {
  channel: OutreachChannel;
  subject?: string;
  body: string;
  whatsappUrl?: string;
  mailtoUrl?: string;
}

/**
 * Returns tailored pitch points based on the business category
 */
function getCategoryPitch(category: string, hasWebsite: boolean): {
  hook: string;
  painPoint: string;
  benefit: string;
  cta: string;
} {
  const catLower = category.toLowerCase();

  if (catLower.includes('restaurant') || catLower.includes('cafe') || catLower.includes('bakery') || catLower.includes('food') || catLower.includes('sweet')) {
    return {
      hook: hasWebsite 
        ? 'modernizing your online table booking and direct order menu' 
        : 'giving your diners a digital menu, direct table booking, and zero-commission ordering',
      painPoint: 'Many food lovers in the city check online menus on smartphones before visiting, and relying only on aggregator apps cuts 20-30% into your profit margins.',
      benefit: 'A mobile-first website with your photos, digital menu, and direct WhatsApp order button brings more daily walk-ins.',
      cta: 'Would you be open for a quick 5-minute preview of a mock menu website I designed for you?',
    };
  }

  if (catLower.includes('salon') || catLower.includes('spa') || catLower.includes('beauty') || catLower.includes('hair') || catLower.includes('makeup')) {
    return {
      hook: hasWebsite 
        ? 'upgrading your salon appointment booking flow' 
        : 'bringing in high-paying bridal and styling clients directly through Google',
      painPoint: 'Clients looking for premium salons want to see price lists, before/after work, and book appointments 24/7 without waiting on phone calls.',
      benefit: 'An aesthetic lookbook website featuring your packages, rate card, and instant WhatsApp booking transforms casual Google searchers into loyal regulars.',
      cta: 'Can I send you a 2-minute demo link showing how your service menu would look online?',
    };
  }

  if (catLower.includes('doctor') || catLower.includes('clinic') || catLower.includes('dentist') || catLower.includes('hospital') || catLower.includes('health')) {
    return {
      hook: hasWebsite 
        ? 'improving patient appointment scheduling and clinic trust' 
        : 'establishing patient trust and hassle-free online appointment scheduling',
      painPoint: 'Patients searching for reliable healthcare look for doctor credentials, clinic timings, and simple consultation booking.',
      benefit: 'A clean, professional website provides verified clinic hours, doctor profiles, and immediate appointment requests.',
      cta: 'Would you like to see a sample appointment system designed specifically for your clinic?',
    };
  }

  if (catLower.includes('hotel') || catLower.includes('resort') || catLower.includes('homestay') || catLower.includes('stay') || catLower.includes('lodge')) {
    return {
      hook: hasWebsite 
        ? 'increasing direct room bookings to bypass OTA commissions' 
        : 'getting direct guest room bookings without paying 18-25% OTA commissions',
      painPoint: 'Paying high commissions to booking portals eats away profits that could stay with your business.',
      benefit: 'A fast booking website with photo galleries, room amenities, and direct WhatsApp inquiries keeps full revenue with you.',
      cta: 'Can I share a quick mockup of a direct booking landing page tailored for your property?',
    };
  }

  if (catLower.includes('gym') || catLower.includes('fitness') || catLower.includes('yoga') || catLower.includes('trainer')) {
    return {
      hook: hasWebsite 
        ? 'automating member signups and membership package displays' 
        : 'showcasing membership plans, trainer profiles, and free trial passes',
      painPoint: 'Fitness enthusiasts in your area compare gyms online before signing up. Without an official website, you lose trials to competitors.',
      benefit: 'A high-energy website displaying gym equipment, transformation stories, and free 1-day trial passes generates continuous memberships.',
      cta: 'Can I send you a sample fitness pass landing page built for your gym?',
    };
  }

  if (catLower.includes('auto') || catLower.includes('car') || catLower.includes('bike') || catLower.includes('repair') || catLower.includes('service')) {
    return {
      hook: hasWebsite 
        ? 'capturing emergency repair calls and service bookings online' 
        : 'capturing roadside and routine service inquiries across your area',
      painPoint: 'Car and bike owners look for transparent service pricing and quick call assistance when they need repairs.',
      benefit: 'A dedicated service website with 1-tap call/WhatsApp buttons and service price lists converts emergency searches into immediate customers.',
      cta: 'Would you like to see how an instant-booking automotive site can increase your workshop appointments?',
    };
  }

  // Default / General Local Business
  return {
    hook: hasWebsite 
      ? 'boosting your local customer reach and modernizing your web presence' 
      : 'helping local customers find you first and trust your brand with an official website',
    painPoint: 'Over 80% of local customers check for an official website on Google before visiting or making large purchases.',
    benefit: 'A professional mobile-friendly website gives you full credibility, customer reviews showcase, and direct inquiry capture on autopilot.',
    cta: 'Are you available for a brief 5-minute chat this week to see how an official website could look for your business?',
  };
}

/**
 * Generates tailored outreach message
 */
export function generateOutreachMessage(
  lead: BusinessLeadItem,
  config: OutreachTemplateConfig
): GeneratedOutreach {
  const hasOfficialWebsite = lead.websiteStatus === 'Website Found';
  const pitch = getCategoryPitch(lead.category, hasOfficialWebsite);
  const sender = config.senderName || 'Your Name';
  const agency = config.agencyName || 'our digital studio';
  const ratingText = lead.googleRating ? ` (noticed your impressive ${lead.googleRating.toFixed(1)}★ Google rating with ${lead.reviewCount || 0} reviews!)` : '';
  const cleanPhone = lead.contactNumber.replace(/[^0-9]/g, '');

  let body = '';
  let subject = '';

  if (config.channel === 'whatsapp') {
    if (config.tone === 'direct_roi') {
      if (lead.leadStatus === 'Follow-up') {
        body = `Hi ${lead.name} team 👋\n\nFollowing up on my previous message regarding your digital presence in ${lead.location}.\n\n${
          !hasOfficialWebsite 
            ? `Your competitors in the ${lead.category} space are capturing customers who search on Google because they have dedicated websites. We can get you a stunning, 1-tap WhatsApp booking website live in 48 hours for a very affordable package.`
            : `I reviewed your current web presence and noticed key areas where you can 2x your mobile conversions and speed up direct inquiries.`
        }\n\n${pitch.cta}\n\nBest regards,\n${sender} | ${agency}`;
      } else if (lead.leadStatus === 'Interested') {
        body = `Hello ${lead.name} team,\n\nGreat connecting with you! As discussed, here is a quick summary of how we help ${lead.category} businesses in ${lead.location} stand out:\n\n1. Modern mobile-first website with 1-click WhatsApp & call buttons\n2. Google Maps SEO optimization so nearby buyers find you first\n3. Complete catalog / service price list showcase\n\nWhen is a convenient time for a 10-minute demo call today or tomorrow?\n\nCheers,\n${sender}`;
      } else {
        // New or Contacted
        body = `Hello ${lead.name} team 👋\n\nI was looking at top-rated ${lead.category}s in ${lead.location}${ratingText}.\n\n${
          !hasOfficialWebsite
            ? `I noticed that while you have a great Google listing, you don't have an official business website linked yet. You're likely losing high-intent customers who search online to competitors who do.`
            : `I saw your business listing online and had a couple of quick growth suggestions to turn more Google visitors into paying customers.`
        }\n\n${pitch.benefit}\n\n${pitch.cta}\n\n— ${sender} | ${agency}`;
      }
    } else if (config.tone === 'friendly') {
      body = `Hi there! 👋 Hope you're having a wonderful week.\n\nI came across ${lead.name} in ${lead.location} while searching for reputable ${lead.category} services in town${ratingText}.\n\n${
        !hasOfficialWebsite
          ? `I noticed you don't have an official website connected on Google yet. We specialize in building fast, beautiful, and easy-to-use websites for local shops that help you get direct inquiries on WhatsApp!`
          : `I love what you've built at ${lead.name} and wanted to share some quick ideas on how a refreshed mobile website can bring you even more daily customers.`
      }\n\nNo pressure at all — ${pitch.cta.toLowerCase()}\n\nWarm regards,\n${sender} from ${agency}`;
    } else if (config.tone === 'urgent') {
      body = `Quick question for ${lead.name} management:\n\nDid you know that over 70% of people searching for "${lead.category} in ${lead.location}" on Google look for an official website before visiting?\n\nRight now, ${
        !hasOfficialWebsite
          ? `you don't have an official website listed on your profile, so potential customers are clicking on other local shops instead.`
          : `your competitors are heavily investing in mobile-friendly booking sites to capture local footfall.`
      }\n\nWe can get your official brand website live in just 48 hours.\n\n${pitch.cta}\n\nThanks,\n${sender}`;
    } else {
      // consultative
      body = `Hello ${lead.name},\n\nMy name is ${sender} with ${agency}. I work with ${lead.category} businesses in ${lead.location} to increase direct customer acquisition.\n\n${pitch.painPoint}\n\n${
        !hasOfficialWebsite
          ? `By having your own official website, you establish instant authority and give customers a frictionless way to explore your services and reach out directly.`
          : `By refining your website user journey, you can dramatically increase daily phone calls and walk-ins.`
      }\n\n${pitch.cta}\n\nRegards,\n${sender}`;
    }

    // Format WhatsApp Web/App URL
    const encodedBody = encodeURIComponent(body);
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodedBody}`
      : `https://wa.me/?text=${encodedBody}`;

    return {
      channel: 'whatsapp',
      body,
      whatsappUrl,
    };
  }

  // EMAIL CHANNEL
  if (lead.leadStatus === 'Follow-up') {
    subject = `Following up: Official website & digital growth for ${lead.name}`;
    body = `Hi ${lead.name} Team,

I hope you are having a productive week.

I am following up on my previous note regarding ${lead.name}'s digital presence in ${lead.location}.

${!hasOfficialWebsite
  ? `As a top-rated ${lead.category} in ${lead.location}, having an official business website is the highest-ROI asset you can own. It builds instant consumer trust, showcases your complete offerings, and gives customers a direct way to call or WhatsApp you without relying on third-party directories.`
  : `I wanted to check if you had a chance to consider modernizing ${lead.name}'s website to increase conversion rates from local Google searchers.`
}

${pitch.benefit}

${pitch.cta}

Looking forward to hearing from you.

Best regards,

${sender}
${agency}
${config.customOffer ? `\nP.S. ${config.customOffer}` : ''}`;
  } else if (lead.leadStatus === 'Interested') {
    subject = `Next Steps: Website Design & Growth Proposal for ${lead.name}`;
    body = `Dear ${lead.name} Team,

Thank you for your interest in partnering with ${agency} to level up your web presence!

Based on your business profile as a premier ${lead.category} in ${lead.location}, here is what we can deliver:

1. A sleek, high-converting mobile-friendly website tailored to your brand
2. Direct 1-tap call & WhatsApp inquiry buttons for instant leads
3. Integration of your Google reviews, gallery, and operating hours (${lead.openingHours !== 'Not Found' ? lead.openingHours : 'Custom schedule'})
4. Local SEO configuration so nearby customers find you on Google Search and Maps

Would 11:00 AM tomorrow work for a brief 10-minute walkthrough call?

Best regards,

${sender}
${agency}`;
  } else {
    // New or General Outreach
    subject = !hasOfficialWebsite
      ? `Website inquiry & proposal for ${lead.name} (${lead.location})`
      : `Digital growth & web optimization for ${lead.name}`;

    body = `Dear ${lead.name} Team,

I recently came across ${lead.name} while researching leading ${lead.category} businesses in ${lead.location}${ratingText}.

${!hasOfficialWebsite
  ? `I noticed that while you have built a strong reputation and positive customer reviews, there is currently no official business website linked to your Google listing. In today's market, over 80% of local customers look for an official site to verify pricing, opening hours, and service details before visiting.`
  : `I was reviewing your online presence and noticed several high-impact opportunities to increase conversion rates from local searchers exploring ${lead.name} on smartphones.`
}

${pitch.painPoint}

${pitch.benefit}

${pitch.cta}

Thank you for your time, and wishing your team continued success.

Sincerely,

${sender}
${agency}`;
  }

  const mailtoSubject = encodeURIComponent(subject);
  const mailtoBody = encodeURIComponent(body);
  const mailtoUrl = `mailto:?subject=${mailtoSubject}&body=${mailtoBody}`;

  return {
    channel: 'email',
    subject,
    body,
    mailtoUrl,
  };
}
