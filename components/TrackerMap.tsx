import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Device, ICON_MAP } from '../types';

interface TrackerMapProps {
  devices: Device[];
  focusedDeviceId?: string | null;
}

const MapUpdater: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
};

const createEmojiIcon = (iconKey: string, isFocused: boolean) => {
  const emoji = ICON_MAP[iconKey] || '📍';
  const size = isFocused ? '3.5rem' : '2.5rem';
  const zIndex = isFocused ? '1000' : '1';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
      ">
        <div style="
          font-size: ${size}; 
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); 
          transform: translate(-50%, -50%); 
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: ${zIndex};
        ">${emoji}</div>
        <div style="
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 10px;
          background: black;
          opacity: 0.2;
          filter: blur(4px);
          border-radius: 50%;
          z-index: -1;
        "></div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -40]
  });
};

export const TrackerMap: React.FC<TrackerMapProps> = ({ devices, focusedDeviceId }) => {
  const [center, setCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (focusedDeviceId) {
      const target = devices.find(d => d.id === focusedDeviceId);
      if (target) {
        setCenter([target.lat, target.lng]);
      }
    } else if (devices.length > 0 && !center) {
      // Fit bounds if needed, for now just center first
       // setCenter([devices[0].lat, devices[0].lng]);
    }
  }, [focusedDeviceId, devices]);

  // Default view (Rome)
  const defaultCenter: [number, number] = [41.9028, 12.4964];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      style={{ height: '100%', width: '100%', outline: 'none' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {center && <MapUpdater center={center} />}

      {devices.map(device => {
        const isFocused = device.id === focusedDeviceId;
        return (
          <Marker
            key={device.id}
            position={[device.lat, device.lng]}
            icon={createEmojiIcon(device.icon, isFocused)}
            zIndexOffset={isFocused ? 1000 : 0}
          >
            <Popup className="rounded-xl shadow-2xl border-none" closeButton={false}>
              <div className="p-2 text-center min-w-[140px]">
                <div className="text-3xl mb-1">{ICON_MAP[device.icon]}</div>
                <h3 className="font-bold text-lg text-slate-800 leading-tight">
                  {device.device_name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 mb-2">{device.device_identifier}</p>
                <div className="bg-indigo-50 rounded-lg p-2 text-indigo-900 text-xs font-medium">
                  {new Date(device.last_update).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};