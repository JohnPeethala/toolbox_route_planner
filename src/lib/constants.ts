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
  { icon: Van,          hex: "#3b82f6", textColor: "text-blue-500",    borderColor: "border-l-blue-500",    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { icon: Car,          hex: "#10b981", textColor: "text-emerald-500", borderColor: "border-l-emerald-500", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { icon: Bike,         hex: "#f59e0b", textColor: "text-amber-500",   borderColor: "border-l-amber-500",   badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { icon: Bus,          hex: "#6366f1", textColor: "text-indigo-500",  borderColor: "border-l-indigo-500",  badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { icon: Tractor,      hex: "#f43f5e", textColor: "text-rose-500",    borderColor: "border-l-rose-500",    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { icon: Forklift,     hex: "#f97316", textColor: "text-orange-500",  borderColor: "border-l-orange-500",  badge: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { icon: CarTaxiFront, hex: "#06b6d4", textColor: "text-cyan-500",    borderColor: "border-l-cyan-500",    badge: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { icon: Ambulance,    hex: "#ec4899", textColor: "text-pink-500",    borderColor: "border-l-pink-500",    badge: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
];

export function getTicketConfig(type: string) {
  const normalized = type.toLowerCase().trim();
  return TICKET_TYPE_CONFIG[normalized] || { color: "text-zinc-500", hex: "#71717a", label: type || "General", short: "G", icon: HelpCircle };
}

export function getVehicleColor(name: string, vehicles: string[]) {
  const idx = vehicles.indexOf(name);
  return idx >= 0 ? VEHICLE_PALETTE[idx % VEHICLE_PALETTE.length] : null;
}
