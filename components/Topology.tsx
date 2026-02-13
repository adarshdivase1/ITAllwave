import React from 'react';
import { AVDevice } from '../types';

interface TopologyProps {
  devices: AVDevice[];
}

export const Topology: React.FC<TopologyProps> = ({ devices }) => {
  // Simple tree visualization using standard HTML/CSS for robustness
  // Group devices by location (simulating switch stacks)
  const locations = Array.from(new Set(devices.map(d => d.location)));

  return (
    <div className="h-full bg-slate-900 overflow-hidden relative flex flex-col">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="p-6 z-10">
        <h2 className="text-xl font-bold text-white mb-8">Logical Network Topology</h2>
        
        <div className="flex flex-col items-center gap-12 overflow-auto custom-scrollbar pb-20">
            {/* Core Switch */}
            <div className="flex flex-col items-center relative">
                <div className="w-24 h-24 bg-blue-600 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center border-2 border-blue-400 z-10 relative">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <div className="absolute -top-3 px-3 py-1 bg-slate-800 border border-blue-500 rounded text-xs font-mono text-blue-300">CORE-SW-01</div>
                </div>
                {/* Connection Line Down */}
                <div className="h-12 w-0.5 bg-blue-500/50"></div>
            </div>

            {/* Distribution Layer (Locations) */}
            <div className="flex flex-wrap justify-center gap-16 relative">
                 {/* Horizontal connector line */}
                 <div className="absolute top-0 left-10 right-10 h-0.5 bg-blue-500/30 -translate-y-[1px]"></div>

                 {locations.map((loc, i) => {
                     const locDevices = devices.filter(d => d.location === loc);
                     return (
                         <div key={loc} className="flex flex-col items-center relative pt-8">
                             {/* Vertical line from bus */}
                             <div className="absolute top-0 h-8 w-0.5 bg-blue-500/30"></div>
                             
                             {/* Location Switch Node */}
                             <div className="w-16 h-12 bg-slate-800 border border-slate-600 rounded flex items-center justify-center mb-6 relative group cursor-pointer hover:border-blue-400 transition-colors">
                                 <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                 <div className="absolute -bottom-6 text-xs text-slate-500 whitespace-nowrap font-mono">{loc}</div>
                             </div>

                             {/* Devices in Location */}
                             <div className="flex flex-col gap-3 mt-4 relative pl-4 border-l border-slate-700/50">
                                 {locDevices.map(d => (
                                     <div key={d.id} className="flex items-center gap-2 group relative">
                                         {/* Branch line */}
                                         <div className="absolute -left-4 w-4 h-px bg-slate-700"></div>
                                         
                                         <div className={`w-3 h-3 rounded-full ${
                                             d.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                             d.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                                         }`}></div>
                                         <span className="text-xs text-slate-400 group-hover:text-white transition-colors cursor-pointer">{d.name}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     );
                 })}
            </div>
        </div>
      </div>
    </div>
  );
};