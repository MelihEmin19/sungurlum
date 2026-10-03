import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Icon } from '@/components/ui/Icon';

interface SearchBarProps extends TextInputProps {
  onFilterPress?: () => void;
}

export default function SearchBar({ onFilterPress, ...props }: SearchBarProps) {
  return (
    <View className="px-6">
      <View className="flex-row items-center bg-surface h-12 rounded-2xl px-4 shadow-sm shadow-black/5 border border-border/20">
        <Icon name="search" size={20} color="muted" />
        
        <TextInput
          className="flex-1 ml-3 text-base text-textPrimary h-full font-medium"
          placeholderTextColor="#94A3B8"
          {...props}
        />
        
        {onFilterPress && (
          <View className="ml-2 pl-3 border-l border-border/50">
            <Icon name="slidersHorizontal" size={20} color="primary" />
          </View>
        )}
      </View>
    </View>
  );
}
