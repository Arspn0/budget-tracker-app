import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export const SolidButton = ({ 
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // primary | success | danger | warning
  style,
  textStyle,
  ...props
}) => {
  const Colors = useThemeStore();

  const variantColors = {
    primary: Colors.primary,
    success: Colors.success,
    danger:  Colors.danger,
    warning: Colors.warning,
  };

  const bgColor = variantColors[variant] || Colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: (disabled || loading) ? 0.5 : 1,
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          style={[
            {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '700',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};