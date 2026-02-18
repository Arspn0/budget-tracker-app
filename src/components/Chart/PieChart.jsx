import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { useTheme } from '../store/useTheme';

const { width } = Dimensions.get('window');

const FALLBACK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#3ED6C4',
];

export const PieChart = ({ data = [], title }) => {
  const Colors = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
          Tidak ada data pengeluaran
        </Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  const chartData = data.map((item, index) => ({
    name: item.name || 'Lainnya',
    population: item.value || 0,
    color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    legendFontColor: Colors.textMuted,
    legendFontSize: 12,
  }));

  const chartConfig = {
    color: (opacity = 1) => `rgba(62, 214, 196, ${opacity})`,
    labelColor: () => Colors.textMuted,
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

      <RNPieChart
        data={chartData}
        width={width - 64}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        hasLegend={false}
        absolute
      />

      {/* Custom Legend */}
      <View style={{ marginTop: 12 }}>
        {chartData.map((item, index) => {
          const percentage = total > 0
            ? ((item.population / total) * 100).toFixed(1)
            : '0';

          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderTopWidth: index !== 0 ? 1 : 0,
                borderTopColor: '#2A2D35',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                  marginRight: 8,
                }} />
                <Text
                  style={{ color: Colors.text, fontSize: 13, flex: 1 }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 13 }}>
                  Rp {item.population.toLocaleString('id-ID')}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 11 }}>
                  {percentage}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};