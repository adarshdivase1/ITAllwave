import { AVDevice, DeviceStatus, DeviceType } from './types';

export const MOCK_LOCATIONS = ['Conf Room A', 'Conf Room B', 'Huddle Space 1', 'Auditorium', 'NOC', 'Exec Boardroom'];
export const MANUFACTURERS = ['Crestron', 'Extron', 'Q-SYS', 'Cisco', 'Samsung', 'LG', 'Biamp'];

// Helper to generate random time series data
export const generateHistory = (points: number, base: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1 min intervals
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, base + (Math.random() * variance * 2 - variance)),
    });
  }
  return data;
};

const generateDevice = (id: number): AVDevice => {
  const type = Object.values(DeviceType)[Math.floor(Math.random() * Object.values(DeviceType).length)];
  const manufacturer = MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)];
  const isOffline = Math.random() < 0.1;
  const isWarning = !isOffline && Math.random() < 0.2;
  
  let status = DeviceStatus.ONLINE;
  if (isOffline) status = DeviceStatus.OFFLINE;
  else if (isWarning) status = DeviceStatus.WARNING;

  return {
    id: `DEV-${1000 + id}`,
    name: `${type} - ${MOCK_LOCATIONS[id % MOCK_LOCATIONS.length]}`,
    type,
    manufacturer,
    model: `${manufacturer.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000)}`,
    firmware: `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`,
    serial: `SN${Math.random().toString(36).substring(7).toUpperCase()}`,
    location: MOCK_LOCATIONS[id % MOCK_LOCATIONS.length],
    status,
    uptimeSeconds: Math.floor(Math.random() * 1000000),
    temperature: 35 + Math.random() * 20,
    cpuLoad: 10 + Math.random() * 80,
    memoryUsage: 20 + Math.random() * 60,
    network: {
      ip: `192.168.10.${100 + id}`,
      mac: `00:1B:${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 99)}:AB:${id < 10 ? '0' + id : id}`,
      subnet: '255.255.255.0',
      gateway: '192.168.10.1',
      vlan: 10,
    },
    bandwidthIn: Math.random() * 100,
    bandwidthOut: Math.random() * 50,
    powerState: isOffline ? 'OFF' : (Math.random() > 0.8 ? 'STANDBY' : 'ON'),
    snmpData: [],
    logs: [
        {
            id: `LOG-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: 'System startup successful'
        },
        ...(isWarning ? [{
            id: `LOG-${Date.now()}-2`,
            timestamp: new Date().toISOString(),
            level: 'WARN' as const,
            message: 'High CPU utilization detected over 5 minutes',
            code: 'CPU_HIGH_LOAD'
        }] : []),
         ...(isOffline ? [{
            id: `LOG-${Date.now()}-3`,
            timestamp: new Date().toISOString(),
            level: 'ERROR' as const,
            message: 'Heartbeat lost. Connection timed out.',
            code: 'NET_TIMEOUT'
        }] : [])
    ]
  };
};

export const MOCK_DEVICES: AVDevice[] = Array.from({ length: 25 }, (_, i) => generateDevice(i));