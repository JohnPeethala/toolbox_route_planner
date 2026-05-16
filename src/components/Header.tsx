"use client";

import { MapPin, Users } from "lucide-react";

interface HeaderProps {
  city: string;
  onCityChange: (val: string) => void;
  onFleetOpen: () => void;
  vehicleCount: number;
}

export default function Header({ 
  city, 
  onCityChange, 
  onFleetOpen, 
  vehicleCount 
}: HeaderProps) {
  return (
    <header className="absolute top-5 left-5 z-40 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 flex items-center gap-4 pointer-events-auto">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center rotate-3 shadow-sm bg-black text-white">
            <div className="rotate-[-3deg] flex flex-col items-center -gap-1">
              <span className="text-[9px] font-black leading-none uppercase">TB</span>
              <div className="w-3.5 h-[2px] mt-0.5 bg-white"></div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 bg-blue-500 border-white"></div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-gray-900">The Toolbox</h1>
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-gray-200 bg-gray-100 text-gray-500">v1.2R</span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Route Intelligence</p>
        </div>

        <div className="w-px h-7 bg-gray-200 mx-1"></div>
        
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-blue-500" />
            <input 
              type="text" 
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="CITY CODE"
              className="bg-transparent border-none outline-none text-xs font-bold w-24 placeholder:text-gray-300 uppercase text-gray-900"
            />
          </div>
        </div>

        <div className="w-px h-7 bg-gray-200 mx-1"></div>

        <button
          onClick={onFleetOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
        >
          <Users size={13} className="text-blue-500" />
          FLEET{vehicleCount > 0 ? ` (${vehicleCount})` : ''}
        </button>
      </div>
    </header>
  );
}
