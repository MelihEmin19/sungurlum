import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', elevation = 'sm', ...props }: CardProps) {
  const elevationClasses = {
    none: 'border border-border/50',
    sm: 'shadow-sm shadow-black/5 border border-border/30',
    md: 'shadow-md shadow-black/10 border border-border/20',
    lg: 'shadow-lg shadow-black/10 border border-border/10',
  };

  return (
    <View 
      className={`bg-surface rounded-2xl p-4 ${elevationClasses[elevation]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
