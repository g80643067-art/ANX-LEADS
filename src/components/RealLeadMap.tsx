import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ExternalLink, MapPin, Globe, Phone } from 'lucide-react';
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Filter leads with valid coordinates
  const leadsWithCoords = leads.filter(
    (l) => l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number'
  );

  const defaultCenter: [number, number] = selectedLead?.coordinates
    ? [selectedLead.coordinates.lat, selectedLead.coordinates.lng]
    : leadsWithCoords[0]?.coordinates
    ? [leadsWithCoords[0].coordinates.lat, leadsWithCoords[0].coordinates.lng]
    : [25.4358, 81.8463]; // Prayagraj

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: selectedLead?.coordinates ? 15 : 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when leads or selectedLead changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);

    leadsWithCoords.forEach((lead) => {
      if (!lead.coordinates) return;
      const latLng: [number, number] = [lead.coordinates.lat, lead.coordinates.lng];
      bounds.extend(latLng);

      const isNoWebsite = lead.websiteStatus === 'No Website Found';
      const isSelected = selectedLead?.id === lead.id;

      const pinColor = isNoWebsite ? '#f59e0b' : '#2563eb';
      const pinBg = isNoWebsite ? '#78350f' : '#1e3a8a';
      const scale = isSelected ? 1.25 : 1;
      const zIndexOffset = isSelected ? 1000 : isNoWebsite ? 500 : 100;

      const iconHtml = `
        <div style="
          transform: scale(${scale});
          transition: transform 0.15s ease-out;
          filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            background: ${pinColor};
            color: #ffffff;
            border: 2px solid #ffffff;
            border-radius: 9999px;
            padding: 3px 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            max-width: 140px;
          ">
            <span>${isNoWebsite ? '⚡' : '🌐'}</span>
            <span style="overflow: hidden; text-overflow: ellipsis;">${escapeHtml(lead.name.slice(0, 14))}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid ${pinColor};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'real-lead-marker',
        html: iconHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(latLng, {
        icon: customIcon,
        zIndexOffset,
      }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit; padding: 10px; font-size: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: ${isNoWebsite ? '#b45309' : '#1d4ed8'}; text-transform: uppercase; margin-bottom: 2px;">
            ${escapeHtml(lead.category)} · ${isNoWebsite ? '⚡ No Website (Lead Opportunity)' : '🌐 Official Website Listed'}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #1c1917; margin-bottom: 4px; line-height: 1.2;">
            ${escapeHtml(lead.name)}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 6px;">
            📍 ${escapeHtml(lead.fullAddress || lead.location)}
          </div>
          ${
            lead.contactNumber && lead.contactNumber !== 'Not Found'
              ? `<div style="font-size: 11px; font-family: monospace; color: #047857; font-weight: 600; margin-bottom: 6px;">📞 ${escapeHtml(lead.contactNumber)}</div>`
              : ''
          }
          ${
            lead.websiteUrl
              ? `<a href="${escapeHtml(lead.websiteUrl)}" target="_blank" style="display: block; font-size: 11px; color: #2563eb; text-decoration: underline; margin-bottom: 8px;">🌐 Visit Website →</a>`
              : ''
          }
          <button
            id="view-lead-btn-${lead.id}"
            style="
              width: 100%;
              padding: 6px 10px;
              background-color: #f59e0b;
              color: #1c1917;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            "
          >
            Open Lead Profile & Contact →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-lead-btn-${lead.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectLead(lead);
          };
        }
      });

      marker.on('click', () => {
        onSelectLead(lead);
      });

      markersRef.current.set(lead.id, marker);
    });

    // Pan to selected or fit bounds
    if (selectedLead?.coordinates) {
      map.flyTo([selectedLead.coordinates.lat, selectedLead.coordinates.lng], 15, { duration: 0.6 });
      const selMarker = markersRef.current.get(selectedLead.id);
      if (selMarker) {
        selMarker.openPopup();
      }
    } else if (leadsWithCoords.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [selectedLead, leads, onSelectLead]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-full min-h-[380px]">
      {/* Map Bar Header */}
      <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 font-bold text-stone-800">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>Interactive Verified Business Map</span>
          {leadsWithCoords.length > 0 && (
            <span className="text-stone-500 font-normal">
              ({leadsWithCoords.length} plotted business{leadsWithCoords.length === 1 ? '' : 'es'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>No Website ({leads.filter((l) => l.websiteStatus === 'No Website Found').length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Has Website ({leads.filter((l) => l.websiteStatus === 'Website Found').length})</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full min-h-[340px]">
        <div ref={mapContainerRef} className="w-full h-full min-h-[340px]" />

        {leadsWithCoords.length === 0 && (
          <div className="absolute inset-0 bg-stone-50/90 flex flex-col items-center justify-center p-6 text-center text-xs text-stone-500 z-[400]">
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
