import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Power, RefreshCw } from 'lucide-react';
import { AVDevice, DeviceStatus } from '../types';

interface DeviceListProps {
  devices: AVDevice[];
  onSelectDevice: (device: AVDevice) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onSelectDevice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.network.ip.includes(searchTerm) || 
                            d.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || d.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [devices, searchTerm, filterType]);

  const getStatusColor = (status: DeviceStatus) => {
    switch(status) {
      case DeviceStatus.ONLINE: return 'bg-emerald-500';
      case DeviceStatus.WARNING: return 'bg-amber-500';
      case DeviceStatus.OFFLINE: 
      case DeviceStatus.CRITICAL: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/50 backdrop-blur">
        <h2 className="text-xl font-bold text-white">Device Inventory</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, IP, model..." 
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
        <div className="col-span-4 lg:col-span-3">Device Name</div>
        <div className="col-span-2 hidden lg:block">IP Address</div>
        <div className="col-span-3 lg:col-span-2">Type / Model</div>
        <div className="col-span-2 hidden sm:block">Location</div>
        <div className="col-span-2 lg:col-span-1 text-center">Status</div>
        <div className="col-span-1 lg:col-span-2 text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {filteredDevices.length > 0 ? (
          filteredDevices.map(device => (
            <div 
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors items-center group"
            >
              <div className="col-span-4 lg:col-span-3">
                <div className="font-medium text-slate-200">{device.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{device.serial}</div>
              </div>
              
              <div className="col-span-2 hidden lg:block text-slate-400 font-mono text-sm">
                {device.network.ip}
              </div>
              
              <div className="col-span-3 lg:col-span-2">
                <div className="text-slate-300 text-sm">{device.type}</div>
                <div className="text-xs text-slate-500">{device.manufacturer}</div>
              </div>

              <div className="col-span-2 hidden sm:block text-slate-400 text-sm">
                {device.location}
              </div>

              <div className="col-span-2 lg:col-span-1 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${
                  device.status === DeviceStatus.ONLINE ? 'bg-emerald-900 text-emerald-300 border-emerald-800' :
                  device.status === DeviceStatus.WARNING ? 'bg-amber-900 text-amber-300 border-amber-800' :
                  'bg-red-900 text-red-300 border-red-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusColor(device.status)} animate-pulse`}></span>
                  {device.status}
                </span>
              </div>

              <div className="col-span-1 lg:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                  title="Quick Reboot"
                  onClick={(e) => { e.stopPropagation(); alert(`Rebooting ${device.name}...`); }}
                 >
                   <RefreshCw size={16} />
                 </button>
                 <button 
                  className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white"
                  title="Power Toggle"
                  onClick={(e) => { e.stopPropagation(); alert(`Toggling Power for ${device.name}...`); }}
                 >
                   <Power size={16} />
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No devices found matching your criteria</p>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-slate-900 text-xs text-slate-500 border-t border-slate-700 flex justify-between">
        <span>Showing {filteredDevices.length} of {devices.length} devices</span>
        <span>SNMP v3 Polling Active (Interval: 30s)</span>
      </div>
    </div>
  );
};