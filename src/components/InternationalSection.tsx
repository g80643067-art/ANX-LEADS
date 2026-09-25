import React, { useState, useMemo } from 'react';
import {
  Globe,
  MapPin,
  Phone,
  Bookmark,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Clock,
  Compass,
} from 'lucide-react';
import { BusinessProfile } from '../types/business';

interface InternationalSectionProps {
  businesses: BusinessProfile[];
  savedLeadIds: string[];
  onToggleSave: (id: string) => void;
  onSelectBusiness: (business: BusinessProfile) => void;
  onOpenMapWithBusiness: (business: BusinessProfile) => void;
}

export const InternationalSection: React.FC<InternationalSectionProps> = ({
  businesses,
  savedLeadIds,
  onToggleSave,
  onSelectBusiness,
  onOpenMapWithBusiness,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter only international businesses without websites
  const intlBusinesses = useMemo(() => {
    return businesses.filter(
      (b) => b.isInternational || (b.country && b.country !== 'India')
    );
  }, [businesses]);

  // Unique country list
  const countries = useMemo(() => {
    const set = new Set<string>();
    intlBusinesses.forEach((b) => {
      if (b.country) set.add(b.country);
    });
    return Array.from(set);
  }, [intlBusinesses]);

  // Filtered international businesses
  const filtered = useMemo(() => {
    return intlBusinesses.filter((b) => {
      if (selectedCountry !== 'all' && b.country !== selectedCountry) {
        return false;
      }
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.name.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [intlBusinesses, selectedCountry, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-stone-100 p-6 sm:p-8 border border-stone-800 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/20 to-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Offline Directory · Bina Website Wale International Karobar</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            International Businesses Without Websites
          </h1>
          <p className="mt-2 text-sm text-stone-300 leading-relaxed">
            Discover real, active brick-and-mortar craft workshops, century-old cafes, and master artisans across Japan, the UK, France, Italy, UAE, and the USA that operate successfully without any website or digital domain.
          </p>

          {/* Quick Metrics */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-stone-400">
            <div className="bg-stone-800/80 px-3.5 py-2 rounded-lg border border-stone-700">
              <span className="text-white font-bold text-sm block">100% Offline Profiles</span>
              <span>Zero standalone websites</span>
            </div>
            <div className="bg-stone-800/80 px-3.5 py-2 rounded-lg border border-stone-700">
              <span className="text-white font-bold text-sm block">{countries.length} Global Countries</span>
              <span>Tokyo, London, Paris, Rome, Dubai, NY</span>
            </div>
            <div className="bg-stone-800/80 px-3.5 py-2 rounded-lg border border-stone-700">
              <span className="text-amber-400 font-bold text-sm block">High Lead Potential</span>
              <span>Export, branding & web design prospects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar for International Section */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, craft or name..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Country Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedCountry('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCountry === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            All Countries ({intlBusinesses.length})
          </button>
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                selectedCountry === c
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              <span>{c}</span>
              <span className="text-[10px] opacity-75 font-mono">
                ({intlBusinesses.filter((b) => b.country === c).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of International Businesses */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Globe className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No international businesses found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All Countries".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((biz) => {
            const isSaved = savedLeadIds.includes(biz.id);
            return (
              <div
                key={biz.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header & Country Tag */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        <Globe className="w-3 h-3 text-sky-600" />
                        <span>{biz.country}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleSave(biz.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isSaved
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200'
                        }`}
                        title={isSaved ? 'Lead Saved' : 'Save Lead'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-stone-950' : ''}`} />
                      </button>
                    </div>

                    <h3
                      onClick={() => onSelectBusiness(biz)}
                      className="text-base font-bold text-stone-900 group-hover:text-amber-700 cursor-pointer leading-snug"
                    >
                      {biz.name}
                    </h3>
                    <p className="text-xs font-medium text-amber-800 mt-0.5">
                      {biz.category} {biz.establishedYear && `· Est. ${biz.establishedYear}`}
                    </p>

                    <p className="text-xs text-stone-600 mt-2.5 line-clamp-3 leading-relaxed">
                      {biz.description}
                    </p>

                    {/* Tags */}
                    {biz.tags && biz.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {biz.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Address, Phone, Website Status Notice */}
                  <div className="px-5 py-3 bg-stone-50/60 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {biz.address}, {biz.city}, {biz.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a
                        href={`tel:${biz.phone.replace(/[^0-9+]/g, '')}`}
                        className="font-mono text-stone-800 hover:underline"
                      >
                        {biz.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      <span>Has No Website · High Opportunity Score: {biz.leadOpportunityScore}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-stone-100 flex items-center justify-between gap-2 bg-white">
                  <button
                    type="button"
                    onClick={() => onOpenMapWithBusiness(biz)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    <span>View on Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectBusiness(biz)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Full Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
