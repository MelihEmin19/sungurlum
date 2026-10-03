import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  
  // Base classes for minimum touch area and layout
  const baseClasses = 'flex-row items-center justify-center rounded-xl min-h-[48px] px-4';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary shadow-sm shadow-primary/20',
    secondary: 'bg-primary/10',
    outline: 'border-2 border-primary bg-transparent',
    ghost: 'bg-transparent',
  };

  // Text color based on variant
  const textClasses = {
    primary: 'text-white',
    secondary: 'text-primary',
    outline: 'text-primary',
    ghost: 'text-primary',
  };

  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : Colors.primary} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          {title && (
            <Text className={`font-semibold text-base ${textClasses[variant]} ${icon ? 'ml-2' : ''}`}>
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
