"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  APIProvider, 
  Map,
  useMap,
  Marker
} from '@vis.gl/react-google-maps';
import { Target, Home, Navigation2, Plus, Minus, CircleDashed } from "lucide-react";
import { getVehicleColor, getTicketConfig, TICKET_TYPE_CONFIG } from "@/lib/constants";
import { useDispatch } from "@/context/DispatchContext";
import { renderToStaticMarkup } from "react-dom/server";
import MapTools from "@/components/MapTools";

const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
  "MUMBAI": { lat: 19.0760, lng: 72.8777 },
  "DELHI": { lat: 28.6139, lng: 77.2090 },
  "BENGALURU": { lat: 12.9716, lng: 77.5946 },
  "HYDERABAD": { lat: 17.3850, lng: 78.4867 },
  "CHENNAI": { lat: 13.0827, lng: 80.2707 },
  "KOLKATA": { lat: 22.5726, lng: 88.3639 },
  "PUNE": { lat: 18.5204, lng: 73.8567 },
  "AHMEDABAD": { lat: 23.0225, lng: 72.5714 },
};

const SHARED_CLEAN_STYLES = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.text", stylers: [{ visibility: "off" }] },
];

const DARK_STYLES = [
  ...SHARED_CLEAN_STYLES,
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#1a2e1a" }] },
];

const LIGHT_STYLES = [...SHARED_CLEAN_STYLES];

function generateBarPinSVG(group: any, pinColor: string, isAssigned: boolean) {
  const typeSummary: Record<string, number> = {};
  group.tickets?.forEach((t: any) => {
    const k = (t.type || 'general').toLowerCase().trim();
    typeSummary[k] = (typeSummary[k] || 0) + 1;
  });

  const types = Object.keys(typeSummary);
  const serialText = String(group.serial || '0');
  
  const textColor = isAssigned ? '#ffffff' : '#4b5563';
  const dividerColor = isAssigned ? '#ffffff40' : '#e5e7eb';
  const bgColor = isAssigned ? pinColor : '#ffffff';
  
  let svgContent = '';
  let currentX = 6;
  
  types.forEach(t => {
    const count = typeSummary[t];
    const cfg: any = getTicketConfig(t);
    const hex = cfg.hex || '#9ca3af';
    const Icon = cfg.icon;
    
    if (types.indexOf(t) > 0) {
      svgContent += `<line x1="${currentX}" y1="5" x2="${currentX}" y2="19" stroke="${dividerColor}" stroke-width="1.5" />`;
      currentX += 8;
    }

    if (Icon) {
      const iconMarkup = renderToStaticMarkup(<Icon size={12} color={isAssigned ? '#ffffff' : hex} strokeWidth={2.5} />);
      svgContent += `<g transform="translate(${currentX}, 6)">${iconMarkup}</g>`;
      currentX += 16;
    } else {
      const short = cfg.short || t.charAt(0).toUpperCase();
      svgContent += `<circle cx="${currentX + 6}" cy="12" r="6" fill="${isAssigned ? '#ffffff30' : hex}" />`;
      svgContent += `<text x="${currentX + 6}" y="15.5" font-family="sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">${short}</text>`;
      currentX += 16;
    }
    
    const countText = String(count);
    svgContent += `<text x="${currentX}" y="15.5" font-family="sans-serif" font-size="11" font-weight="bold" fill="${textColor}">${countText}</text>`;
    currentX += (countText.length * 7) + 6;
  });

  const boxWidth = Math.max(currentX + 2, 24);
  const boxHeight = 24;
  
  const badgeWidth = Math.max(16, serialText.length * 7 + 8);
  const badgeHeight = 16;
  
  const totalWidth = boxWidth + (badgeWidth / 2) + 4; // Add 4px for left stroke padding
  const totalHeight = (badgeHeight / 2) + boxHeight + 6;

  const svg = `
    <svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.1"/>
        </filter>
      </defs>
      
      <g transform="translate(2, ${badgeHeight / 2})">
        <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" rx="4" fill="${bgColor}" stroke="${pinColor}" stroke-width="2" filter="url(#shadow)"/>
        <polygon points="${boxWidth / 2 - 5},${boxHeight - 1} ${boxWidth / 2 + 5},${boxHeight - 1} ${boxWidth / 2},${boxHeight + 5}" fill="${pinColor}" />
        ${svgContent}
      </g>
      
      <!-- Power Badge (Top Right) -->
      <g transform="translate(${boxWidth - (badgeWidth / 2) + 2}, 0)">
        <rect x="0" y="0" width="${badgeWidth}" height="${badgeHeight}" rx="${badgeHeight / 2}" fill="#1f2937" stroke="#ffffff" stroke-width="2" />
        <text x="${badgeWidth / 2}" y="11.5" font-family="sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">${serialText}</text>
      </g>
    </svg>
  `;
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    width: totalWidth,
    height: totalHeight,
    anchorX: (boxWidth / 2) + 2,
    anchorY: totalHeight
  };
}

function WarehouseMarker() {
  const warehouseCoords = { lat: 17.548377214877075, lng: 78.34705192140262 };
  
  // Clean, high-contrast round pin
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#000000" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  return (
    <Marker
      position={warehouseCoords}
      title="HOME WAREHOUSE"
      zIndex={1000}
      icon={{
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: typeof google !== 'undefined' ? new google.maps.Size(32, 32) : undefined,
        anchor: typeof google !== 'undefined' ? new google.maps.Point(16, 16) : undefined,
      }}
    />
  );
}

function MapEngine() {
  const context = useDispatch();
  const { groups, city, groupVehicles, vehicles, assignGroupVehicle } = context;
  const map = useMap();
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const prevGroupsLenRef = useRef(0);

  const basePinColor = "#52525b";
  const labelColor = "#ffffff";
  const mixedColor = "#a855f7"; 
  const warehouseCoords = { lat: 17.548377214877075, lng: 78.34705192140262 };
  const polylinesRef = useRef<Record<string, google.maps.Polyline>>({});

  const fitView = useCallback(() => {
    if (!map || typeof google === 'undefined') return;
    const bounds = new google.maps.LatLngBounds();
    
    // Always include warehouse in bounds
    bounds.extend(warehouseCoords);
    
    let hasValid = false;
    groups.forEach(g => {
      if (!g.coords) return;
      const parts = g.coords.split(',').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        bounds.extend({ lat: parts[0], lng: parts[1] });
        hasValid = true;
      }
    });

    if (hasValid || true) { // Force zoom even if only warehouse
      map.fitBounds(bounds, { top: 100, right: 450, bottom: 100, left: 100 });
      if (map.getZoom()! > 15) map.setZoom(15);
    }
  }, [map, groups, warehouseCoords]);


  useEffect(() => {
    const handleAction = (e: any) => {
      if (!map) return;
      if (e.detail === 'pan') fitView();
      if (e.detail === 'in') map.setZoom((map.getZoom() || 12) + 1);
      if (e.detail === 'out') map.setZoom((map.getZoom() || 12) - 1);
    };
    window.addEventListener('tactical-map-action', handleAction);
    return () => window.removeEventListener('tactical-map-action', handleAction);
  }, [map, fitView]);

  useEffect(() => {
    const handleAssignVehicle = (e: CustomEvent) => {
      assignGroupVehicle(e.detail.groupId, e.detail.vehicle);
    };
    window.addEventListener('tactical-map-assign-vehicle', handleAssignVehicle as EventListener);
    return () => window.removeEventListener('tactical-map-assign-vehicle', handleAssignVehicle as EventListener);
  }, [groups, assignGroupVehicle]);

  useEffect(() => {
    const handleFocusNode = (e: any) => {
      if (!map) return;
      const groupId = e.detail;
      const group = groups.find(g => g.id === groupId);
      if (group && group.coords) {
        const parts = group.coords.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          map.panTo({ lat: parts[0], lng: parts[1] });
          const currentZoom = map.getZoom() || 12;
          if (currentZoom < 14) map.setZoom(14);
          setTimeout(() => {
            if (map) map.panBy(200, 0);
          }, 300);
        }
      }
    };
    window.addEventListener('tactical-map-focus-node', handleFocusNode);
    return () => window.removeEventListener('tactical-map-focus-node', handleFocusNode);
  }, [map, groups]);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const currentGroups = new Set(groups.map(g => g.id));
    
    Object.keys(markersRef.current).forEach(id => {
      if (!currentGroups.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    groups.forEach((group: any) => {
      if (!group.coords) return;
      const parts = group.coords.split(',').map((p: string) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const pos = { lat: parts[0], lng: parts[1] };
        
        const assignedVehicle = groupVehicles[group.id] || '';
        const isMixed = assignedVehicle === "MIXED";
        const vColor = (assignedVehicle && !isMixed) ? getVehicleColor(assignedVehicle, vehicles) : null;
        
        let pinColor = basePinColor;

        if (isMixed) {
          pinColor = mixedColor;
        } else if (vColor) {
          pinColor = vColor.hex;
        }

        const isAssigned = pinColor !== basePinColor;
        const pinData = generateBarPinSVG(group, pinColor, isAssigned);

        if (markersRef.current[group.id]) {
          const m = markersRef.current[group.id];
          const icon = m.getIcon() as google.maps.Icon;
          
          if (!icon || icon.url !== pinData.url) {
            m.setIcon({
              url: pinData.url,
              anchor: new google.maps.Point(pinData.anchorX, pinData.anchorY),
            });
            m.setLabel(null); // Remove default label
          }
        } else {
          const marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
              url: pinData.url,
              anchor: new google.maps.Point(pinData.anchorX, pinData.anchorY),
            },
            title: `Node ${group.serial}: ${group.originalArea}`
          });

          marker.addListener('click', () => {
            // Pan to the marker and shift camera right to center pin in visible area
            map.panTo(pos);
            const currentZoom = map.getZoom() || 12;
            if (currentZoom < 14) map.setZoom(14);
            
            // Allow panTo animation to finish before offsetting
            setTimeout(() => {
              if (map) map.panBy(200, 0);
            }, 300);
            
            // Scroll to the card
            const el = document.getElementById(`node-group-${group.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Optional: Add a brief highlight class and remove it
              el.classList.add('ring-2', 'ring-blue-500');
              setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500'), 1500);
            }
          });

          marker.addListener('rightclick', (e: any) => {
            if (e.domEvent) {
              e.domEvent.preventDefault();
              e.domEvent.stopPropagation();
              window.dispatchEvent(new CustomEvent('tactical-map-context-menu', { 
                detail: { 
                  groupId: group.id, 
                  x: e.domEvent.clientX, 
                  y: e.domEvent.clientY,
                  vehicle: groupVehicles[group.id] || ''
                } 
              }));
            }
          });

          markersRef.current[group.id] = marker;
        }
      }
    });

    if (groups.length > 0 && groups.length !== prevGroupsLenRef.current) {
      fitView();
      prevGroupsLenRef.current = groups.length;
    }
  }, [groups, map, groupVehicles, vehicles, basePinColor, mixedColor, fitView]);

  // Route Visualization Logic
  useEffect(() => {
    const handleRouteAction = async (e: any) => {
      if (!map || typeof google === 'undefined') return;
      const { vehicle } = e.detail;

      const directionsService = new google.maps.DirectionsService();

      // Clear existing polylines
      if (vehicle === 'all') {
        Object.values(polylinesRef.current).forEach(p => p.setMap(null));
        polylinesRef.current = {};
      } else if (polylinesRef.current[vehicle]) {
        polylinesRef.current[vehicle].setMap(null);
      }

      if (!vehicle) return;

      const vehiclesToRoute = vehicle === 'all' ? vehicles : [vehicle];
      const allBounds = new google.maps.LatLngBounds();
      allBounds.extend(warehouseCoords);

      for (const v of vehiclesToRoute) {
        const assignedNodes = groups.filter(g => groupVehicles[g.id] === v && g.coords);
        if (assignedNodes.length === 0) continue;

        const waypoints = assignedNodes.map(g => {
          const p = g.coords.split(',').map(c => parseFloat(c.trim()));
          return {
            location: new google.maps.LatLng(p[0], p[1]),
            stopover: true
          };
        });

        try {
          const result = await directionsService.route({
            origin: warehouseCoords,
            destination: warehouseCoords,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
          });

          if (result.routes[0]) {
            // Get the optimized order of waypoints
            const optimizedOrder = result.routes[0].waypoint_order;
            const orderedWaypoints = optimizedOrder.map(idx => waypoints[idx].location);
            
            // Build the straight-line path: Warehouse -> Optimized Waypoints -> Warehouse
            const straightPath = [
              warehouseCoords,
              ...orderedWaypoints,
              warehouseCoords
            ];

            const polyline = new google.maps.Polyline({
              path: straightPath,
              geodesic: true,
              strokeColor: getVehicleColor(v, vehicles)?.hex || "#3b82f6",
              strokeOpacity: 0.8,
              strokeWeight: 3,
              map: map
            });

            polylinesRef.current[v] = polyline;
            straightPath.forEach(p => allBounds.extend(p));
          }
        } catch (err) {
          console.error(`Optimization failed for vehicle ${v}:`, err);
        }
      }

      // Fit view to all active optimized routes
      if (!allBounds.isEmpty()) {
        map.fitBounds(allBounds, { top: 100, right: 450, bottom: 100, left: 100 });
      }
    };

    window.addEventListener('tactical-map-visualize-route', handleRouteAction);
    return () => window.removeEventListener('tactical-map-visualize-route', handleRouteAction);
  }, [map, groups, groupVehicles, vehicles]);

  useEffect(() => {
    const handleClearRoute = (e: any) => {
      const { vehicle } = e.detail;
      if (vehicle === 'all') {
        Object.values(polylinesRef.current).forEach(p => p.setMap(null));
        polylinesRef.current = {};
      } else if (polylinesRef.current[vehicle]) {
        polylinesRef.current[vehicle].setMap(null);
        delete polylinesRef.current[vehicle];
      }
    };
    window.addEventListener('tactical-map-clear-route', handleClearRoute);
    return () => window.removeEventListener('tactical-map-clear-route', handleClearRoute);
  }, []);

  useEffect(() => {
    const handleToggleRoutes = () => {
      Object.values(polylinesRef.current).forEach(p => {
        const isVisible = p.getVisible();
        p.setVisible(!isVisible);
      });
    };
    window.addEventListener('tactical-map-toggle-routes', handleToggleRoutes);
    return () => window.removeEventListener('tactical-map-toggle-routes', handleToggleRoutes);
  }, []);

  // Handle unmount cleanup separately
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach((m) => m.setMap(null));
      Object.values(polylinesRef.current).forEach((p) => p.setMap(null));
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    const coords = CITY_COORDS[city.toUpperCase().trim()];
    if (coords) map.panTo(coords);
  }, [city, map]);

  return null;
}

export default function MapComponent() {
  const context = useDispatch();
  const vehicles = context?.vehicles || [];
  const assignGroupVehicle = context?.assignGroupVehicle || (() => {});
  
  const [contextMenu, setContextMenu] = useState<{ groupId: string, x: number, y: number, vehicle: string } | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: any) => {
      // Use setTimeout to ensure this runs AFTER any document-level contextmenu listeners that might clear it
      setTimeout(() => {
        setContextMenu(e.detail);
      }, 10);
    };
    window.addEventListener('tactical-map-context-menu', handleContextMenu);
    return () => window.removeEventListener('tactical-map-context-menu', handleContextMenu);
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleClick);
    }
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [contextMenu]);

  const trigger = (type: 'pan' | 'in' | 'out') => {
    window.dispatchEvent(new CustomEvent('tactical-map-action', { detail: type }));
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <div className="h-full w-full relative transition-colors duration-300 bg-white">
        
        {/* Top Left Overlay */}
        <div className="absolute top-24 left-6 z-20 pointer-events-none">
          <MapOverlay />
        </div>


        {/* Map Legend */}
        <div className="absolute bottom-5 left-5 z-20">
          <MapLegend />
        </div>

        <Map
          defaultCenter={{ lat: 17.548377214877075, lng: 78.34705192140262 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true} 
          styles={LIGHT_STYLES}
        >
          <MapEngine />
          <WarehouseMarker />
        </Map>

        {/* Right-Click Context Menu for Vehicle Assignment */}
        {contextMenu && (
          <div 
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[180px] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="max-h-[200px] overflow-y-auto py-1">
              <button
                onClick={() => { assignGroupVehicle(contextMenu.groupId, ""); setContextMenu(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  !contextMenu.vehicle ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <CircleDashed size={13} strokeWidth={1.5} />
                UNASSIGNED
              </button>
              {vehicles.map((v) => {
                const color = getVehicleColor(v, vehicles);
                const Icon = color ? color.icon : CircleDashed;
                const isSelected = v === contextMenu.vehicle;
                return (
                  <button
                    key={v}
                    onClick={() => { assignGroupVehicle(contextMenu.groupId, v); setContextMenu(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={13} className={color ? color.textColor : ''} strokeWidth={1.5} />
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .shadow-google {
          box-shadow: 0 1px 4px -1px rgba(0,0,0,0.3);
        }
      `}</style>
    </APIProvider>
  );
}

function MapLegend() {
  const types = Object.values(TICKET_TYPE_CONFIG);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-3 flex flex-col gap-2">
      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Legend</h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {types.map((type, i) => {
          const Icon = type.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-gray-50 border border-gray-100">
                {Icon ? <Icon size={11} color={type.hex} strokeWidth={2.5} /> : <span className="text-[8px] font-bold" style={{ color: type.hex }}>{type.short}</span>}
              </div>
              <span className="text-[10px] font-bold text-gray-600 whitespace-nowrap">{type.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapOverlay() {
  const context = useDispatch();
  const groups = context?.groups || [];

  return (
    <div className="px-3 py-1.5 rounded-lg border border-gray-200 backdrop-blur-md flex items-center gap-2 bg-white/90 shadow-sm">
      <div className={`w-2 h-2 rounded-full ${groups.some(g => g.coords) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
        {context?.city} • {groups.filter(g => g.coords).length} Nodes Resolved
      </span>
    </div>
  );
}
