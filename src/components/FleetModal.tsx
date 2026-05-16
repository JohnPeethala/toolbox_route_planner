"use client";

import { X, Users, Truck, Trash2 } from "lucide-react";
import { VEHICLE_PALETTE } from "@/lib/constants";

interface FleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: string[];
  newVehicleName: string;
  setNewVehicleName: (val: string) => void;
  onAddVehicle: () => void;
  onRemoveVehicle: (name: string) => void;
}

export default function FleetModal({
  isOpen,
  onClose,
  vehicles,
  newVehicleName,
  setNewVehicleName,
  onAddVehicle,
  onRemoveVehicle
}: FleetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-[500px] max-h-[80vh] rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 bg-white">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-black text-white">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold uppercase tracking-wider text-gray-900">Fleet Manager</h2>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{vehicles.length} Active Unit{vehicles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 no-scrollbar">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-200">
              <div className="p-5 rounded-full bg-gray-50 border border-gray-100">
                <Truck size={32} strokeWidth={1} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Registry Empty</p>
                <p className="text-[9px] font-medium text-gray-400 mt-1">No active assets detected in system</p>
              </div>
            </div>
          ) : (
            vehicles.map((v, idx) => {
              const color = VEHICLE_PALETTE[idx % VEHICLE_PALETTE.length];
              return (
                <div key={v} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all bg-gray-50 hover:bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border border-gray-100 shrink-0 ${color.textColor} bg-white shadow-sm`}>
                      <color.icon size={15} strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{v}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border border-transparent ${color.badge}`}>UNIT-{idx + 1}</span>
                        <span className="text-[8px] font-bold uppercase text-gray-300 tracking-widest">Active</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveVehicle(v)}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add Vehicle */}
        <div className="p-6 border-t border-gray-100 shrink-0 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newVehicleName}
              onChange={(e) => setNewVehicleName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAddVehicle()}
              placeholder="ASSET IDENTIFIER (e.g. MH-01-VX-99)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-[11px] font-bold bg-gray-50 outline-none text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase"
            />
            <button
              onClick={onAddVehicle}
              disabled={!newVehicleName.trim()}
              className="px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all disabled:opacity-20 bg-black text-white hover:bg-gray-800 shadow-lg active:scale-95"
            >
              REGISTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
