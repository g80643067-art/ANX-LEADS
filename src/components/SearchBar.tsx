import React, { useState } from 'react';
import { Search, MapPin, Locate, SlidersHorizontal, X, Check, Globe, Globe2 } from 'lucide-react';
import { SearchFilterState } from '../types/business';
import { CATEGORIES } from '../data/seedBusinesses';
import { CITY_HUBS, getCurrentBrowserLocation, resolveLocationQuery } from '../utils/geo';

interface SearchBarProps {
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  totalResults: number;
  onReset: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  setFilters,
  totalResults,
  onReset,
}) => {
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleLocationSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filters.locationQuery.trim()) {
      setFilters((prev) => ({ ...prev, centerCoords: null }));
      return;
    }
    const resolved = resolveLocationQuery(filters.locationQuery);
    if (resolved) {
      setFilters((prev) => ({ ...prev, centerCoords: resolved }));
      setGeoError(null);
    } else {
      // Default fallback coordinates around Lucknow if not strictly resolved
      setFilters((prev) => ({
        ...prev,
        centerCoords: { lat: 26.8467, lng: 80.9462 },
      }));
    }
  };

  const handleGpsDetect = async () => {
    setIsLocating(true);
    setGeoError(null);
    try {
      const loc = await getCurrentBrowserLocation();
      setFilters((prev) => ({
        ...prev,
        locationQuery: 'Current GPS Location',
        centerCoords: loc.coords,
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to retrieve location';
      setGeoError(errorMsg);
      setTimeout(() => setGeoError(null), 5000);
    } finally {
      setIsLocating(false);
    }
  };

  const handleCitySelect = (hub: (typeof CITY_HUBS)[0]) => {
    setFilters((prev) => ({
      ...prev,
      locationQuery: hub.label,
      centerCoords: hub.coords,
    }));
  };

  const hasActiveFilters =
    filters.keyword.trim() !== '' ||
    filters.category !== 'all' ||
    filters.websiteStatus !== 'all' ||
    filters.verificationStatus !== 'all' ||
    filters.marketScope !== 'all' ||
    filters.radiusMiles > 0;

  return (
    <div className="bg-white border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Main Search Bar Row */}
        <form onSubmit={handleLocationSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Location Input with GPS trigger */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-amber-600" />
              </div>
              <input
                type="text"
                value={filters.locationQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters((prev) => ({ ...prev, locationQuery: val }));
                  const autoMatch = resolveLocationQuery(val);
                  if (autoMatch) {
                    setFilters((prev) => ({ ...prev, centerCoords: autoMatch }));
                  }
                }}
                placeholder="Type location: Prayagraj, Lucknow, Varanasi, Delhi, Tokyo, London..."
                className="w-full pl-10 pr-24 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={isLocating}
                className="absolute inset-y-1 right-1 px-2.5 flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors disabled:opacity-50"
                title="Detect my current GPS location"
              >
                <Locate className={`h-3.5 w-3.5 text-amber-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'GPS...' : 'Near me'}</span>
              </button>
            </div>

            {/* Keyword / Name Search Input */}
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400" />
              </div>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                placeholder="Search business name, craft, or service..."
                className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              {filters.keyword && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, keyword: '' }))}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown & Submit */}
            <div className="md:col-span-3 flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                title="Execute Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              {/* Filter Panel Toggle */}
              <button
                type="button"
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`px-3 py-2.5 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors shrink-0 ${
                  showFilterDrawer || hasActiveFilters
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-stone-50 border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
                title="Advanced filters"
              >
                <SlidersHorizontal className="h-4 w-4 text-stone-700" />
              </button>
            </div>
          </div>

          {/* Location Error Toast */}
          {geoError && (
            <div className="p-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
              {geoError}
            </div>
          )}

          {/* Quick Hub Presets & Website Prospect Pill Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-stone-500">
              <span className="text-stone-400 text-xs mr-1 font-medium">Quick Cities:</span>
              {CITY_HUBS.map((hub) => {
                const isSelected =
                  filters.locationQuery.toLowerCase().includes(hub.name) ||
                  filters.locationQuery === hub.label;
                return (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => handleCitySelect(hub)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-stone-900 text-stone-100 font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    {hub.isInternational && <Globe className="w-3 h-3 text-amber-500" />}
                    <span>{hub.label.split(',')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Website Prospect Switch (Core app focus) */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs hidden sm:inline">Website Status:</span>
              <div className="inline-flex bg-stone-100 p-0.5 rounded-md border border-stone-200">
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, websiteStatus: 'all' }))}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    filters.websiteStatus === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, websiteStatus: 'no_website' }))}
                  className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-colors ${
                    filters.websiteStatus === 'no_website'
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-amber-800 hover:text-amber-900'
                  }`}
                  title="Show only businesses without websites (High Lead Opportunity)"
                >
                  <Globe className="w-3 h-3 text-amber-950" />
                  <span>No Website (Leads)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, websiteStatus: 'has_website' }))}
                  className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                    filters.websiteStatus === 'has_website'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Globe2 className="w-3 h-3 text-stone-400" />
                  <span>Has Website</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Advanced Filter Drawer */}
          {showFilterDrawer && (
            <div className="mt-3 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Market Scope */}
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Market Scope
                  </label>
                  <select
                    value={filters.marketScope}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        marketScope: e.target.value as SearchFilterState['marketScope'],
                      }))
                    }
                    className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-md text-stone-800"
                  >
                    <option value="all">All Regions (India & International)</option>
                    <option value="domestic">India / Domestic Only</option>
                    <option value="international">International Businesses Only</option>
                  </select>
                </div>

                {/* Radius filter */}
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Search Radius (Miles)
                  </label>
                  <select
                    value={filters.radiusMiles}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, radiusMiles: Number(e.target.value) }))
                    }
                    className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-md text-stone-800"
                  >
                    <option value={0}>Any distance (No limit)</option>
                    <option value={5}>Within 5 miles</option>
                    <option value={15}>Within 15 miles</option>
                    <option value={30}>Within 30 miles</option>
                    <option value={100}>Within 100 miles</option>
                  </select>
                </div>

                {/* Verification status */}
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Verification
                  </label>
                  <select
                    value={filters.verificationStatus}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        verificationStatus: e.target.value as SearchFilterState['verificationStatus'],
                      }))
                    }
                    className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-md text-stone-800"
                  >
                    <option value="all">All Profiles</option>
                    <option value="verified_only">Verified Physical Storefronts</option>
                    <option value="unverified_only">Unverified / Pending</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Sort Order
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        sortBy: e.target.value as SearchFilterState['sortBy'],
                      }))
                    }
                    className="w-full px-2.5 py-2 bg-white border border-stone-300 rounded-md text-stone-800"
                  >
                    <option value="opportunity">Highest Opportunity First</option>
                    <option value="distance">Nearest to Location</option>
                    <option value="name">Alphabetical (A - Z)</option>
                    <option value="newest">Newest Added</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons inside Drawer */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="text-stone-500 font-medium">
                  Found <strong className="text-stone-900">{totalResults}</strong> matching business profiles
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onReset}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 border border-stone-300 rounded-md bg-white hover:bg-stone-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
