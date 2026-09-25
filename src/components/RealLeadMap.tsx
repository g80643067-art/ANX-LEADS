import React, { useEffect, useRef } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { BusinessLeadItem } from '../types/lead';

interface RealLeadMapProps {
  selectedLead: BusinessLeadItem | null;
  leads: BusinessLeadItem[];
  onSelectLead: (lead: BusinessLeadItem) => void;
}

export const RealLeadMap: React.FC<RealLeadMapProps> = ({
  selectedLead,
  leads,
  onSelectLead,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Find lead with valid coordinates or fallback
  const leadsWithCoords = leads.filter(
    (l) => l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number'
  );

  const defaultCenter = selectedLead?.coordinates || (leadsWithCoords[0]?.coordinates) || {
    lat: 25.4358,
    lng: 81.8463, // Prayagraj default
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined') return;

    // Check if google maps sdk is loaded
    const google = (window as any).google;
    if (!google?.maps?.Map) return;

    // Initialize Map once
    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: selectedLead?.coordinates ? 15 : 13,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => {
      if (m.setMap) m.setMap(null);
      if (m.map) m.map = null;
    });
    markersRef.current = [];

    // Add Markers for all leads with coordinates
    const infoWindow = new google.maps.InfoWindow();

    leadsWithCoords.forEach((lead) => {
      if (!lead.coordinates) return;

      const isSelected = selectedLead?.id === lead.id;
      const isNoWebsite = lead.websiteStatus === 'No Website Found';

      // Pin Color: Amber for No Website, Blue for Website Found, Stone for other
      const pinColor = isNoWebsite ? '#f59e0b' : '#2563eb';

      let marker: any = null;

      // Try AdvancedMarkerElement if available
      if (google.maps.marker?.AdvancedMarkerElement) {
        const pinContainer = document.createElement('div');
        pinContainer.style.cursor = 'pointer';
        pinContainer.innerHTML = `
          <div style="
            background: ${pinColor};
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 6px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 4px;
            transform: scale(${isSelected ? 1.2 : 1});
            transition: transform 0.15s ease-out;
          ">
            <span>${isNoWebsite ? '⚡' : '📍'}</span>
            <span>${escapeHtml(lead.name.slice(0, 16))}</span>
          </div>
        `;

        marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: lead.coordinates,
          title: lead.name,
          content: pinContainer,
        });

        marker.addListener('click', () => {
          onSelectLead(lead);
          infoWindow.setContent(`
            <div style="padding: 6px; font-family: sans-serif; font-size: 12px; max-width: 220px;">
              <strong style="display:block; margin-bottom: 2px;">${escapeHtml(lead.name)}</strong>
              <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">${escapeHtml(lead.category)} · ${escapeHtml(lead.location)}</div>
              <div style="font-weight: bold; color: ${isNoWebsite ? '#b45309' : '#047857'}; margin-bottom: 6px;">
                ${lead.websiteStatus}
              </div>
              ${
                lead.googleListingUrl
                  ? `<a href="${lead.googleListingUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Open in Google Maps →</a>`
                  : ''
              }
            </div>
          `);
          infoWindow.open(map, marker);
        });
      }

      if (marker) {
        markersRef.current.push(marker);
      }
    });

    // Pan to selected lead if coordinates exist
    if (selectedLead?.coordinates) {
      map.panTo(selectedLead.coordinates);
      map.setZoom(15);
    } else if (leadsWithCoords.length > 0) {
      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      leadsWithCoords.forEach((l) => {
        if (l.coordinates) bounds.extend(l.coordinates);
      });
      map.fitBounds(bounds);
    }
  }, [selectedLead, leads, onSelectLead]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-full min-h-[380px]">
      {/* Map Bar Header */}
      <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-stone-800">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>Interactive Google Map Location</span>
          {leadsWithCoords.length > 0 && (
            <span className="text-stone-500 font-normal">
              ({leadsWithCoords.length} plotted business{leadsWithCoords.length === 1 ? '' : 'es'})
            </span>
          )}
        </div>

        {selectedLead && selectedLead.googleListingUrl && (
          <a
            href={selectedLead.googleListingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full min-h-[340px]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[340px]" />

        {leadsWithCoords.length === 0 && (
          <div className="absolute inset-0 bg-stone-50/90 flex flex-col items-center justify-center p-6 text-center text-xs text-stone-500">
            <MapPin className="w-8 h-8 text-stone-400 mb-2" />
            <p className="font-semibold text-stone-700">No Location Markers Available</p>
            <p className="mt-1 max-w-sm text-stone-500">
              Perform a search above with a City or Locality to plot live businesses onto the map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
