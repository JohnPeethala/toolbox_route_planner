"use client";

import { useState } from "react";
import { Check, X, Layers, MapPin, Truck, Ticket, Ban, Navigation2 } from "lucide-react";
import { getTicketConfig, getVehicleColor } from "@/lib/constants";
import VehicleSelector from "./VehicleSelector";
import { LocationGroup } from "@/context/DispatchContext";

interface NodeGroupCardProps {
  group: LocationGroup;
  vehicles: string[];
  assignedVehicle: string;
  ticketVehicles: Record<string, string>;
  isPulsing: boolean;
  showCoords: boolean;
  onToggleCoords: () => void;
  onUpdateCoords: (coords: string) => void;
  onAssignGroupVehicle: (vehicle: string) => void;
  onAssignTicketVehicle: (ticketId: string, vehicle: string) => void;
}

export default function NodeGroupCard({
  group,
  vehicles,
  assignedVehicle,
  ticketVehicles,
  isPulsing,
  showCoords,
  onToggleCoords,
  onUpdateCoords,
  onAssignGroupVehicle,
  onAssignTicketVehicle
}: NodeGroupCardProps) {
  const isMixed = assignedVehicle === "MIXED";
  const vehicleColor = (assignedVehicle && !isMixed) ? getVehicleColor(assignedVehicle, vehicles) : null;
  const hasCoords = !!group.coords;
  
  const typeSummary: Record<string, number> = {};
  group.tickets?.forEach((t: any) => {
    const k = (t.type || 'general').toLowerCase().trim();
    typeSummary[k] = (typeSummary[k] || 0) + 1;
  });

  const handleCardClick = () => {
    if (group.coords) {
      window.dispatchEvent(new CustomEvent('tactical-map-focus-node', { detail: group.id }));
    }
  };

  return (
    <div id={`node-group-${group.id}`} className={`flex flex-col border-l-[3px] rounded-r-xl overflow-hidden shrink-0 bg-white border border-gray-200 shadow-sm transition-all duration-300 ${
      isMixed 
        ? 'border-l-purple-500'
        : (vehicleColor 
            ? vehicleColor.borderColor 
            : 'border-l-gray-200'
          )
    } ${isPulsing ? 'ring-2 ring-blue-500/30 scale-[0.99]' : ''}`}>
      
      {/* Card Header */}
      <div 
        className="p-3 border-b border-gray-100 bg-white cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between gap-3">
          
          <div className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 bg-gray-50 text-gray-900">
            <span className="text-[14px] font-bold leading-none">{group.serial || '0'}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {!hasCoords && (
                <span title="OFF-MAP" className="shrink-0 flex"><Ban size={12} className="text-red-500" strokeWidth={2.5} /></span>
              )}
              <h4 className="text-[13px] font-bold uppercase text-gray-900 truncate leading-none">{group.originalArea}</h4>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 ml-1 leading-none pt-[1px]">{group.pincode}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <div className="flex items-center justify-center h-5 px-1.5 rounded border border-gray-200 bg-gray-100 mr-1" title="Total Tickets">
                <Ticket size={10} className="text-gray-500" strokeWidth={2.5} />
                <span className="text-[9px] font-semibold text-gray-900 ml-1">{group.tickets?.length || 0}</span>
              </div>
              {Object.entries(typeSummary).map(([typeKey, count]) => {
                const cfg = getTicketConfig(typeKey);
                const Icon = cfg.icon;
                return (
                  <div key={typeKey} className="flex items-center justify-center h-5 px-1.5 rounded border border-gray-200 bg-gray-50" title={cfg.label}>
                    {Icon && <Icon size={10} className={cfg.color} strokeWidth={2.5} />}
                    <span className="text-[9px] font-semibold text-gray-600 ml-1">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <VehicleSelector 
                  value={assignedVehicle}
                  onSelect={onAssignGroupVehicle}
                  iconOnly={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Card Section */}
      <div className="flex flex-col">
        {/* Ticket List */}
        <div className={`flex flex-col ${isMixed ? 'bg-purple-50/30' : 'bg-white'}`}>
          {group.tickets?.map((ticket: any, tIdx: number) => {
            const config = getTicketConfig(ticket.type);
            const ticketKey = `${group.id}::${ticket.id}`;
            const ticketVehicle = ticketVehicles[ticketKey] || '';
            
            return (
              <div key={tIdx} className="px-3 py-1.5 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  {config.icon && <span title={config.label} className="shrink-0 flex"><config.icon size={12} className={config.color} strokeWidth={2.5} /></span>}
                  <span className="text-[10px] font-bold text-gray-900">{ticket.id || 'NO-ID'}</span>
                  <span className="text-[10px] font-bold uppercase truncate text-gray-900 ml-1">{ticket.name || 'No Name'}</span>
                </div>
                
                <div className="shrink-0">
                  <VehicleSelector 
                    value={ticketVehicle}
                    onSelect={(v) => onAssignTicketVehicle(ticket.id, v)}
                    iconOnly={true}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Coords Row */}
        <div className="px-3 py-2 flex items-center justify-between bg-gray-100">
          <div className="flex-1">
            {!showCoords ? (
              <button 
                onClick={onToggleCoords}
                className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-gray-400 hover:text-blue-500 transition-colors"
              >
                <MapPin size={11} className={hasCoords ? "text-emerald-500" : "text-amber-400"} />
                <span className={hasCoords ? "text-gray-500" : "text-amber-500/80"}>
                  {group.coords || 'NO COORDINATES FOUND'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-blue-300 shadow-inner bg-white focus-within:border-blue-500">
                <MapPin size={11} className="text-blue-500 shrink-0" />
                <input 
                  autoFocus 
                  value={group.coords}
                  onChange={(e) => onUpdateCoords(e.target.value)}
                  onBlur={onToggleCoords}
                  className="bg-transparent border-none outline-none text-[10px] font-semibold text-gray-900 w-full placeholder:text-gray-300"
                  placeholder="LAT, LNG"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
