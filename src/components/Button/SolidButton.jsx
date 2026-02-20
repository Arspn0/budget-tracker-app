import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export const SolidButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle 
}) => {
  const Colors = useThemeStore();

  const variants = {
    primary: 'bg-primary',
    danger: 'bg-danger',
    success: 'bg-success',
  };

  const sizes = {
    small: 'py-2 px-4',
    medium: 'py-3 px-6',
    large: 'py-4 px-8',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-2xl 
        items-center 
        justify-center
        ${disabled ? 'opacity-50' : ''}
      `}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text 
          className="text-text font-semibold text-base"
          style={textStyle}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};