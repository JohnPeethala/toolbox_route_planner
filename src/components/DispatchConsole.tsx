"use client";

import { useState } from "react";
import { LayoutGrid, PlusSquare, Database, Navigation2, Target } from "lucide-react";
import { useDispatch } from "@/context/DispatchContext";
import { getVehicleColor } from "@/lib/constants";
import NodeGroupCard from "./NodeGroupCard";
import VehicleStats from "./VehicleStats";

interface DispatchConsoleProps {
  onLoadData: () => void;
}

export default function DispatchConsole({ onLoadData }: DispatchConsoleProps) {
  const context = useDispatch();
  
  const groups = context?.groups || [];
  const vehicles = context?.vehicles || [];
  const groupVehicles = context?.groupVehicles || {};
  const ticketVehicles = context?.ticketVehicles || {};
  const assignGroupVehicle = context?.assignGroupVehicle || (() => {});
  const assignTicketVehicle = context?.assignTicketVehicle || (() => {});
  const updateCoords = context?.updateCoords || (() => {});
  
  const totalTickets = groups.reduce((sum, g) => sum + g.tickets.length, 0);
  const unassignedTickets = groups.reduce((sum, g) => {
    return sum + g.tickets.filter(t => !ticketVehicles[`${g.id}::${t.id}`]).length;
  }, 0);
  const [showCoordsForGroup, setShowCoordsForGroup] = useState<string | null>(null);
  const [pulseGroup, setPulseGroup] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const vehicleStats: Record<string, Record<string, number>> = {};
  vehicles.forEach(v => { vehicleStats[v] = {}; });

  groups.forEach(group => {
    group.tickets.forEach(ticket => {
      const vehicle = ticketVehicles[`${group.id}::${ticket.id}`];
      if (vehicle && vehicleStats[vehicle] !== undefined) {
        const type = ticket.type || 'Unknown';
        if (!vehicleStats[vehicle][type]) {
          vehicleStats[vehicle][type] = 0;
        }
        vehicleStats[vehicle][type]++;
      }
    });
  });

  const handleGroupAssign = (groupId: string, v: string) => {
    assignGroupVehicle(groupId, v);
    if (v) {
      setPulseGroup(groupId);
      setTimeout(() => setPulseGroup(null), 1000);
    }
  };

  return (
    <aside className="absolute top-5 right-5 bottom-5 flex gap-3 z-30 pointer-events-none">
      
      {/* Left Column (Stats + Map Controls) */}
      <div className="flex flex-col h-full items-end gap-3 pointer-events-none">
        <VehicleStats stats={vehicleStats} vehicles={vehicles} />
      </div>

      <div className="w-[400px] h-full rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-lg bg-white/95 backdrop-blur-md pointer-events-auto">
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between shrink-0 z-10 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-md border-b-transparent' 
            : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-gray-900">Dispatch Console</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100/80 border border-gray-200/50">
                  <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.1em]">
                    <span className="text-gray-900">{unassignedTickets}</span><span className="text-gray-400 mx-0.5">/</span><span className="text-gray-900">{totalTickets}</span>
                    <span className="ml-1 text-gray-400">Not Assigned</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onLoadData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all bg-black text-white hover:bg-gray-800">
            <PlusSquare size={13} /> LOAD DATA
          </button>
        </div>

        {/* Body */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2 no-scrollbar bg-gray-50 relative"
          onScroll={(e) => setIsScrolled((e.target as HTMLDivElement).scrollTop > 5)}
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4">
              <Database size={32} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center leading-relaxed text-gray-400">System ready for<br />manifest ingestion</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-40">
              {groups.map((group) => {
                const assignedVehicle = groupVehicles[group.id] || '';
                const isPulsing = pulseGroup === group.id;
                const showCoords = showCoordsForGroup === group.id;

                return (
                  <NodeGroupCard
                    key={group.id}
                    group={group}
                    vehicles={vehicles}
                    assignedVehicle={assignedVehicle}
                    ticketVehicles={ticketVehicles}
                    isPulsing={isPulsing}
                    showCoords={showCoords}
                    onToggleCoords={() => setShowCoordsForGroup(showCoords ? null : group.id)}
                    onUpdateCoords={(coords) => updateCoords(group.id, coords)}
                    onAssignGroupVehicle={(v) => handleGroupAssign(group.id, v)}
                    onAssignTicketVehicle={(tId, v) => assignTicketVehicle(group.id, tId, v)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
