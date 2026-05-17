"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// --- Types ---

export interface Ticket {
  id: string;
  name: string;
  area: string;
  pincode: string;
  type: string;
  coords?: string;
}

export interface LocationGroup {
  id: string;
  serial: number;
  originalArea: string;
  sanitizedArea: string;
  pincode: string;
  tickets: Ticket[];
  coords: string;
}

interface GeocodingProgress {
  current: number;
  total: number;
}

interface DispatchContextType {
  // Data
  city: string;
  groups: LocationGroup[];
  vehicles: string[];
  groupVehicles: Record<string, string>;
  ticketVehicles: Record<string, string>;
  
  // Status
  isGeocoding: boolean;
  geocodingProgress: GeocodingProgress;
  unassignedCount: number;

  // Actions
  setCity: (city: string) => void;
  setGroups: (groups: LocationGroup[]) => void;
  setVehicles: (vehicles: string[]) => void;
  addVehicle: (name: string) => Promise<void>;
  removeVehicle: (name: string) => Promise<void>;
  assignGroupVehicle: (groupId: string, vehicle: string) => void;
  assignTicketVehicle: (groupId: string, ticketId: string, vehicle: string) => void;
  clearVehicleAssignments: (vehicle: string) => Promise<void>;
  updateCoords: (groupId: string, coords: string) => void;
  commitManifest: (tickets: Ticket[], action: 'append' | 'replace') => Promise<void>;
  resetDispatch: () => void;
  fetchStateFromDB: () => Promise<void>;
}

// --- Context ---

const DispatchContext = createContext<DispatchContextType | undefined>(undefined);

// --- Provider ---

export function DispatchProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState("Mumbai");
  const [groups, setGroups] = useState<LocationGroup[]>([]);
  const [vehicles, setVehiclesState] = useState<string[]>([]);
  const [groupVehicles, setGroupVehicles] = useState<Record<string, string>>({});
  const [ticketVehicles, setTicketVehicles] = useState<Record<string, string>>({});
  
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });

  // --- Derived State ---
  const unassignedCount = groups.filter(g => !groupVehicles[g.id]).length;

  // --- Persistence Initialization ---
  useEffect(() => {
    const savedCity = localStorage.getItem("route-planner-city");
    if (savedCity) setCityState(savedCity);
    
    fetchStateFromDB();
  }, []);

  const fetchStateFromDB = async () => {
    const { data: fleetData } = await supabase.from('fleet').select('*');
    if (fleetData) {
      setVehiclesState(fleetData.map(f => f.vehicle_name));
    }

    const { data: ticketsData } = await supabase.from('tickets').select('*');
    if (!ticketsData) return;

    const { data: geoData } = await supabase.from('geo_dictionary').select('*');
    const geoMap = new Map<string, string>();
    geoData?.forEach(g => {
       geoMap.set(`${g.area}::${g.pincode}`.toLowerCase(), `${g.lat}, ${g.lng}`);
    });

    const parsedGroups: Record<string, LocationGroup> = {};
    const gVehiclesMap: Record<string, string> = {};
    const tVehiclesMap: Record<string, string> = {};

    ticketsData.forEach(t => {
      const sanitizedArea = (t.area || 'UNKNOWN').toUpperCase().trim();
      const sanitizedPincode = (t.pincode || '000000').trim();
      const groupId = `${sanitizedArea}-${sanitizedPincode}`;
      
      if (!parsedGroups[groupId]) {
        const cacheKey = `${(t.area||'UNKNOWN').trim()}::${sanitizedPincode}`.toLowerCase();
        parsedGroups[groupId] = {
          id: groupId,
          serial: 0,
          originalArea: (t.area || 'UNKNOWN AREA').toUpperCase().trim(),
          sanitizedArea,
          pincode: sanitizedPincode,
          tickets: [],
          coords: geoMap.get(cacheKey) || "",
        };
      }
      
      const ticketObj: Ticket = {
        id: t.ticket_id,
        name: t.name,
        area: t.area,
        pincode: t.pincode,
        type: t.type
      };
      
      parsedGroups[groupId].tickets.push(ticketObj);
      
      if (t.assigned_vehicle) {
        tVehiclesMap[`${groupId}::${t.ticket_id}`] = t.assigned_vehicle;
      }
    });

    const groupsArray = Object.values(parsedGroups).map((g, idx) => {
      let groupVehicle = "";
      if (g.tickets.length > 0) {
        const firstV = tVehiclesMap[`${g.id}::${g.tickets[0].id}`];
        const allSame = g.tickets.every(tk => tVehiclesMap[`${g.id}::${tk.id}`] === firstV);
        if (allSame && firstV) {
          groupVehicle = firstV;
        } else if (!allSame) {
          const hasAny = g.tickets.some(tk => tVehiclesMap[`${g.id}::${tk.id}`]);
          if (hasAny) groupVehicle = "MIXED";
        }
      }
      if (groupVehicle) gVehiclesMap[g.id] = groupVehicle;

      return { ...g, serial: idx + 1 };
    });

    setGroups(groupsArray);
    setGroupVehicles(gVehiclesMap);
    setTicketVehicles(tVehiclesMap);
  };

  // --- Actions ---

  const setCity = (val: string) => {
    setCityState(val);
    localStorage.setItem("route-planner-city", val);
  };

  const setVehicles = async (list: string[]) => {
    setVehiclesState(list);
    // Ideally we would sync fleet additions to Supabase here
    // but the user only mentioned ticket data pipeline.
    // For completeness, we can just update local state or add it to DB if needed.
  };

  const addVehicle = async (name: string) => {
    const formattedName = (name || '').trim().toUpperCase();
    if (!formattedName || vehicles.includes(formattedName)) return;
    
    setVehiclesState(prev => [...prev, formattedName]);
    const { error } = await supabase.from('fleet').insert({ vehicle_name: formattedName });
    if (error) {
      console.error("Failed to add vehicle to DB:", error);
      setVehiclesState(prev => prev.filter(v => v !== formattedName));
    }
  };

  const removeVehicle = async (name: string) => {
    // Local state unassignment
    setGroupVehicles(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(groupId => {
        if (next[groupId] === name) delete next[groupId];
      });
      return next;
    });
    setTicketVehicles(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === name) delete next[key];
      });
      return next;
    });

    setVehiclesState(prev => prev.filter(v => v !== name));
    
    // DB sync
    const { error } = await supabase.from('fleet').delete().eq('vehicle_name', name);
    if (error) {
      console.error("Failed to remove vehicle from DB:", error);
      fetchStateFromDB(); // Restore state on error
      return;
    }

    // Unassign tickets in DB
    await supabase.from('tickets').update({ assigned_vehicle: null }).eq('assigned_vehicle', name);
  };

  const assignGroupVehicle = async (groupId: string, vehicle: string) => {
    setGroupVehicles(prev => ({ ...prev, [groupId]: vehicle }));
    
    const group = groups.find(g => g.id === groupId);
    if (group) {
      // 1. Update local ticket vehicles state
      setTicketVehicles(prev => {
        const next = { ...prev };
        group.tickets.forEach(t => {
          const key = `${groupId}::${t.id}`;
          if (!vehicle) delete next[key];
          else next[key] = vehicle;
        });
        return next;
      });

      // 2. Sync to Database
      const ticketIds = group.tickets.map(t => t.id);
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_vehicle: vehicle || null })
        .in('ticket_id', ticketIds);

      if (error) {
        console.error("Failed to sync group assignment to DB:", error);
      }
    }
  };

  const assignTicketVehicle = (groupId: string, ticketId: string, vehicle: string) => {
    const key = `${groupId}::${ticketId}`;
    setTicketVehicles(prev => {
      const next = { ...prev };
      if (!vehicle) delete next[key];
      else next[key] = vehicle;
      return next;
    });

    // Auto-Sync: If this was the only ticket or if all tickets now match, update the group
    const group = groups.find(g => g.id === groupId);
    if (group) {
      if (group.tickets.length === 1) {
        setGroupVehicles(prev => ({ ...prev, [groupId]: vehicle }));
      } else {
        // Multi-ticket group logic:
        // Check if all tickets now have the SAME vehicle
        setTicketVehicles(currentTickets => {
          const allSame = group.tickets.every(t => {
            const tKey = `${groupId}::${t.id}`;
            const val = (t.id === ticketId) ? vehicle : currentTickets[tKey];
            return val === vehicle;
          });
          
          if (allSame) {
            setGroupVehicles(prev => ({ ...prev, [groupId]: vehicle }));
          } else {
            setGroupVehicles(prev => ({ ...prev, [groupId]: "MIXED" }));
          }
          return currentTickets;
        });
      }
    }
    
    // Async update DB
    supabase.from('tickets').update({ assigned_vehicle: vehicle || null }).eq('ticket_id', ticketId).then();
  };

  const clearVehicleAssignments = async (vehicle: string) => {
    setGroupVehicles(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(groupId => {
        if (next[groupId] === vehicle) delete next[groupId];
      });
      return next;
    });
    
    setTicketVehicles(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === vehicle) delete next[key];
      });
      return next;
    });

    const { error } = await supabase.from('tickets').update({ assigned_vehicle: null }).eq('assigned_vehicle', vehicle);
    if (error) console.error("Failed to clear vehicle assignments in DB:", error);
  };

  const updateCoords = (groupId: string, val: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, coords: val } : g));
  };

  const resetDispatch = () => {
    setGroups([]);
    setGroupVehicles({});
    setTicketVehicles({});
  };

  const commitManifest = async (pendingRows: Ticket[], action: 'append' | 'replace') => {
    setIsGeocoding(true);
    setGeocodingProgress({ current: 0, total: 100 });

    try {
      // 3. Geographic Grouping
      const uniqueLocationsMap = new Map<string, { area: string, pincode: string, fullAddress: string }>();
      
      pendingRows.forEach(row => {
        const area = (row.area || 'UNKNOWN').trim().toUpperCase();
        const pincode = (row.pincode || '000000').trim();
        const locKey = `${area}::${pincode}`.toLowerCase();
        if (!uniqueLocationsMap.has(locKey)) {
          uniqueLocationsMap.set(locKey, { area, pincode, fullAddress: `${area}, ${city}, ${pincode}` });
        }
      });

      const uniqueLocations = Array.from(uniqueLocationsMap.values());
      const locationCache = new Map<string, {lat: number, lng: number} | null>();

      // 4. Cache Lookup
      const pincodes = Array.from(new Set(uniqueLocations.map(l => l.pincode)));
      const { data: cachedDict, error: cacheErr } = await supabase
        .from('geo_dictionary')
        .select('*')
        .in('pincode', pincodes);

      if (cacheErr) throw new Error("Failed to fetch geo_dictionary: " + cacheErr.message);

      cachedDict?.forEach(row => {
        const key = `${row.area}::${row.pincode}`.toLowerCase();
        locationCache.set(key, { lat: row.lat, lng: row.lng });
      });

      // 4. Google Maps Gap-Fill
      const missingLocations = uniqueLocations.filter(loc => {
        const key = `${loc.area}::${loc.pincode}`.toLowerCase();
        return !locationCache.has(key);
      });

      setGeocodingProgress({ current: 0, total: missingLocations.length });
      let completed = 0;
      const newGeoEntries: any[] = [];

      const BATCH_SIZE = 5;
      for (let i = 0; i < missingLocations.length; i += BATCH_SIZE) {
        const batch = missingLocations.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (loc) => {
          try {
             const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(loc.fullAddress)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
             const data = await response.json();
             
             if (data.status === 'OK' && data.results[0]) {
               const { lat, lng } = data.results[0].geometry.location;
               locationCache.set(`${loc.area}::${loc.pincode}`.toLowerCase(), { lat, lng });
               newGeoEntries.push({ area: loc.area, pincode: loc.pincode, lat, lng });
             } else if (data.status === 'ZERO_RESULTS') {
               locationCache.set(`${loc.area}::${loc.pincode}`.toLowerCase(), null);
             }
          } catch (err) {
             console.error("Geocoding failed for:", loc.fullAddress, err);
          }
          completed++;
        }));
        setGeocodingProgress({ current: completed, total: missingLocations.length });
      }

      // 5. Geo-Dictionary Database Save
      if (newGeoEntries.length > 0) {
        const { error: upsertErr } = await supabase
          .from('geo_dictionary')
          .upsert(newGeoEntries, { onConflict: 'area,pincode' });
        if (upsertErr) throw new Error("Failed to save to geo_dictionary: " + upsertErr.message);
      }

      // 6. Tickets Database Save
      const ticketsToInsert = pendingRows.map(row => ({
        ticket_id: row.id,
        name: (row.name || 'UNKNOWN').trim().toUpperCase(),
        area: (row.area || 'UNKNOWN').trim().toUpperCase(),
        pincode: (row.pincode || '000000').trim(),
        type: (row.type || 'GENERAL').trim().toUpperCase(),
      }));

      if (action === 'replace') {
         const { error: delErr } = await supabase.from('tickets').delete().neq('ticket_id', '0');
         if (delErr) throw new Error("Failed to clear tickets: " + delErr.message);
      }

      const { error: tickErr } = await supabase
        .from('tickets')
        .upsert(ticketsToInsert, { onConflict: 'ticket_id' });
      if (tickErr) throw new Error("Failed to save tickets: " + tickErr.message);

      // 7. UI Release & Render
      await fetchStateFromDB();

    } catch (error: any) {
      alert("Pipeline Error: " + error.message);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <DispatchContext.Provider value={{
      city, groups, vehicles, groupVehicles, ticketVehicles,
      isGeocoding, geocodingProgress, unassignedCount,
      setCity, setGroups, setVehicles: setVehiclesState,
      addVehicle,
      removeVehicle,
      assignGroupVehicle, assignTicketVehicle, clearVehicleAssignments, updateCoords,
      commitManifest, resetDispatch, fetchStateFromDB
    }}>
      {children}
    </DispatchContext.Provider>
  );
}

export function useDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useDispatch must be used within a DispatchProvider');
  }
  return context;
}
