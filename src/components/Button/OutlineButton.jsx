import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const OutlineButton = ({ 
  title, 
  onPress, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle 
}) => {
  const variants = {
    primary: 'border-primary',
    danger: 'border-danger',
    success: 'border-success',
  };

  const textVariants = {
    primary: 'text-primary',
    danger: 'text-danger',
    success: 'text-success',
  };

  const sizes = {
    small: 'py-2 px-4',
    medium: 'py-3 px-6',
    large: 'py-4 px-8',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        rounded-2xl 
        border-2
        items-center 
        justify-center
        ${disabled ? 'opacity-50' : ''}
      `}
      style={style}
    >
      <Text 
        className={`${textVariants[variant]} font-semibold text-base`}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};