import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export const OutlineButton = ({ 
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

  const color = variantColors[variant] || Colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: color,
          borderRadius: 12,
          paddingVertical: 12,
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
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text
          style={[
            {
              color: color,
              fontSize: 16,
              fontWeight: '600',
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