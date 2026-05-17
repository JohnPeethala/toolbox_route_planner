"use client";

import { 
  Van, 
  Car, 
  Bike, 
  Bus, 
  Tractor, 
  Forklift, 
  CarTaxiFront, 
  Ambulance, 
  Truck,
  Box,
  Package,
  ArrowRightLeft,
  PackageMinus,
  ArrowUpCircle,
  RefreshCcw,
  Wrench,
  AlertTriangle,
  PenTool,
  HelpCircle
} from "lucide-react";

export const TICKET_TYPE_CONFIG: Record<string, { color: string, hex: string, label: string, short: string, icon: any }> = {
  "delivery": { color: "text-emerald-500", hex: "#10b981", label: "Delivery", short: "D", icon: Box },
  "pickup": { color: "text-orange-500", hex: "#f97316", label: "Pickup", short: "P", icon: Package },
  "relocation": { color: "text-slate-400", hex: "#94a3b8", label: "Relocation", short: "R", icon: ArrowRightLeft },
  "partial pickup": { color: "text-amber-500", hex: "#f59e0b", label: "Partial Pickup", short: "PP", icon: PackageMinus },
  "upgrade": { color: "text-slate-400", hex: "#94a3b8", label: "Upgrade", short: "U", icon: ArrowUpCircle },
  "replacement": { color: "text-slate-400", hex: "#94a3b8", label: "Replacement", short: "RP", icon: RefreshCcw },
  "repair": { color: "text-red-500", hex: "#ef4444", label: "Repair", short: "RX", icon: Wrench },
  "defaulter pickup": { color: "text-red-600", hex: "#dc2626", label: "Defaulter Pickup", short: "DP", icon: AlertTriangle },
  "installation": { color: "text-slate-400", hex: "#94a3b8", label: "Installation", short: "I", icon: PenTool },
};

export const VEHICLE_PALETTE = [
  { icon: Van,          hex: "#ef4444", textColor: "text-red-500",    borderColor: "border-l-red-500",    badge: "bg-red-500/10 text-red-500 border-red-500/20" },
  { icon: Car,          hex: "#3b82f6", textColor: "text-blue-500",   borderColor: "border-l-blue-500",   badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { icon: Bike,         hex: "#22c55e", textColor: "text-green-500",  borderColor: "border-l-green-500",  badge: "bg-green-500/10 text-green-500 border-green-500/20" },
  { icon: Bus,          hex: "#eab308", textColor: "text-yellow-500", borderColor: "border-l-yellow-500", badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { icon: Tractor,      hex: "#a855f7", textColor: "text-purple-500", borderColor: "border-l-purple-500", badge: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { icon: Forklift,     hex: "#f97316", textColor: "text-orange-500", borderColor: "border-l-orange-500", badge: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { icon: CarTaxiFront, hex: "#14b8a6", textColor: "text-teal-500",   borderColor: "border-l-teal-500",   badge: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  { icon: Ambulance,    hex: "#ec4899", textColor: "text-pink-500",   borderColor: "border-l-pink-500",   badge: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
];

export function getTicketConfig(type: string) {
  const normalized = type.toLowerCase().trim();
  return TICKET_TYPE_CONFIG[normalized] || { color: "text-zinc-500", hex: "#71717a", label: type || "General", short: "G", icon: HelpCircle };
}

export function getVehicleColor(name: string, vehicles: string[]) {
  const idx = vehicles.indexOf(name);
  return idx >= 0 ? VEHICLE_PALETTE[idx % VEHICLE_PALETTE.length] : null;
}
