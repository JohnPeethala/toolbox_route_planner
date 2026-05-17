"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

// Context & Types
import { useDispatch, Ticket } from "@/context/DispatchContext";

// Component Imports
import Header from "@/components/Header";
import DispatchConsole from "@/components/DispatchConsole";
import ManifestModal from "@/components/ManifestModal";
import FleetModal from "@/components/FleetModal";
import PrintManifest from "@/components/PrintManifest";

const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 opacity-20">
        <RefreshCw className="animate-spin text-zinc-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Initializing Tactical Data</span>
      </div>
    </div>
  ) 
});

export default function RoutePlanner() {
  const { 
    city, setCity,
    vehicles, setVehicles,
    isGeocoding, geocodingProgress,
    commitManifest, addVehicle: contextAddVehicle, removeVehicle: contextRemoveVehicle
  } = useDispatch();

  const [pendingRows, setPendingRows] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState("");

  // Global Paste Listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!isModalOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const text = e.clipboardData?.getData('text');
      if (text) handleDataInput(text);
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [isModalOpen]);

  const handleDataInput = (text: string) => {
    if (!text.trim()) return;
    const lines = text.split("\n");
    const newRows: Ticket[] = [];
    lines.forEach((line) => {
      if (!line.trim()) return;
      const columns = line.split("\t");
      if (columns.length < 4) return;
      const [id, name, area, pincode, type, coords] = columns;
      if (id.toLowerCase().includes("ticket")) return;
      newRows.push({
        id: id.trim(),
        name: name?.trim() || "",
        area: area?.trim() || "",
        pincode: pincode?.trim() || "",
        type: type?.trim() || "",
        coords: coords?.trim() || ""
      });
    });
    setPendingRows(prev => [...prev, ...newRows]);
  };

  const handleUpdateRow = (idx: number, field: string, value: string) => {
    setPendingRows(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleDeleteRow = (idx: number) => {
    setPendingRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCommit = async (action: 'append' | 'replace') => {
    await commitManifest(pendingRows, action);
    setIsModalOpen(false);
    setPendingRows([]);
  };

  const addVehicle = async () => {
    const name = newVehicleName.trim();
    if (!name) return;
    await contextAddVehicle(name);
    setNewVehicleName("");
  };

  const removeVehicle = async (name: string) => {
    await contextRemoveVehicle(name);
  };

  return (
    <>
      <PrintManifest />
      <div className="relative h-screen w-full overflow-hidden font-sans transition-all duration-300 bg-[#f5f5f7] text-black print:hidden">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <MapComponent />
      </div>

      <Header 
        city={city}
        onCityChange={setCity}
        onFleetOpen={() => setIsFleetModalOpen(true)}
        vehicleCount={vehicles.length}
      />

      <DispatchConsole 
        onLoadData={() => setIsModalOpen(true)}
      />

      <ManifestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pendingRows={pendingRows}
        onClearRows={() => setPendingRows([])}
        onDeleteRow={handleDeleteRow}
        onUpdateRow={handleUpdateRow}
        onCommitData={handleCommit}
        isProcessing={isGeocoding}
        processingProgress={geocodingProgress}
      />

      <FleetModal 
        isOpen={isFleetModalOpen}
        onClose={() => setIsFleetModalOpen(false)}
        vehicles={vehicles}
        newVehicleName={newVehicleName}
        setNewVehicleName={setNewVehicleName}
        onAddVehicle={addVehicle}
        onRemoveVehicle={removeVehicle}
      />

      </div>
    </>
  );
}
