import React, { useState, useEffect, useRef } from 'react';
import { X, SquareTerminal } from 'lucide-react';
import { AVDevice } from '../types';
import { DeviceService } from '../services/deviceService';

interface TerminalProps {
  device: AVDevice;
  onClose: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ device, onClose }) => {
  const [history, setHistory] = useState<string[]>([
    `Connecting to ${device.network.ip} via SSH...`,
    ` Authenticating...`,
    `Welcome to ${device.manufacturer} Command Shell`,
    `Type 'help' for a list of commands.`
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input;
    setHistory(prev => [...prev, `${device.name}> ${cmd}`]);
    setInput('');
    setIsProcessing(true);

    const response = await DeviceService.processTerminalCommand(device, cmd);
    setHistory(prev => [...prev, response]);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-3xl h-[600px] rounded-lg shadow-2xl flex flex-col font-mono text-sm border border-slate-700 animate-fade-in overflow-hidden">
        
        {/* Terminal Header */}
        <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-black">
          <div className="flex items-center gap-2 text-slate-300">
            <SquareTerminal size={16} />
            <span>ssh admin@{device.network.ip}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Terminal Output */}
        <div 
            className="flex-1 p-4 overflow-y-auto text-slate-300 space-y-1"
            onClick={() => inputRef.current?.focus()}
        >
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">{line}</div>
          ))}
          
          <div className="flex items-center gap-2 text-white">
             <span>{device.name}&gt;</span>
             <form onSubmit={handleCommand} className="flex-1">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-transparent border-none outline-none text-white focus:ring-0 p-0"
                    autoFocus
                />
             </form>
          </div>
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};