import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../theme/colors';

export const ProgressBar = ({
  current = 0,
  target = 0,
  label,
  showPercentage = true,
  showAmount = true,
  color = Colors.primary,
  height = 8,
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const getStatusColor = () => {
    if (percentage >= 100) return Colors.success;
    if (percentage >= 80) return '#FFA726';
    return color;
  };

  const statusColor = getStatusColor();

  return (
    <View>
      {/* Label Row */}
      {(label || showPercentage) && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          {label && (
            <Text style={{
              color: Colors.text,
              fontSize: 13,
              fontWeight: '500',
              flex: 1,
              marginRight: 8,
            }}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
              {percentage.toFixed(0)}%
            </Text>
          )}
        </View>
      )}

      {/* Bar Track */}
      <View style={{
        height,
        backgroundColor: '#2A2D35',
        borderRadius: height / 2,
        overflow: 'hidden',
      }}>
        <View style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: statusColor,
          borderRadius: height / 2,
        }} />
      </View>

      {/* Amount Row */}
      {showAmount && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 4,
        }}>
          <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
            Rp {current.toLocaleString('id-ID')}
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
            Rp {target.toLocaleString('id-ID')}
          </Text>
        </View>
      )}
    </View>
  );
};