"use client";

import { Plus, Minus } from "lucide-react";

interface MapToolsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMaximize?: () => void;
}

export default function MapTools({ onZoomIn, onZoomOut }: MapToolsProps) {
  return (
    <div className="absolute bottom-5 left-5 z-40">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
        <button 
          onClick={onZoomIn}
          className="p-3 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-100"
        >
          <Plus size={16} />
        </button>
        <button 
          onClick={onZoomOut}
          className="p-3 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}
