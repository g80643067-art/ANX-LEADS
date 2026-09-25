import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusinessProfile } from '../types/business';
import { GeoPoint } from '../utils/geo';

interface InteractiveMapProps {
  businesses: BusinessProfile[];
  selectedBusiness: BusinessProfile | null;
  hoveredBusinessId: string | null;
  onSelectBusiness: (business: BusinessProfile) => void;
  centerCoords: GeoPoint | null;
  radiusMiles: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  businesses,
  selectedBusiness,
  hoveredBusinessId,
  onSelectBusiness,
  centerCoords,
  radiusMiles,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Brooklyn / NYC
    const defaultCenter: [number, number] = centerCoords
      ? [centerCoords.lat, centerCoords.lng]
      : [40.6892, -73.9712];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // High quality OpenStreetMap / CartoDB Voyager tiles (clean, light, perfect for business discovery)
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

  // Update Markers & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Add search radius circle if specified
    if (centerCoords && radiusMiles > 0) {
      const radiusMeters = radiusMiles * 1609.34;
      const circle = L.circle([centerCoords.lat, centerCoords.lng], {
        radius: radiusMeters,
        color: '#f59e0b',
        fillColor: '#fef3c7',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);
      circleRef.current = circle;
    }

    const bounds = L.latLngBounds([]);

    // Add business markers
    businesses.forEach((biz) => {
      const latLng: [number, number] = [biz.coordinates.lat, biz.coordinates.lng];
      bounds.extend(latLng);

      const isNoWebsite = !biz.hasWebsite;
      const isSelected = selectedBusiness?.id === biz.id;
      const isHovered = hoveredBusinessId === biz.id;

      // Custom SVG Pin Icon
      const pinColor = isNoWebsite ? '#f59e0b' : '#3b82f6';
      const pinBg = isNoWebsite ? '#78350f' : '#1e3a8a';
      const scale = isSelected || isHovered ? 1.25 : 1;
      const zIndexOffset = isSelected || isHovered ? 1000 : isNoWebsite ? 500 : 100;

      const iconHtml = `
        <div style="
          transform: scale(${scale});
          transition: transform 0.15s ease-out;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            background: ${pinColor};
            color: ${pinBg};
            border: 2px solid #ffffff;
            border-radius: 9999px;
            padding: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          ">
            <span style="font-size: 14px; line-height: 1;">${isNoWebsite ? '⚡' : '🌐'}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${pinColor};
            margin-top: -1px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(latLng, {
        icon: customIcon,
        zIndexOffset,
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit; padding: 12px;">
          <div style="font-size: 10px; font-weight: 700; color: ${isNoWebsite ? '#b45309' : '#1d4ed8'}; text-transform: uppercase; margin-bottom: 2px;">
            ${biz.category} · ${isNoWebsite ? 'No Website' : 'Has Website'}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #1c1917; margin-bottom: 4px; line-height: 1.2;">
            ${biz.name}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 8px;">
            📍 ${biz.address}, ${biz.city}
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #44403c; margin-bottom: 10px;">
            📞 ${biz.phone}
          </div>
          <button
            id="view-biz-${biz.id}"
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
            View Full Profile →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-biz-${biz.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectBusiness(biz);
          };
        }
      });

      marker.on('click', () => {
        onSelectBusiness(biz);
      });

      markersRef.current.set(biz.id, marker);
    });

    // Adjust view to fit markers or centerCoords
    if (centerCoords) {
      if (radiusMiles > 0) {
        map.flyTo([centerCoords.lat, centerCoords.lng], getZoomForRadius(radiusMiles), {
          duration: 0.8,
        });
      } else if (businesses.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else {
        map.flyTo([centerCoords.lat, centerCoords.lng], 13, { duration: 0.8 });
      }
    } else if (businesses.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [businesses, centerCoords, radiusMiles, hoveredBusinessId, selectedBusiness]);

  // Handle selected business fly-to
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBusiness) return;

    map.flyTo(
      [selectedBusiness.coordinates.lat, selectedBusiness.coordinates.lng],
      15,
      { duration: 0.6 }
    );

    const marker = markersRef.current.get(selectedBusiness.id);
    if (marker) {
      marker.openPopup();
    }
  }, [selectedBusiness]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden shadow-inner" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-stone-200 shadow-sm text-xs space-y-1.5 pointer-events-auto">
        <div className="font-bold text-stone-800 text-[11px] uppercase tracking-wider mb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs inline-block" />
          <span className="font-semibold text-amber-900">⚡ No Website (Lead Prospect)</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-xs inline-block" />
          <span>🌐 Has Website</span>
        </div>
        {radiusMiles > 0 && (
          <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200">
            Dotted ring: {radiusMiles} mi radius
          </div>
        )}
      </div>

      {/* Quick Recenter Button */}
      {centerCoords && (
        <button
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              map.flyTo([centerCoords.lat, centerCoords.lng], 13, { duration: 0.5 });
            }
          }}
          className="absolute top-4 right-4 z-[400] bg-white hover:bg-stone-50 text-stone-800 px-3 py-1.5 rounded-lg border border-stone-300 shadow-sm text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>🎯 Center on Search</span>
        </button>
      )}
    </div>
  );
};

function getZoomForRadius(miles: number): number {
  if (miles <= 2) return 14;
  if (miles <= 5) return 13;
  if (miles <= 10) return 12;
  if (miles <= 25) return 10;
  return 9;
}
