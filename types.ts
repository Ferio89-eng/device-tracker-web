export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_identifier: string;
  icon: string;
  lat: number;
  lng: number;
  accuracy: number;
  is_active: boolean;
  last_update: string;
}

export const ICONS = [
  { value: 'lion', label: '🦁 Lion' },
  { value: 'tiger', label: '🐯 Tiger' },
  { value: 'eagle', label: '🦅 Eagle' },
  { value: 'dolphin', label: '🐬 Dolphin' },
  { value: 'fox', label: '🦊 Fox' },
  { value: 'bear', label: '🐻 Bear' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'whale', label: '🐋 Whale' },
  { value: 'owl', label: '🦉 Owl' },
  { value: 'panda', label: '🐼 Panda' },
  { value: 'penguin', label: '🐧 Penguin' },
  { value: 'turtle', label: '🐢 Turtle' },
  { value: 'car', label: '🚗 Car' },
  { value: 'bike', label: '🚲 Bike' },
  { value: 'person', label: '👤 Person' },
];

export const ICON_MAP: Record<string, string> = {
  lion: '🦁', tiger: '🐯', eagle: '🦅', dolphin: '🐬', fox: '🦊',
  bear: '🐻', rabbit: '🐰', whale: '🐋', owl: '🦉', panda: '🐼',
  penguin: '🐧', turtle: '🐢', car: '🚗', bike: '🚲', person: '👤'
};