"use client";

import { useDispatch } from "@/context/DispatchContext";

// Simple Haversine distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

export default function PrintManifest() {
  const { vehicles, groups, groupVehicles, ticketVehicles } = useDispatch();
  const warehouseCoords = { lat: 17.548377214877075, lng: 78.34705192140262 };

  if (vehicles.length === 0) return null;

  return (
    <div className="hidden print:block w-full text-black bg-white p-4">
      <div className="grid grid-cols-2 gap-6 items-start">
        {vehicles.map(vehicle => {
          // Find groups for this vehicle
          const vehicleGroups = groups.filter(g => groupVehicles[g.id] === vehicle);
          
          // Tickets that might have been individually assigned
          const extraTickets = groups.flatMap(g => 
            g.tickets.filter(t => ticketVehicles[`${g.id}::${t.id}`] === vehicle && groupVehicles[g.id] !== vehicle).map(t => ({...t, coords: g.coords}))
          );

          // Flatten to a list of tickets with coords
          const allVehicleTickets = [
            ...vehicleGroups.flatMap(g => g.tickets.map(t => ({...t, coords: g.coords}))),
            ...extraTickets
          ];

          if (allVehicleTickets.length === 0) return null;

          // Sort tickets by distance from warehouse (Rough route order)
          allVehicleTickets.sort((a, b) => {
            const aCoords = a.coords ? a.coords.split(',').map(n => parseFloat(n.trim())) : [0, 0];
            const bCoords = b.coords ? b.coords.split(',').map(n => parseFloat(n.trim())) : [0, 0];
            const distA = getDistance(warehouseCoords.lat, warehouseCoords.lng, aCoords[0], aCoords[1]);
            const distB = getDistance(warehouseCoords.lat, warehouseCoords.lng, bCoords[0], bCoords[1]);
            return distA - distB;
          });

          return (
            <div key={vehicle} className="break-inside-avoid border border-black p-3">
              <div className="flex justify-between items-end border-b border-black pb-1 mb-2">
                <h3 className="text-base font-bold uppercase">{vehicle}</h3>
                <span className="text-[10px] font-bold border border-black px-1.5 py-0.5">TOTAL TICKETS: {allVehicleTickets.length}</span>
              </div>
              
              <table className="w-full text-left text-[10px] border-collapse table-fixed">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-1 px-1 font-bold uppercase w-6">#</th>
                    <th className="py-1 px-1 font-bold uppercase w-16">ID</th>
                    <th className="py-1 px-1 font-bold uppercase">Customer</th>
                    <th className="py-1 px-1 font-bold uppercase">Area / Loc</th>
                    <th className="py-1 px-1 font-bold uppercase w-12">Pin</th>
                    <th className="py-1 px-1 font-bold uppercase text-right w-16">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {allVehicleTickets.map((ticket, index) => (
                    <tr key={ticket.id} className="border-b border-gray-300 last:border-0 leading-tight">
                      <td className="py-1 px-1 font-bold text-gray-500">{index + 1}</td>
                      <td className="py-1 px-1 font-mono text-[9px] truncate">{ticket.id.replace('TKT-', '')}</td>
                      <td className="py-1 px-1 font-bold truncate">{ticket.name}</td>
                      <td className="py-1 px-1 truncate">{ticket.area}</td>
                      <td className="py-1 px-1">{ticket.pincode}</td>
                      <td className="py-1 px-1 text-right uppercase font-bold text-[9px] truncate">{ticket.type || 'GENERAL'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
