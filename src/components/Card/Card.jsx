import React from 'react';
import { View } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export const Card = ({ children, style, className = '' }) => {
  const Colors = useThemeStore();

  return (
    <View 
      className={`bg-card rounded-2xl p-4 ${className}`}
      style={[
        {
          backgroundColor: Colors.card,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 3,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};