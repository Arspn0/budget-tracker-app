import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text } from 'react-native';
import { Colors } from '../../theme/colors';

export const TextInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  keyboardType = 'default',
  multiline = false,
  style,
  error,
  icon,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={style}>
      {label && (
        <Text className="text-text text-sm font-medium mb-2">
          {label}
        </Text>
      )}
      
      <View className={`
        bg-card 
        rounded-xl 
        border-2 
        ${isFocused ? 'border-primary' : 'border-transparent'}
        ${error ? 'border-danger' : ''}
        flex-row
        items-center
        px-4
      `}>
        {icon && <View className="mr-3">{icon}</View>}
        
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-text py-3 text-base"
          style={{ minHeight: multiline ? 80 : 48 }}
          {...props}
        />
      </View>
      
      {error && (
        <Text className="text-danger text-xs mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};