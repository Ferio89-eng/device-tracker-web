import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { DevicePanel } from './DevicePanel';
import { TrackerMap } from './TrackerMap';
import { Device } from '../types';
import { Menu, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeDevices, setActiveDevices] = useState<Device[]>([]);
  const [myDevice, setMyDevice] = useState<Partial<Device>>({
    device_name: '',
    device_identifier: '',
    icon: 'person'
  });
  const [isTracking, setIsTracking] = useState(false);
  const [focusedDeviceId, setFocusedDeviceId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  
  const watchIdRef = useRef<number | null>(null);

  // Initialize
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadMyDevice(user.id);
      }
    };
    getUser();
    loadActiveDevices();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('devices_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, () => {
        loadActiveDevices();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyDevice = async (userId: string) => {
    const { data } = await supabase
      .from('devices')
      .select('id, user_id, device_name, device_identifier, icon, lat, lng, accuracy, is_active, last_update')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (data) {
      setMyDevice(data);
    }
  };

  const loadActiveDevices = async () => {
    const { data } = await supabase
      .from('devices')
      .select('id, user_id, device_name, device_identifier, icon, lat, lng, accuracy, is_active, last_update')
      .eq('is_active', true)
      .order('last_update', { ascending: false }); 
    
    if (data) {
      setActiveDevices(data as Device[]);
    }
  };

  const saveDeviceConfig = async () => {
    if (!user || !myDevice.device_name || !myDevice.device_identifier) {
      alert("Please fill in Device Name and Identifier");
      return;
    }

    if (!myDevice.lat) {
       navigator.geolocation.getCurrentPosition(async (pos) => {
          await upsertDevice(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
       }, (err) => {
          alert("Location required to save device. Please allow geolocation.");
       });
    } else {
        await upsertDevice(myDevice.lat, myDevice.lng, myDevice.accuracy || 10);
    }
  };

  const upsertDevice = async (lat: number, lng: number, accuracy: number) => {
    if (!user) return;

    const deviceData = {
        user_id: user.id,
        device_name: myDevice.device_name,
        device_identifier: myDevice.device_identifier,
        icon: myDevice.icon,
        lat,
        lng,
        accuracy,
        is_active: true,
        last_update: new Date().toISOString()
    };

    let result;
    if (myDevice.id) {
        result = await supabase.from('devices').update(deviceData).eq('id', myDevice.id).select().single();
    } else {
        result = await supabase.from('devices').insert(deviceData).select().single();
    }

    if (result.error) {
        console.error(result.error);
        alert("Error saving device");
    } else if (result.data) {
        setMyDevice(result.data);
    }
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) return;
    
    if (!myDevice.id) {
        alert("Please save your device configuration first.");
        return;
    }

    setIsTracking(true);
    navigator.geolocation.getCurrentPosition(updateLocation);
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const updateLocation = async (position: GeolocationPosition) => {
    if (!myDevice.id) return;

    const { latitude, longitude, accuracy } = position.coords;
    setMyDevice(prev => ({ ...prev, lat: latitude, lng: longitude, accuracy }));

    await supabase.from('devices').update({
        lat: latitude,
        lng: longitude,
        accuracy,
        last_update: new Date().toISOString(),
        is_active: true
    }).eq('id', myDevice.id);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.reload();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      
      {/* 1. MAP LAYER (Background) */}
      <div className="absolute inset-0 z-0">
        <TrackerMap devices={activeDevices} focusedDeviceId={focusedDeviceId} />
      </div>

      {/* 2. UI LAYER (Floating) */}
      
      {/* Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-30 p-3 bg-white/90 backdrop-blur-md text-slate-700 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 border border-slate-200"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Floating Sidebar Panel */}
      <div className={`
        absolute top-4 bottom-4 left-4 z-20
        w-full max-w-sm
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0'}
        flex flex-col
        pointer-events-none /* Allows clicking through empty space if needed, but child needs pointer-events-auto */
      `}>
         {/* Container for the panel content */}
         <div className="h-full w-full pointer-events-auto">
            <DevicePanel 
                userEmail={user?.email || ''}
                myDevice={myDevice}
                setMyDevice={setMyDevice}
                isTracking={isTracking}
                onToggleTracking={toggleTracking}
                onSaveDevice={saveDeviceConfig}
                onLogout={handleLogout}
                activeDevices={activeDevices}
                onFocusDevice={(id) => {
                    setFocusedDeviceId(id);
                    // On mobile, maybe auto-close? keeping open for now as it's a map app
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
            />
         </div>
      </div>
      
    </div>
  );
};