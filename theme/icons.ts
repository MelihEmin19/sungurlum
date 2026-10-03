import { LucideIcon } from 'lucide-react-native';

export type IconName = string;
export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

// We will use standard Lucide icons directly. 
// This file acts as a type definition standard for our new system.
export const IconDefaults = {
  size: 24,
  color: '#111827', // textPrimary
  strokeWidth: 2,
};
