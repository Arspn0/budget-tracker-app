import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { Eye, EyeOff } from 'lucide-react-native';

export const TextInput = ({ 
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconPress,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  inputStyle,
  containerStyle,
  editable = true,
  maxLength,
  ...props
}) => {
  const Colors = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const actualSecure = isPassword && !showPassword;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          style={{
            color: Colors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          {
            backgroundColor: Colors.card,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            paddingHorizontal: 14,
            paddingVertical: multiline ? 12 : 0,
            borderWidth: 2,
            borderColor: error
              ? Colors.danger
              : isFocused
                ? Colors.primary
                : 'transparent',
          },
          style,
        ]}
      >
        {/* Left Icon */}
        {Icon && (
          <Icon
            size={20}
            color={isFocused ? Colors.primary : Colors.textMuted}
            style={{ marginRight: 10, marginTop: multiline ? 2 : 0 }}
          />
        )}

        {/* Text Input */}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={actualSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            {
              flex: 1,
              color: Colors.text,
              fontSize: 15,
              paddingVertical: multiline ? 0 : 14,
              minHeight: multiline ? 80 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            inputStyle,
          ]}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: 4, marginLeft: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors.textMuted} />
            ) : (
              <Eye size={20} color={Colors.textMuted} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ padding: 4, marginLeft: 8 }}
          >
            <RightIcon size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            color: Colors.danger,
            fontSize: 12,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};