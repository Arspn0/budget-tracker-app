import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Card } from '../../components/Card/Card';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useSavingStore } from '../../store/useSavingStore';
import { formatCurrency, getDateRange } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { 
    transactions, 
    summary, 
    fetchTransactions, 
    fetchSummary,
    loading 
  } = useTransactionStore();
  
  const { 
    totalBalance, 
    fetchWallets 
  } = useWalletStore();
  
  const { 
    savings, 
    fetchSavings 
  } = useSavingStore();

  // Fetch data on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const { startDate, endDate } = getDateRange('month');
      
      await Promise.all([
        fetchWallets(),
        fetchTransactions(),
        fetchSummary(startDate, endDate),
        fetchSavings(),
      ]);
      
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get today's transactions
  const todayTransactions = transactions.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.date === today;
  });

  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-textMuted mt-4">Memuat data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        {/* Header */}
        <View className="py-6">
          <Text className="text-textMuted text-sm">Total Saldo</Text>
          <Text className="text-text text-4xl font-bold mt-1">
            {formatCurrency(totalBalance)}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row mb-6">
          <Card className="flex-1 mr-2">
            <View className="flex-row items-center mb-2">
              <TrendingUp size={20} color={Colors.success} />
              <Text className="text-textMuted text-xs ml-2">Pemasukan</Text>
            </View>
            <Text className="text-success text-lg font-bold">
              {formatCurrency(summary.income)}
            </Text>
          </Card>

          <Card className="flex-1 ml-2">
            <View className="flex-row items-center mb-2">
              <TrendingDown size={20} color={Colors.danger} />
              <Text className="text-textMuted text-xs ml-2">Pengeluaran</Text>
            </View>
            <Text className="text-danger text-lg font-bold">
              {formatCurrency(summary.expense)}
            </Text>
          </Card>
        </View>

        {/* Quick Action - Tambah Transaksi */}
        <TouchableOpacity 
          className="mb-6"
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Card className="bg-primary">
            <View className="flex-row items-center justify-center py-2">
              <Plus size={24} color={Colors.text} />
              <Text className="text-text text-lg font-bold ml-2">
                Tambah Transaksi
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Today's Expense */}
        <Card className="mb-4">
          <Text className="text-text font-semibold mb-2">
            Pengeluaran Hari Ini
          </Text>
          <Text className="text-danger text-2xl font-bold">
            {formatCurrency(todayExpense)}
          </Text>
          <Text className="text-textMuted text-xs mt-1">
            {todayTransactions.length} transaksi
          </Text>
        </Card>

        {/* Recent Transactions */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text font-semibold">
              Transaksi Terbaru
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('TransactionTab')}
            >
              <Text className="text-primary text-sm">Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View className="py-8 items-center">
              <Wallet size={48} color={Colors.textMuted} />
              <Text className="text-textMuted mt-3">
                Belum ada transaksi
              </Text>
              <Text className="text-textMuted text-xs">
                Tambahkan transaksi pertama Anda
              </Text>
            </View>
          ) : (
            <View>
              {transactions.slice(0, 5).map((transaction, index) => (
                <View 
                  key={transaction.id}
                  className={`flex-row items-center justify-between py-3 ${
                    index !== 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-text font-medium">
                      {transaction.category_name}
                    </Text>
                    <Text className="text-textMuted text-xs">
                      {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <Text className={`font-bold ${
                    transaction.type === 'income' 
                      ? 'text-success' 
                      : 'text-danger'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Savings Progress */}
        {savings.length > 0 && (
          <Card className="mb-6">
            <Text className="text-text font-semibold mb-3">
              Target Tabungan
            </Text>
            {savings.slice(0, 2).map((saving) => {
              const progress = (saving.current_amount / saving.target_amount) * 100;
              return (
                <View key={saving.id} className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-text text-sm">{saving.name}</Text>
                    <Text className="text-textMuted text-xs">
                      {progress.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-background rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                  <Text className="text-textMuted text-xs mt-1">
                    {formatCurrency(saving.current_amount)} / {formatCurrency(saving.target_amount)}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;