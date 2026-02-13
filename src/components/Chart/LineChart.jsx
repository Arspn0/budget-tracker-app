import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export const LineChart = ({ data = [], title, color = Colors.primary }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
          Tidak ada data
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(d => d.x),
    datasets: [
      {
        data: data.map(d => d.y || 0),
        color: (opacity = 1) => color,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => color,
    labelColor: () => Colors.textMuted,
    propsForLabels: { fontSize: 10 },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      stroke: '#2A2D35',
      strokeDasharray: '4',
    },
  };

  const formatYLabel = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num}`;
  };

  return (
    <View>
      {title && (
        <Text style={{
          color: Colors.text,
          fontWeight: '600',
          fontSize: 16,
          marginBottom: 12,
        }}>
          {title}
        </Text>
      )}

      <RNLineChart
        data={chartData}
        width={width - 64}
        height={180}
        chartConfig={chartConfig}
        bezier
        fromZero
        withInnerLines
        withShadow={false}
        style={{ borderRadius: 12 }}
        formatYLabel={formatYLabel}
      />
    </View>
  );
};