export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  MAINTENANCE = 'MAINTENANCE',
}

export enum DeviceType {
  CONTROLLER = 'Control Processor',
  DISPLAY = 'Display/Projector',
  MATRIX = 'Video Matrix',
  DSP = 'Audio DSP',
  CODEC = 'VC Codec',
  TOUCHPANEL = 'Touch Panel',
  NETWORK_SWITCH = 'Network Switch',
  LIGHTING = 'Lighting Gateway',
  SHADE = 'Shade Controller',
  OTHER = 'Generic IoT'
}

export interface NetworkInterface {
  ip: string;
  mac: string;
  subnet: string;
  gateway: string;
  vlan: number;
}

export interface TelemetryPoint {
  timestamp: string;
  value: number;
}

export interface DeviceLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  code?: string;
}

export interface OIDEntry {
  oid: string;
  name: string;
  value: string | number;
  type: 'STRING' | 'INTEGER' | 'TIMETICKS' | 'IPADDRESS';
}

export interface AVDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  firmware: string;
  serial: string;
  location: string;
  status: DeviceStatus;
  uptimeSeconds: number;
  temperature: number; // Celsius
  cpuLoad: number; // Percentage
  memoryUsage: number; // Percentage
  network: NetworkInterface;
  bandwidthIn: number; // Mbps
  bandwidthOut: number; // Mbps
  logs: DeviceLog[];
  snmpData: OIDEntry[]; // New field for detailed SNMP data
  powerState: 'ON' | 'OFF' | 'STANDBY';
}

export interface AIAnalysisResult {
  diagnosis: string;
  confidence: number;
  steps: string[];
  recommendedAction: string;
}