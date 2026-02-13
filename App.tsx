import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Monitor, Network, Settings, Menu, Shield, Bell, Plus, Database, RefreshCw, Trash2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { DeviceList } from './components/DeviceList';
import { DeviceDetail } from './components/DeviceDetail';
import { Topology } from './components/Topology';
import { AddDeviceModal } from './components/AddDeviceModal';
import { DeviceService } from './services/deviceService';
import { AVDevice } from './types';

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
      active 
        ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
        : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'devices' | 'topology' | 'settings'>('dashboard');
  const [selectedDevice, setSelectedDevice] = useState<AVDevice | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [devices, setDevices] = useState<AVDevice[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load devices on mount
  useEffect(() => {
    const loadedDevices = DeviceService.getDevices();
    setDevices(loadedDevices);

    // Simulate real-time polling updates
    const interval = setInterval(() => {
      setDevices(current => {
        const updated = DeviceService.simulateRealTimeUpdates(current);
        // If specific device is selected, update it too
        if (selectedDevice) {
            const currentSelected = updated.find(d => d.id === selectedDevice.id);
            if(currentSelected) setSelectedDevice(currentSelected);
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDevice]);

  const handleDeviceSelect = (device: AVDevice) => {
    setSelectedDevice(device);
  };

  const handleBackToDevices = () => {
    setSelectedDevice(null);
    setCurrentView('devices'); 
  };

  const handleAddDevice = (newDevice: AVDevice) => {
    const updatedList = DeviceService.addDevice(newDevice);
    setDevices(updatedList);
  };

  const handleResetData = () => {
    if(confirm("Reset all data to demo defaults?")) {
        setDevices(DeviceService.resetToDemo());
        setSelectedDevice(null);
    }
  };

  const handleClearData = () => {
    if(confirm("Clear ALL devices? You will need to add devices manually.")) {
        setDevices(DeviceService.clearAll());
        setSelectedDevice(null);
    }
  };

  // Render logic
  const renderContent = () => {
    if (selectedDevice) {
      return <DeviceDetail device={selectedDevice} onBack={handleBackToDevices} />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard devices={devices} />;
      case 'devices': return <DeviceList devices={devices} onSelectDevice={handleDeviceSelect} />;
      case 'topology': return <Topology devices={devices} />;
      case 'settings': return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">System Data Management</h2>
                <p className="text-slate-400 mb-6">
                    In a production environment, this application connects to a backend API (Node.js/Python) 
                    which communicates with devices via SNMP, SSH, or vendor APIs. 
                    <br/><br/>
                    For this browser-based environment, we are using <strong>LocalStorage</strong> to simulate a database.
                    You can clear the demo data below and add your own specific processors to test the UI.
                </p>
                <div className="flex gap-4">
                    <button onClick={handleResetData} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded">
                        <RefreshCw size={18} /> Reset to Demo Data
                    </button>
                    <button onClick={handleClearData} className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 rounded">
                        <Trash2 size={18} /> Clear All Data
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                 <h2 className="text-xl font-bold text-white mb-4">Connection Settings</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Polling Interval (Seconds)</label>
                         <input type="number" defaultValue={30} className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded" />
                     </div>
                     <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">SNMP Community String</label>
                         <input type="password" defaultValue="public" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded" />
                     </div>
                 </div>
            </div>
        </div>
      );
      default: return <Dashboard devices={devices} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Shield size={18} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight text-white">NEXUS<span className="text-blue-500">AV</span></span>}
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label={sidebarOpen ? "Dashboard" : ""} 
            active={currentView === 'dashboard' && !selectedDevice} 
            onClick={() => { setCurrentView('dashboard'); setSelectedDevice(null); }} 
          />
          <NavItem 
            icon={Monitor} 
            label={sidebarOpen ? "Devices" : ""} 
            active={(currentView === 'devices' || !!selectedDevice)} 
            onClick={() => { setCurrentView('devices'); setSelectedDevice(null); }} 
          />
          <NavItem 
            icon={Network} 
            label={sidebarOpen ? "Topology" : ""} 
            active={currentView === 'topology'} 
            onClick={() => { setCurrentView('topology'); setSelectedDevice(null); }} 
          />
          <NavItem 
            icon={Settings} 
            label={sidebarOpen ? "Settings" : ""} 
            active={currentView === 'settings'} 
            onClick={() => { setCurrentView('settings'); setSelectedDevice(null); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                AD
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-sm font-medium text-white truncate">Admin User</div>
                  <div className="text-xs text-slate-500 truncate">System Architect</div>
                </div>
              )}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        
        {/* Top Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-400 hover:bg-slate-800 rounded-md"
            >
                <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white hidden sm:block">
                {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
             >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Device</span>
             </button>

             <div className="h-6 w-px bg-slate-700 mx-1"></div>

             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-blue-300">System Healthy</span>
             </div>
             <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 relative">
          {renderContent()}
        </div>

      </main>
      
      <AddDeviceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddDevice} 
      />
    </div>
  );
};

export default App;