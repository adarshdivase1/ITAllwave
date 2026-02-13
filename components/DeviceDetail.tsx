import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Cpu, Thermometer, Wifi, Activity, Terminal as TerminalIcon, 
  RotateCcw, ShieldCheck, Send, Bot, Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AVDevice, DeviceStatus } from '../types';
import { generateHistory } from '../constants';
import { analyzeDeviceIssue } from '../services/geminiService';
import { Terminal } from './Terminal';
import { SNMPBrowser } from './SNMPBrowser';

interface DeviceDetailProps {
  device: AVDevice;
  onBack: () => void;
}

export const DeviceDetail: React.FC<DeviceDetailProps> = ({ device, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'logs' | 'ai' | 'snmp'>('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  useEffect(() => {
    if (activeTab === 'ai' && chatHistory.length === 0 && device.status !== DeviceStatus.ONLINE) {
      handleAiSubmit("What's wrong with this device?");
    }
  }, [activeTab]);

  const handleAiSubmit = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessage = { role: 'user' as const, text };
    setChatHistory(prev => [...prev, newMessage]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await analyzeDeviceIssue(device, text);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Connection error. Unable to reach AI diagnostics service." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const MetricCard = ({ label, value, unit, icon: Icon, color }: any) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-xs uppercase font-semibold">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <div className="text-2xl font-bold text-white">
        {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in relative">
      {showTerminal && <Terminal device={device} onClose={() => setShowTerminal(false)} />}
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {device.name}
            <span className={`text-xs px-2 py-1 rounded-full border ${
              device.status === DeviceStatus.ONLINE ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-red-500/10 border-red-500/50 text-red-500'
            }`}>
              {device.status}
            </span>
          </h1>
          <p className="text-slate-400 text-sm font-mono mt-1">{device.manufacturer} {device.model} • IP: {device.network.ip}</p>
        </div>
        <div className="ml-auto flex gap-2">
           <button 
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-200 transition-colors"
             onClick={() => alert('Sending SNMP Reboot Command...')}
           >
             <RotateCcw size={16} />
             Reboot
           </button>
           <button 
             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white shadow-lg transition-colors"
             onClick={() => setShowTerminal(true)}
           >
             <TerminalIcon size={16} />
             Terminal
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'network', label: 'Network', icon: Wifi },
          { id: 'snmp', label: 'SNMP Browser', icon: Database },
          { id: 'ai', label: 'AI Diagnostics', icon: Bot },
          { id: 'logs', label: 'Event Logs', icon: TerminalIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-400 bg-slate-800/50' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Temperature" value={device.temperature.toFixed(1)} unit="°C" icon={Thermometer} color="text-amber-500" />
              <MetricCard label="CPU Load" value={device.cpuLoad.toFixed(0)} unit="%" icon={Cpu} color="text-blue-500" />
              <MetricCard label="Uptime" value={(device.uptimeSeconds / 3600).toFixed(1)} unit="Hrs" icon={Activity} color="text-green-500" />
              <MetricCard label="Firmware" value={device.firmware} unit="" icon={ShieldCheck} color="text-purple-500" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-6">Performance History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateHistory(30, device.temperature, 2)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SNMP Browser Tab */}
        {activeTab === 'snmp' && <SNMPBrowser device={device} />}

        {/* AI Diagnostics Tab */}
        {activeTab === 'ai' && (
          <div className="h-[calc(100vh-280px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Device Context Panel */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col gap-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-500"/>
                Telemetry Context
              </h3>
              <div className="bg-slate-900/50 p-4 rounded text-sm text-slate-300 font-mono space-y-2">
                <p>STATUS: <span className={device.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}>{device.status}</span></p>
                <p>LAST ERROR: {device.logs.find(l => l.level === 'ERROR')?.message || 'None'}</p>
                <p>CPU LOAD: {device.cpuLoad.toFixed(1)}%</p>
                <p>TEMP: {device.temperature.toFixed(1)}°C</p>
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <p className="text-slate-500 text-xs mb-1">RECOMMENDED ACTIONS:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Check physical connectivity</li>
                    <li>Verify VLAN {device.network.vlan} routing</li>
                    <li>Analyze packet loss logs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-lg flex flex-col overflow-hidden shadow-xl">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0B1120]">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                    <Bot size={48} className="mb-4" />
                    <p>Start a diagnostic session for {device.name}</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                    }`}>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm">{msg.text}</pre>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                   <div className="flex justify-start">
                     <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-5 py-3 flex items-center gap-2">
                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                       <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                     </div>
                   </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleAiSubmit(chatInput); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Nexus AI to diagnose connectivity..."
                    className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={isAiLoading || !chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg px-4 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Network & Logs Tabs (Simplified placeholders for demo) */}
        {activeTab === 'network' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Network Interface Statistics</h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-2xl">
                <div className="border-b border-slate-700 pb-2">
                    <span className="block text-xs text-slate-500">MAC Address</span>
                    <span className="text-slate-200 font-mono">{device.network.mac}</span>
                </div>
                <div className="border-b border-slate-700 pb-2">
                    <span className="block text-xs text-slate-500">IP Address</span>
                    <span className="text-slate-200 font-mono">{device.network.ip}</span>
                </div>
                <div className="border-b border-slate-700 pb-2">
                    <span className="block text-xs text-slate-500">Subnet Mask</span>
                    <span className="text-slate-200 font-mono">{device.network.subnet}</span>
                </div>
                <div className="border-b border-slate-700 pb-2">
                    <span className="block text-xs text-slate-500">Gateway</span>
                    <span className="text-slate-200 font-mono">{device.network.gateway}</span>
                </div>
                 <div className="border-b border-slate-700 pb-2">
                    <span className="block text-xs text-slate-500">VLAN ID</span>
                    <span className="text-slate-200 font-mono">{device.network.vlan}</span>
                </div>
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-900 text-xs uppercase font-medium text-slate-500">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Level</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Code</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {device.logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-700/50">
                                <td className="px-6 py-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        log.level === 'ERROR' ? 'bg-red-900 text-red-300' :
                                        log.level === 'WARN' ? 'bg-amber-900 text-amber-300' :
                                        'bg-blue-900 text-blue-300'
                                    }`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-200">{log.message}</td>
                                <td className="px-6 py-3 font-mono text-xs opacity-70">{log.code || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};