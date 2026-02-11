import React from 'react';
import { View } from 'react-native';

export const Card = ({ children, style, className = '' }) => {
  return (
    <View 
      className={`bg-card rounded-2xl p-4 ${className}`}
      style={[
        {
          shadowColor: '#000',
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