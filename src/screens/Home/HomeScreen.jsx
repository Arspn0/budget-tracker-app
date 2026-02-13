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
import { Plus, TrendingUp, TrendingDown, Wallet, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Card } from '../../components/Card/Card';
import { PieChart, BarChart, ProgressBar } from '../../components/Chart';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useSavingStore } from '../../store/useSavingStore';
import { formatCurrency, getDateRange } from '../../utils/helpers';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const { 
    transactions, 
    summary, 
    fetchTransactions, 
    fetchSummary,
    fetchByCategory,
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

      // Load category breakdown
      const categories = await fetchByCategory(startDate, endDate, 'expense');
      setCategoryData(categories.map(cat => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
      })));

      // Generate weekly data (last 7 days)
      generateWeeklyData();
      
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsInitialLoading(false);
    }
  };

  const generateWeeklyData = () => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      weekData.push({
        label: days[date.getDay()],
        income,
        expense,
      });
    }

    setWeeklyData(weekData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

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
              <Text className="text-textMuted text-xs ml-2">Bulan Ini</Text>
            </View>
            <Text className="text-success text-lg font-bold">
              {formatCurrency(summary.income)}
            </Text>
            <Text className="text-textMuted text-xs mt-1">Pemasukan</Text>
          </Card>

          <Card className="flex-1 ml-2">
            <View className="flex-row items-center mb-2">
              <TrendingDown size={20} color={Colors.danger} />
              <Text className="text-textMuted text-xs ml-2">Bulan Ini</Text>
            </View>
            <Text className="text-danger text-lg font-bold">
              {formatCurrency(summary.expense)}
            </Text>
            <Text className="text-textMuted text-xs mt-1">Pengeluaran</Text>
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
        <Card className="mb-6">
          <Text className="text-text font-semibold mb-2">
            Pengeluaran Hari Ini
          </Text>
          <Text className="text-danger text-2xl font-bold">
            {formatCurrency(todayExpense)}
          </Text>
          <Text className="text-textMuted text-xs mt-1">
            {todayTransactions.filter(t => t.type === 'expense').length} transaksi
          </Text>
        </Card>

        {/* Weekly Chart */}
        {weeklyData.length > 0 && (
          <Card className="mb-6">
            <BarChart 
              data={weeklyData}
              title="Pemasukan vs Pengeluaran (7 Hari Terakhir)"
            />
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card className="mb-6">
            <PieChart 
              data={categoryData}
              title="Pengeluaran per Kategori (Bulan Ini)"
            />
          </Card>
        )}

        {/* Savings Progress */}
        {savings.length > 0 && (
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text font-semibold">
                Target Tabungan
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('SavingTab')}
                className="flex-row items-center"
              >
                <Text className="text-primary text-sm mr-1">Lihat Semua</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {savings.slice(0, 3).map((saving) => (
              <View key={saving.id} className="mb-4">
                <ProgressBar
                  current={saving.current_amount}
                  target={saving.target_amount}
                  label={saving.name}
                  showPercentage={true}
                  showAmount={true}
                />
              </View>
            ))}
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text font-semibold">
              Transaksi Terbaru
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('TransactionTab')}
              className="flex-row items-center"
            >
              <Text className="text-primary text-sm mr-1">Lihat Semua</Text>
              <ChevronRight size={16} color={Colors.primary} />
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
                <TouchableOpacity
                  key={transaction.id}
                  onPress={() => navigation.navigate('TransactionDetail', {
                    transactionId: transaction.id
                  })}
                  className={`flex-row items-center justify-between py-3 ${
                    index !== 0 ? 'border-t border-border' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-text font-medium">
                      {transaction.category_name}
                    </Text>
                    <Text className="text-textMuted text-xs">
                      {new Date(transaction.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
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
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;