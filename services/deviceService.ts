import { AVDevice, DeviceStatus, DeviceType, OIDEntry } from '../types';
import { MOCK_DEVICES } from '../constants';

const STORAGE_KEY = 'NEXUS_AV_DEVICES';

// Helper to generate realistic SNMP data based on device type
const generateSNMPData = (device: Partial<AVDevice>): OIDEntry[] => {
  const baseOids: OIDEntry[] = [
    { oid: '1.3.6.1.2.1.1.1.0', name: 'sysDescr', value: `${device.manufacturer} ${device.model} System OS`, type: 'STRING' },
    { oid: '1.3.6.1.2.1.1.3.0', name: 'sysUpTime', value: Math.floor(Math.random() * 9000000), type: 'TIMETICKS' },
    { oid: '1.3.6.1.2.1.1.5.0', name: 'sysName', value: device.name || 'Unknown', type: 'STRING' },
    { oid: '1.3.6.1.2.1.2.2.1.6.1', name: 'ifPhysAddress', value: device.network?.mac || '00:00:00:00:00:00', type: 'STRING' },
  ];

  if (device.type === DeviceType.DISPLAY) {
    baseOids.push(
      { oid: '1.3.6.1.4.1.2021.10.1.3.1', name: 'lampHours', value: Math.floor(Math.random() * 5000), type: 'INTEGER' },
      { oid: '1.3.6.1.4.1.2021.10.1.3.2', name: 'inputSource', value: 'HDMI-1', type: 'STRING' }
    );
  } else if (device.type === DeviceType.DSP) {
    baseOids.push(
      { oid: '1.3.6.1.4.1.9.9.48.1.1.1.5.1', name: 'audioClipCount', value: 0, type: 'INTEGER' },
      { oid: '1.3.6.1.4.1.9.9.48.1.1.1.6.1', name: 'dspLoad', value: Math.floor(Math.random() * 30), type: 'INTEGER' }
    );
  }

  return baseOids;
};

export const DeviceService = {
  getDevices: (): AVDevice[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Enhance mock devices with SNMP data on first load
      const enhancedMock = MOCK_DEVICES.map(d => ({
        ...d,
        snmpData: generateSNMPData(d)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedMock));
      return enhancedMock;
    }
    return JSON.parse(stored);
  },

  addDevice: (device: AVDevice): AVDevice[] => {
    const devices = DeviceService.getDevices();
    const deviceWithSnmp = { ...device, snmpData: generateSNMPData(device) };
    const newDevices = [deviceWithSnmp, ...devices];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDevices));
    return newDevices;
  },

  updateDevice: (updatedDevice: AVDevice): AVDevice[] => {
    const devices = DeviceService.getDevices();
    const newDevices = devices.map(d => d.id === updatedDevice.id ? updatedDevice : d);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDevices));
    return newDevices;
  },

  deleteDevice: (deviceId: string): AVDevice[] => {
    const devices = DeviceService.getDevices();
    const newDevices = devices.filter(d => d.id !== deviceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDevices));
    return newDevices;
  },

  resetToDemo: (): AVDevice[] => {
     const enhancedMock = MOCK_DEVICES.map(d => ({
        ...d,
        snmpData: generateSNMPData(d)
      }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedMock));
    return enhancedMock;
  },

  clearAll: (): AVDevice[] => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  },

  simulateRealTimeUpdates: (currentDevices: AVDevice[]): AVDevice[] => {
    return currentDevices.map(device => {
      if (device.status === DeviceStatus.OFFLINE) return device;

      const cpuChange = (Math.random() - 0.5) * 5;
      const tempChange = (Math.random() - 0.5) * 0.5;
      const bwInChange = (Math.random() - 0.5) * 10;
      
      let newStatus = device.status;
      if (Math.random() > 0.9995) newStatus = DeviceStatus.WARNING;

      return {
        ...device,
        cpuLoad: Math.min(100, Math.max(0, device.cpuLoad + cpuChange)),
        temperature: Math.max(20, device.temperature + tempChange),
        bandwidthIn: Math.max(0, device.bandwidthIn + bwInChange),
        status: newStatus,
        uptimeSeconds: device.uptimeSeconds + 5
      };
    });
  },

  // Simulate Terminal Command Response
  processTerminalCommand: async (device: AVDevice, command: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600)); // Simulate network latency

    const cmd = command.trim().toLowerCase();
    
    if (cmd === 'help' || cmd === '?') {
      if (device.manufacturer.toLowerCase().includes('crestron')) {
        return "Available commands: HELP, PROGCOMMENTS, REBOOT, RESTORE, STATUS, UPTIME, VER, WHO";
      } else if (device.manufacturer.toLowerCase().includes('q-sys')) {
        return "Commands: sg (Get Status), ss (Set Status), gip (Get IP), reboot (Reboot System)";
      }
      return "Available commands: help, status, uptime, reboot, network";
    }

    if (cmd === 'reboot') return "System is rebooting... Connection will be lost.";
    if (cmd === 'uptime') return `System Up: ${(device.uptimeSeconds / 3600).toFixed(1)} hours`;
    if (cmd === 'status' || cmd === 'sg') {
        return `
System Status: ${device.status}
CPU Load: ${device.cpuLoad.toFixed(1)}%
Temperature: ${device.temperature.toFixed(1)}C
Memory Free: ${100 - device.memoryUsage}%
        `;
    }
    if (cmd === 'ver') return `Firmware Version: ${device.firmware} \nBuild Date: 2024-10-15`;

    return `Error: Command '${command}' not recognized.`;
  }
};