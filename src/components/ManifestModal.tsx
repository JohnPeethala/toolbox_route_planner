"use client";

import { X, Trash2, PlusSquare, Navigation, RefreshCw } from "lucide-react";
import { getTicketConfig } from "@/lib/constants";

interface ManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingRows: any[];
  onClearRows: () => void;
  onDeleteRow: (idx: number) => void;
  onUpdateRow: (idx: number, field: string, value: string) => void;
  onCommitData: (action: 'append' | 'replace') => void;
  isProcessing?: boolean;
  processingProgress?: { current: number, total: number };
}

export default function ManifestModal({
  isOpen,
  onClose,
  pendingRows,
  onClearRows,
  onDeleteRow,
  onUpdateRow,
  onCommitData,
  isProcessing = false,
  processingProgress = { current: 0, total: 0 }
}: ManifestModalProps) {
  if (!isOpen) return null;

  const progressPercentage = processingProgress.total > 0 
    ? Math.round((processingProgress.current / processingProgress.total) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[88vh] rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-baseline gap-3">
            <h2 className="text-[13px] font-black uppercase tracking-widest text-gray-900">Data Entry</h2>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{pendingRows.length} Rows</span>
          </div>
          <div className="flex items-center gap-2">
            {!isProcessing && pendingRows.length > 0 && (
              <button onClick={onClearRows} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-lg hover:bg-red-50 text-red-500 transition-colors uppercase tracking-widest">
                <Trash2 size={12} /> Clear
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Table Area (Maximized) */}
        <div className="flex-1 overflow-hidden relative bg-white">
          <div className="h-full overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200 shadow-sm">
                <tr>
                  <th className="px-5 py-3.5 w-10 text-[10px] font-black text-gray-300 uppercase tracking-widest">#</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Area</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode</th>
                  <th className="px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-2 py-3.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-20 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <PlusSquare size={24} className="text-gray-200" strokeWidth={1.5} />
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Awaiting Data</span>
                          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Paste raw excel rows here (Ctrl+V)</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  pendingRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 focus-within:bg-blue-50/40 transition-colors group">
                      <td className="px-5 py-1 text-[11px] font-black text-gray-300 select-none w-10 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          value={row.id} 
                          onChange={(e) => onUpdateRow(idx, 'id', e.target.value)}
                          disabled={isProcessing}
                          className="w-full bg-transparent border-none outline-none text-[12px] font-mono font-bold text-gray-900 focus:ring-1 focus:ring-blue-400 rounded px-3 py-2"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          value={row.name} 
                          onChange={(e) => onUpdateRow(idx, 'name', e.target.value)}
                          disabled={isProcessing}
                          className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 focus:ring-1 focus:ring-blue-400 rounded px-3 py-2"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          value={row.area} 
                          onChange={(e) => onUpdateRow(idx, 'area', e.target.value)}
                          disabled={isProcessing}
                          className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 focus:ring-1 focus:ring-blue-400 rounded px-3 py-2"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          value={row.pincode} 
                          onChange={(e) => onUpdateRow(idx, 'pincode', e.target.value)}
                          disabled={isProcessing}
                          className="w-full bg-transparent border-none outline-none text-[12px] font-black text-blue-600 focus:ring-1 focus:ring-blue-400 rounded px-3 py-2"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input 
                          value={row.type} 
                          onChange={(e) => onUpdateRow(idx, 'type', e.target.value)}
                          disabled={isProcessing}
                          className={`w-full bg-transparent border-none outline-none text-[11px] font-black ${getTicketConfig(row.type).color} focus:ring-1 focus:ring-blue-400 rounded px-3 py-2 uppercase tracking-tight`}
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => onDeleteRow(idx)}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Compact Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-white/80 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-blue-500" size={20} />
              <div className="w-48">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">
                  <span>Syncing...</span>
                  <span>{processingProgress.current} / {processingProgress.total}</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => onCommitData('append')} 
            disabled={pendingRows.length === 0 || isProcessing} 
            className="py-2.5 px-6 rounded-xl font-black text-[11px] flex items-center gap-2 uppercase tracking-widest disabled:opacity-40 bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            {isProcessing ? <RefreshCw className="animate-spin" size={12} /> : <Navigation size={12} />}
            Append
          </button>
          <button 
            onClick={() => onCommitData('replace')} 
            disabled={pendingRows.length === 0 || isProcessing} 
            className="py-2.5 px-6 rounded-xl font-black text-[11px] flex items-center gap-2 uppercase tracking-widest disabled:opacity-40 bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            {isProcessing ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
            Clear & Add
          </button>
        </div>
      </div>
    </div>
  );
}
