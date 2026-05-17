"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Truck, Trash2, Navigation2, Target, EyeOff } from "lucide-react";
import { getTicketConfig, getVehicleColor } from "@/lib/constants";
import { useDispatch } from "@/context/DispatchContext";

interface VehicleStatsProps {
  stats: Record<string, Record<string, number>>;
  vehicles: string[];
}

export default function VehicleStats({ stats, vehicles }: VehicleStatsProps) {
  const context = useDispatch();
  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  
  if (vehicles.length === 0) return null;

  const trigger = (type: 'pan' | 'in' | 'out') => {
    window.dispatchEvent(new CustomEvent('tactical-map-action', { detail: type }));
  };

  return (
    <div className="w-[280px] bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg flex flex-col overflow-hidden pointer-events-auto shrink-0 h-fit max-h-full relative">
      {confirmClear && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-2">Clear {confirmClear}?</h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-8">This unassigns all active tickets for this vehicle.</p>
            <div className="flex items-center gap-3 w-full">
              <button 
                onClick={() => setConfirmClear(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  context.clearVehicleAssignments(confirmClear);
                  window.dispatchEvent(new CustomEvent('tactical-map-clear-route', { detail: { vehicle: confirmClear } }));
                  setConfirmClear(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest shadow-md hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-gray-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">Active Fleet</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tactical-map-toggle-routes'))}
            className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
            title="Toggle Routes"
          >
            <EyeOff size={12} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tactical-map-visualize-route', { detail: { vehicle: 'all' } }))}
            className="w-6 h-6 flex items-center justify-center bg-black text-white rounded hover:bg-gray-800 transition-all"
            title="Visualize All Routes"
          >
            <Navigation2 size={12} fill="currentColor" className="rotate-45" />
          </button>
          <button
            onClick={() => trigger('pan')}
            className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
            title="Fit All Nodes"
          >
            <Target size={12} />
          </button>
        </div>
      </div>
      <div className="p-2 flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {vehicles.map(vehicle => {
          const vStats = stats[vehicle] || {};
          const types = Object.keys(vStats);
          const total = types.reduce((sum, t) => sum + vStats[t], 0);
          
          if (total === 0) return null;
          
          const vColor = getVehicleColor(vehicle, vehicles);
          const VIcon = vColor?.icon || Truck;
          
          return (
            <div key={vehicle} className={`bg-white border border-gray-100 rounded-md shadow-sm shrink-0 border-l-4 ${vColor?.borderColor || 'border-gray-200'}`}>
              <div className="p-1.5 flex items-center gap-2 overflow-hidden">
                {/* Left side: Logo, Badge */}
                <div className="flex items-center gap-2 shrink-0" title={vehicle}>
                  <VIcon size={15} className={vColor?.textColor || "text-gray-500"} shrink-0 />
                  <div className={`text-[11px] font-black px-2 py-0.5 rounded ${vColor?.badge || 'bg-gray-100 text-gray-600'}`}>
                    {total}
                  </div>
                </div>
                
                {/* Divider */}
                {types.length > 0 && <div className="w-px h-5 bg-gray-200 shrink-0 mx-0.5" />}

                {/* Right side: Compact Row with Icons */}
                {types.length > 0 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
                    {types.map(type => {
                      const tConfig = getTicketConfig(type);
                      const Icon = tConfig.icon;
                      return (
                        <div key={type} className="flex items-center gap-1 shrink-0" title={tConfig.label}>
                          <Icon size={13} className={tConfig.color} />
                          <span className="text-xs font-bold text-gray-700">{vStats[type]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto pl-1">
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('tactical-map-visualize-route', { detail: { vehicle } }))}
                    className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    title={`Map Route for ${vehicle}`}
                  >
                    <Navigation2 size={13} className="rotate-45" />
                  </button>
                  <button 
                    onClick={() => setConfirmClear(vehicle)}
                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title={`Clear ${vehicle} Assignments`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {vehicles.every(v => {
          const types = Object.keys(stats[v] || {});
          return types.reduce((sum, t) => sum + (stats[v][t] || 0), 0) === 0;
        }) && (
          <div className="text-[10px] text-gray-400 text-center py-3 uppercase tracking-widest font-bold">
            No Assignments
          </div>
        )}
      </div>
    </div>
  );
}
