import React, { useState } from 'react';
import { X, Save, Server } from 'lucide-react';
import { AVDevice, DeviceStatus, DeviceType } from '../types';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: AVDevice) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    type: DeviceType.CONTROLLER,
    manufacturer: '',
    model: '',
    location: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new device object with defaults + form data
    const newDevice: AVDevice = {
      id: `MANUAL-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      manufacturer: formData.manufacturer,
      model: formData.model,
      location: formData.location,
      status: DeviceStatus.ONLINE, // Assume online when added
      network: {
        ip: formData.ip,
        mac: '00:00:00:00:00:00', // Placeholder
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        vlan: 1
      },
      firmware: '1.0.0',
      serial: 'MANUAL_ENTRY',
      uptimeSeconds: 0,
      temperature: 40,
      cpuLoad: 10,
      memoryUsage: 25,
      bandwidthIn: 0,
      bandwidthOut: 0,
      powerState: 'ON',
      snmpData: [],
      logs: [{
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Device manually added to inventory.'
      }]
    };

    onAdd(newDevice);
    onClose();
    setFormData({ name: '', ip: '', type: DeviceType.CONTROLLER, manufacturer: '', model: '', location: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="text-blue-500" />
            Add New Device
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Device Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Core-Processor-01"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">IP Address</label>
              <input 
                required
                type="text" 
                placeholder="192.168.x.x"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none font-mono"
                value={formData.ip}
                onChange={e => setFormData({...formData, ip: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Device Type</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as DeviceType})}
              >
                {Object.values(DeviceType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Location</label>
              <input 
                type="text" 
                placeholder="e.g. Rack Room 1"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Manufacturer</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Crestron"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                value={formData.manufacturer}
                onChange={e => setFormData({...formData, manufacturer: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Model</label>
              <input 
                required
                type="text" 
                placeholder="e.g. CP4"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
               Cancel
             </button>
             <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center justify-center gap-2">
               <Save size={18} />
               Add Device
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};