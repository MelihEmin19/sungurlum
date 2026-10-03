import React from 'react';
import * as icons from 'lucide-react-native';
import { IconDefaults, IconName, Colors } from '@/theme';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ 
  name, 
  size = IconDefaults.size, 
  color = IconDefaults.color,
  strokeWidth = IconDefaults.strokeWidth
}: IconProps) {
  
  // Format the name if it is given in camelCase instead of PascalCase
  // Lucide icons are exported as PascalCase (e.g. Home, UserCircle)
  const PascalName = name.charAt(0).toUpperCase() + name.slice(1);
  const LucideIcon = (icons as any)[PascalName];

  if (!LucideIcon) {
    console.warn(`Icon ${name} not found in Lucide`);
    return null;
  }

  // Map theme color names to hex codes if necessary
  const resolvedColor = (Colors as any)[color] || color;

  return (
    <LucideIcon 
      color={resolvedColor} 
      size={size} 
      strokeWidth={strokeWidth} 
    />
  );
}
