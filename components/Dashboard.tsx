import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Server, Wifi } from 'lucide-react';
import { AVDevice, DeviceStatus } from '../types';
import { generateHistory } from '../constants';

interface DashboardProps {
  devices: AVDevice[];
}

const DashboardCard: React.FC<{ title: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }> = ({ title, value, sub, icon, color }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-start justify-between shadow-lg">
    <div>
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
    </div>
    <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} ${color}`}>
      {icon}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ devices }) => {
  const onlineCount = devices.filter(d => d.status === DeviceStatus.ONLINE).length;
  const warningCount = devices.filter(d => d.status === DeviceStatus.WARNING).length;
  const criticalCount = devices.filter(d => d.status === DeviceStatus.OFFLINE || d.status === DeviceStatus.CRITICAL).length;
  
  // Mock aggregated bandwidth data
  const data = generateHistory(20, 500, 200);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Devices" 
          value={devices.length} 
          sub="Discovered"
          icon={<Server size={24} />} 
          color="text-blue-500" 
        />
        <DashboardCard 
          title="Online" 
          value={onlineCount} 
          sub={`${Math.round((onlineCount/devices.length)*100)}% Uptime`}
          icon={<CheckCircle size={24} />} 
          color="text-green-500" 
        />
        <DashboardCard 
          title="Warnings" 
          value={warningCount} 
          sub="Requires Attention"
          icon={<AlertTriangle size={24} />} 
          color="text-amber-500" 
        />
        <DashboardCard 
          title="Critical" 
          value={criticalCount} 
          sub="Action Required"
          icon={<Activity size={24} />} 
          color="text-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wifi size={20} className="text-blue-400" />
              Network Traffic (Aggregate)
            </h3>
            <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded">Live Interface: VLAN 10</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit=" Mbps" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {devices.filter(d => d.logs.some(l => l.level !== 'INFO')).slice(0, 5).map(device => {
              const log = device.logs.find(l => l.level !== 'INFO');
              return (
                <div key={device.id} className="p-3 bg-slate-900/50 rounded border-l-2 border-red-500">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-slate-200">{device.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log?.timestamp.split('T')[1].substring(0,5)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{log?.message}</p>
                </div>
              );
            })}
            {devices.filter(d => d.logs.some(l => l.level !== 'INFO')).length === 0 && (
                <div className="text-slate-500 text-sm text-center py-10">No active alerts</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};