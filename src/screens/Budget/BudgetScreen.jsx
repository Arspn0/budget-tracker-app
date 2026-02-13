import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, AlertCircle } from 'lucide-react-native';
import { Card } from '../../components/Card/Card';
import { ProgressBar } from '../../components/Chart';
import { Colors } from '../../theme/colors';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatCurrency } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const BudgetScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { budgets, fetchBudgets } = useBudgetStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useFocusEffect(
    React.useCallback(() => {
      fetchBudgets(currentMonth, currentYear);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets(currentMonth, currentYear);
    setRefreshing(false);
  };

  const getWarningStatus = (percentage) => {
    if (percentage >= 100) return { color: Colors.danger, text: 'Melebihi limit!' };
    if (percentage >= 80) return { color: Colors.warning, text: 'Hampir limit' };
    if (percentage >= 60) return { color: Colors.primary, text: 'Aman' };
    return { color: Colors.success, text: 'Masih aman' };
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 py-6 flex-row items-center justify-between">
        <View>
          <Text className="text-text text-2xl font-bold">Budget</Text>
          <Text className="text-textMuted text-sm">
            {currentDate.toLocaleDateString('id-ID', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddBudget')}
          className="bg-primary rounded-full p-3"
        >
          <Plus size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        className="flex-1 px-5"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {budgets.length === 0 ? (
          <Card className="items-center py-8">
            <AlertCircle size={48} color={Colors.textMuted} />
            <Text className="text-textMuted mt-3">Belum ada budget</Text>
            <Text className="text-textMuted text-xs mt-1">
              Tap tombol + untuk menambah budget
            </Text>
          </Card>
        ) : (
          budgets.map((budget) => {
            const status = getWarningStatus(budget.percentage);
            
            return (
              <Card key={budget.id} className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-text font-semibold text-lg">
                      {budget.category_name}
                    </Text>
                    <Text className="text-textMuted text-xs mt-1">
                      Limit: {formatCurrency(budget.limit_amount)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className={`font-bold text-sm`} style={{ color: status.color }}>
                      {status.text}
                    </Text>
                    <Text className="text-textMuted text-xs mt-1">
                      {budget.percentage.toFixed(0)}% terpakai
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  current={budget.spent}
                  target={budget.limit_amount}
                  showPercentage={false}
                  showAmount={true}
                  color={status.color}
                  height={10}
                />

                <View className="flex-row justify-between mt-2">
                  <Text className="text-textMuted text-xs">
                    Sisa: {formatCurrency(Math.max(0, budget.limit_amount - budget.spent))}
                  </Text>
                </View>
              </Card>
            );
          })
        )}

        {/* Summary Card */}
        {budgets.length > 0 && (
          <Card className="mb-6 bg-card/50">
            <Text className="text-text font-semibold mb-3">Ringkasan</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-textMuted">Total Budget:</Text>
              <Text className="text-text font-semibold">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.limit_amount, 0))}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-textMuted">Total Terpakai:</Text>
              <Text className="text-danger font-semibold">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
              </Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-border">
              <Text className="text-text font-semibold">Sisa:</Text>
              <Text className="text-success font-semibold">
                {formatCurrency(
                  budgets.reduce((sum, b) => sum + b.limit_amount, 0) -
                  budgets.reduce((sum, b) => sum + b.spent, 0)
                )}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetScreen;