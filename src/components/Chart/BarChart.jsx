import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export const BarChart = ({ data = [], title }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>
          Tidak ada data
        </Text>
      </View>
    );
  }

  // react-native-chart-kit BarChart hanya support 1 dataset,
  // jadi kita tampilkan expense saja, income di bawahnya terpisah
  const expenseData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.expense || 0),
      },
    ],
  };

  const incomeData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.income || 0),
      },
    ],
  };

  const chartWidth = width - 64;
  const chartHeight = 160;

  const baseChartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    decimalPlaces: 0,
    labelColor: () => Colors.textMuted,
    propsForLabels: { fontSize: 10 },
    propsForBackgroundLines: {
      stroke: '#2A2D35',
      strokeDasharray: '4',
    },
    barPercentage: 0.6,
  };

  const expenseChartConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`,
  };

  const incomeChartConfig = {
    ...baseChartConfig,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
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

      {/* Income Chart */}
      <View style={{ marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: Colors.success,
            marginRight: 6,
          }} />
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Pemasukan</Text>
        </View>
        <RNBarChart
          data={incomeData}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={incomeChartConfig}
          fromZero
          withInnerLines
          showBarTops={false}
          flatColor
          style={{ borderRadius: 12 }}
          formatYLabel={formatYLabel}
        />
      </View>

      {/* Expense Chart */}
      <View style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: Colors.danger,
            marginRight: 6,
          }} />
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Pengeluaran</Text>
        </View>
        <RNBarChart
          data={expenseData}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={expenseChartConfig}
          fromZero
          withInnerLines
          showBarTops={false}
          flatColor
          style={{ borderRadius: 12 }}
          formatYLabel={formatYLabel}
        />
      </View>
    </View>
  );
};