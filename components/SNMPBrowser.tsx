import React from 'react';
import { AVDevice } from '../types';
import { Database, Search } from 'lucide-react';

interface SNMPBrowserProps {
  device: AVDevice;
}

export const SNMPBrowser: React.FC<SNMPBrowserProps> = ({ device }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database size={18} className="text-blue-500" />
            SNMP MIB Browser
        </h3>
        <div className="relative w-64">
             <Search className="absolute left-2 top-2 text-slate-500" size={14} />
             <input 
                type="text" 
                placeholder="Filter OID or Name..." 
                className="w-full bg-slate-900 border border-slate-700 rounded text-xs py-1.5 pl-8 text-white focus:border-blue-500 outline-none"
             />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-xs text-slate-500 uppercase sticky top-0">
                  <tr>
                      <th className="px-6 py-3 border-b border-slate-700">OID</th>
                      <th className="px-6 py-3 border-b border-slate-700">Name</th>
                      <th className="px-6 py-3 border-b border-slate-700">Type</th>
                      <th className="px-6 py-3 border-b border-slate-700">Value</th>
                  </tr>
              </thead>
              <tbody className="text-sm font-mono text-slate-300">
                  {device.snmpData && device.snmpData.length > 0 ? (
                      device.snmpData.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/50 border-b border-slate-700/50">
                              <td className="px-6 py-3 text-slate-400">{entry.oid}</td>
                              <td className="px-6 py-3 text-blue-300">{entry.name}</td>
                              <td className="px-6 py-3 text-xs text-slate-500">{entry.type}</td>
                              <td className="px-6 py-3 text-emerald-400">{entry.value}</td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                              No SNMP data available. Check device connection.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
      <div className="p-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-500 text-right">
        Last Poll: {new Date().toLocaleTimeString()} | Protocol: SNMP v2c
      </div>
    </div>
  );
};