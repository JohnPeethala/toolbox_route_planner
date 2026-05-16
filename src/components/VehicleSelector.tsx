"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CircleDashed, Layers, ChevronDown } from "lucide-react";
import { getVehicleColor } from "@/lib/constants";
import { useDispatch } from "@/context/DispatchContext";

interface VehicleSelectorProps {
  value: string;
  onSelect: (v: string) => void;
  compact?: boolean;
  iconOnly?: boolean;
}

export default function VehicleSelector({ 
  value, 
  onSelect, 
  compact = false,
  iconOnly = false
}: VehicleSelectorProps) {
  const context = useDispatch();
  const vehicles = context?.vehicles || [];
  
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  
  const isMixed = value === "MIXED";
  const selectedVehicleColor = (value && !isMixed) ? getVehicleColor(value, vehicles) : null;
  const SelectedIcon = isMixed ? Layers : (selectedVehicleColor ? selectedVehicleColor.icon : CircleDashed);

  const toggleDropdown = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        portalRef.current && !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', () => setIsOpen(false));
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', () => setIsOpen(false));
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={toggleDropdown}
        className={iconOnly 
          ? `w-7 h-7 rounded-lg border flex items-center justify-center transition-all shadow-sm ${
              isOpen ? 'ring-2 ring-blue-500/20 border-blue-400' : ''
            } ${
              isMixed ? 'bg-purple-50 border-purple-200 text-purple-600' : 
              (selectedVehicleColor ? selectedVehicleColor.badge : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')
            }`
          : `w-full flex items-center justify-between gap-2 rounded-lg border transition-all ${
          isOpen ? 'ring-2 ring-blue-500/20 border-blue-400' : 'border-gray-200 hover:border-gray-300'
        } ${
          compact ? 'py-1 px-2' : 'py-1.5 px-3'
        } bg-white`}
      >
        {iconOnly ? (
          <SelectedIcon size={13} strokeWidth={1.5} className={isMixed ? 'text-purple-600' : (selectedVehicleColor ? '' : 'text-gray-400')} />
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <SelectedIcon size={compact ? 11 : 13} className={isMixed ? 'text-purple-600' : (selectedVehicleColor ? selectedVehicleColor.textColor : 'text-gray-300')} strokeWidth={1.5} />
              <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-black uppercase tracking-tight truncate ${
                value ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {isMixed ? 'MIXED ASSIGNMENT' : (value || 'UNASSIGNED')}
              </span>
            </div>
            <ChevronDown size={compact ? 10 : 11} className={`shrink-0 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-[9999] rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 bg-white"
          style={{ 
            top: `${coords.top + 4}px`, 
            left: iconOnly ? undefined : `${coords.left}px`, 
            right: iconOnly ? `${window.innerWidth - (coords.left + coords.width)}px` : undefined,
            width: iconOnly ? '180px' : `${coords.width}px` 
          }}
        >
          <div className="max-h-[200px] overflow-y-auto no-scrollbar py-1">
            <button
              onClick={() => { onSelect(""); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                !value ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              <CircleDashed size={13} strokeWidth={1.5} />
              UNASSIGNED
            </button>
            {vehicles.map((v) => {
              const color = getVehicleColor(v, vehicles);
              const Icon = color ? color.icon : CircleDashed;
              const isSelected = v === value;
              return (
                <button
                  key={v}
                  onClick={() => { onSelect(v); setIsOpen(false); }}
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
        </div>,
        document.body
      )}
    </div>
  );
}
