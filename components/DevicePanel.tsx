import React from 'react';
import { Device, ICONS, ICON_MAP } from '../types';
import { Settings, Save, Navigation, Activity, Smartphone, LogOut, Radio } from 'lucide-react';

interface DevicePanelProps {
  userEmail: string;
  myDevice: Partial<Device>;
  setMyDevice: React.Dispatch<React.SetStateAction<Partial<Device>>>;
  isTracking: boolean;
  onToggleTracking: () => void;
  onSaveDevice: () => void;
  onLogout: () => void;
  activeDevices: Device[];
  onFocusDevice: (id: string) => void;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({
  userEmail,
  myDevice,
  setMyDevice,
  isTracking,
  onToggleTracking,
  onSaveDevice,
  onLogout,
  activeDevices,
  onFocusDevice
}) => {
  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shrink-0">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
            <Navigation size={20} className="text-indigo-200" /> 
            Device Tracker
            </h1>
            <button 
                onClick={onLogout} 
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                title="Logout"
            >
                <LogOut size={16} />
            </button>
        </div>
        <p className="text-xs text-indigo-200 mt-1 truncate font-medium ml-7">{userEmail}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* My Device Config */}
        <section className="bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3 flex items-center gap-2">
            <Settings size={14} /> My Beacon
          </h2>
          
          <div className="space-y-3">
            <input 
              type="text" 
              value={myDevice.device_name || ''}
              onChange={e => setMyDevice({...myDevice, device_name: e.target.value})}
              placeholder="Device Name"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
            />
            
            <input 
              type="text" 
              value={myDevice.device_identifier || ''}
              onChange={e => setMyDevice({...myDevice, device_identifier: e.target.value})}
              placeholder="Unique ID"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all font-mono"
            />

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 ml-1">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.slice(0, 12).map(icon => (
                  <button
                    key={icon.value}
                    onClick={() => setMyDevice({...myDevice, icon: icon.value})}
                    className={`h-9 w-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                      myDevice.icon === icon.value 
                        ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' 
                        : 'bg-white border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ICON_MAP[icon.value]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={onSaveDevice}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all shadow-lg shadow-slate-200 text-xs font-bold uppercase tracking-wide"
                >
                    <Save size={14} /> Save
                </button>
                
                <button
                    onClick={onToggleTracking}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white transition-all shadow-lg text-xs font-bold uppercase tracking-wide ${
                        isTracking 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse' 
                        : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                    }`}
                >
                    <Activity size={14} /> {isTracking ? 'Stop' : 'Track'}
                </button>
            </div>
          </div>
        </section>

        {/* Device List */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
             <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Radio size={14} /> Live Signal
             </h2>
             <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeDevices.length} Online
             </span>
          </div>

          <div className="space-y-2">
            {activeDevices.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                    <Smartphone className="mx-auto h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No signals detected</p>
                </div>
            ) : (
                activeDevices.map(device => (
                    <div 
                        key={device.id}
                        onClick={() => onFocusDevice(device.id)}
                        className="bg-white/60 p-3 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all cursor-pointer group flex items-center gap-3"
                    >
                        <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                             {ICON_MAP[device.icon] || '📍'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm truncate">{device.device_name}</h3>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{device.device_identifier}</p>
                        </div>

                        <div className="text-right">
                             <div className="flex flex-col items-end">
                                <span className="relative flex h-2 w-2 mb-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                    {new Date(device.last_update).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                             </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};