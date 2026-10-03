export interface EmergencyItem {
  id: string;
  name: string;
  phone: string;
  icon: string;
  color: string;
  description: string;
}

export const EMERGENCY_NUMBERS: EmergencyItem[] = [
  {
    id: 'acil',
    name: 'Acil Yardım',
    phone: '112',
    icon: 'ambulance',
    color: '#EF4444',
    description: 'Ambulans, İtfaiye, Polis',
  },
  {
    id: 'yangin',
    name: 'İtfaiye',
    phone: '110',
    icon: 'fire-truck',
    color: '#F97316',
    description: 'Yangın ihbarı',
  },
  {
    id: 'polis',
    name: 'Polis İmdat',
    phone: '155',
    icon: 'shield-account',
    color: '#3B82F6',
    description: 'Asayiş, güvenlik',
  },
  {
    id: 'jandarma',
    name: 'Jandarma',
    phone: '156',
    icon: 'shield-star',
    color: '#16A34A',
    description: 'Kırsal güvenlik',
  },
  {
    id: 'saglik',
    name: 'ALO Sağlık',
    phone: '182',
    icon: 'hospital-box',
    color: '#10B981',
    description: 'Sağlık danışma hattı',
  },
  {
    id: 'eczane',
    name: 'Nöbetçi Eczane',
    phone: '11818',
    icon: 'pill',
    color: '#8B5CF6',
    description: 'Nöbetçi eczane bilgi',
  },
  {
    id: 'dogalgaz',
    name: 'Doğalgaz Arıza',
    phone: '187',
    icon: 'fire',
    color: '#FBBF24',
    description: 'Gaz kaçağı ihbarı',
  },
  {
    id: 'elektrik',
    name: 'Elektrik Arıza',
    phone: '186',
    icon: 'flash',
    color: '#F59E0B',
    description: 'Elektrik arıza bildirimi',
  },
  {
    id: 'su',
    name: 'Su Arıza',
    phone: '185',
    icon: 'water',
    color: '#0EA5E9',
    description: 'Su kesintisi / arıza',
  },
];
