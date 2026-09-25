import React from 'react';
import { Phone, MapPin, Bookmark, CheckCircle2, ArrowUpRight, Clock, Globe } from 'lucide-react';
import { BusinessProfile } from '../types/business';

interface BusinessCardProps {
  business: BusinessProfile;
  distanceMiles?: number | null;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (business: BusinessProfile) => void;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  distanceMiles,
  isSaved,
  onToggleSave,
  onSelect,
  isHovered,
  onHover,
}) => {
  // Check if open today
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const todayHours = business.hours.find((h) => h.day === todayName);

  return (
    <div
      onMouseEnter={() => onHover && onHover(business.id)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`relative bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
        isHovered
          ? 'border-amber-400 shadow-md ring-1 ring-amber-300'
          : 'border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Top Banner & Image Section */}
      <div className="relative h-44 bg-stone-100 overflow-hidden">
        {business.image ? (
          <img
            src={business.image}
            alt={business.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              // Graceful fallback to styled icon container
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 p-4 text-center">
            <span className="text-3xl mb-1">
              {business.isInternational ? '🌍' : '🏬'}
            </span>
            <span className="text-xs font-semibold text-stone-700">{business.category}</span>
            <span className="text-[11px] text-stone-500">
              {business.city}, {business.country || 'India'}
            </span>
          </div>
        )}

        {/* Lead Opportunity Kicker on Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          {!business.hasWebsite ? (
            <div className="bg-amber-500/95 backdrop-blur-xs text-stone-950 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-950 animate-pulse" />
              <span>No Website · Lead Prospect</span>
            </div>
          ) : (
            <div className="bg-stone-900/85 backdrop-blur-xs text-stone-200 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-xs">
              Has Digital Website
            </div>
          )}

          {business.isInternational && (
            <div className="bg-sky-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <Globe className="w-3 h-3 text-sky-200" />
              <span>{business.country}</span>
            </div>
          )}
        </div>

        {/* Save Lead Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(business.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-amber-400 text-stone-950 shadow-sm ring-1 ring-amber-300'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-stone-950 shadow-xs'
          }`}
          title={isSaved ? 'Saved to Lead List' : 'Save to Lead List'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-stone-950 text-stone-950' : ''}`} />
        </button>

        {/* Verification Status Banner at bottom of image */}
        {business.isVerifiedStorefront && (
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[11px] font-medium text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Storefront Verified</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line: Category · Distance · Established */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1.5 flex-wrap">
            <span className="text-amber-800 font-semibold">{business.category}</span>
            {distanceMiles !== undefined && distanceMiles !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-stone-700">
                  {distanceMiles.toFixed(1)} mi away
                </span>
              </>
            )}
            {business.establishedYear && (
              <>
                <span aria-hidden="true">·</span>
                <span>Est. {business.establishedYear}</span>
              </>
            )}
          </div>

          {/* Business Name */}
          <h3
            onClick={() => onSelect(business)}
            className="text-base font-bold text-stone-900 hover:text-amber-700 cursor-pointer transition-colors leading-snug line-clamp-1"
          >
            {business.name}
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {business.description}
          </p>

          {/* Address & Hours Snippet */}
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-600">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span className="truncate">
                {business.address}, {business.city}, {business.state} {business.zip ? `· ${business.zip}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              {todayHours ? (
                todayHours.isClosed ? (
                  <span className="text-rose-600 font-medium">Closed Today ({todayName})</span>
                ) : (
                  <span>
                    Today ({todayName}): {todayHours.open} - {todayHours.close}
                  </span>
                )
              ) : (
                <span className="text-stone-400">Hours not confirmed</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Phone Link */}
          <a
            href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-amber-700 transition-colors py-1 px-2 rounded-md hover:bg-stone-100"
            title="Call Phone Number"
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono tabular-nums">{business.phone}</span>
          </a>

          {/* View Details Profile */}
          <button
            type="button"
            onClick={() => onSelect(business)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:text-amber-700 py-1 px-2.5 rounded-md hover:bg-amber-50 transition-colors"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
