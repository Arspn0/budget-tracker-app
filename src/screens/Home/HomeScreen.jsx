import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, Wallet, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card/Card';
import { PieChart, BarChart, ProgressBar } from '../../components/Chart';
import { useTheme } from '../../theme/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useSavingStore } from '../../store/useSavingStore';
import { TransactionRepository } from '../../data/repositories/TransactionRepository';
import { formatCurrency, getDateRange } from '../../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const Colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ─── FIX BUG 5 & 6: store chart data separately so it's only set
  //     AFTER all async calls finish ────────────────────────────────
  const [categoryData, setCategoryData]  = useState([]);
  const [weeklyData, setWeeklyData]       = useState([]);

  const { transactions, summary, fetchTransactions, fetchSummary } = useTransactionStore();
  const { totalBalance, wallets, fetchWallets } = useWalletStore();
  const { savings, fetchSavings } = useSavingStore();

  // useFocusEffect runs every time the screen comes into focus (e.g. after
  // returning from AddTransaction), ensuring data is always fresh.
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const { startDate, endDate } = getDateRange('month');

      // ─── FIX BUG 5: Await ALL fetches before deriving chart data ───
      await Promise.all([
        fetchWallets(),
        fetchTransactions(),
        fetchSummary(startDate, endDate),
        fetchSavings(),
      ]);

      // Weekly bar-chart — uses its own DB query so it's always accurate
      const weekly = await TransactionRepository.getWeeklyData();
      setWeeklyData(weekly);

      // ─── FIX BUG 6: getByCategory groups by c.id so same category
      //     on different days is ONE slice in the pie chart ───────────
      const catRows = await TransactionRepository.getByCategory(
        startDate, endDate, 'expense'
      );
      setCategoryData(
        catRows.map(row => ({
          name:  row.name,
          value: row.total,
          color: row.color || '#9FA5B4',
        }))
      );

      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading home data:', error);
      setIsInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Today's transactions from already-loaded list
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = transactions
    .filter(t => t.date === todayStr && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayCount = transactions.filter(
    t => t.date === todayStr && t.type === 'expense'
  ).length;

  if (isInitialLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textMuted, marginTop: 12 }}>Memuat data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header / Total Balance ── */}
        <View style={{ paddingTop: 28, paddingBottom: 20 }}>
          <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Total Saldo</Text>
          <Text style={{ color: Colors.text, fontSize: 36, fontWeight: '800', marginTop: 4 }}>
            {formatCurrency(totalBalance)}
          </Text>

          {/* Wallet chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {wallets.map(w => (
              <View
                key={w.id}
                style={{
                  backgroundColor: Colors.card,
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginRight: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 13 }}>
                  {w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '📱'}
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 12 }}>{w.name}</Text>
                <Text style={{ color: Colors.text, fontSize: 12, fontWeight: '700' }}>
                  {formatCurrency(w.balance)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Monthly Summary Cards ── */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <TrendingUp size={16} color={Colors.success} />
              <Text style={{ color: Colors.textMuted, fontSize: 11, marginLeft: 6 }}>
                Pemasukan
              </Text>
            </View>
            <Text style={{ color: Colors.success, fontSize: 16, fontWeight: '700' }}>
              {formatCurrency(summary.income)}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 10, marginTop: 2 }}>Bulan ini</Text>
          </Card>

          <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <TrendingDown size={16} color={Colors.danger} />
              <Text style={{ color: Colors.textMuted, fontSize: 11, marginLeft: 6 }}>
                Pengeluaran
              </Text>
            </View>
            <Text style={{ color: Colors.danger, fontSize: 16, fontWeight: '700' }}>
              {formatCurrency(summary.expense)}
            </Text>
            <Text style={{ color: Colors.textMuted, fontSize: 10, marginTop: 2 }}>Bulan ini</Text>
          </Card>
        </View>

        {/* ── FAB – Tambah Transaksi ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          style={{ marginBottom: 20 }}
        >
          <Card style={{ backgroundColor: Colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
              <Plus size={22} color={Colors.text} />
              <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                Tambah Transaksi
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* ── Pengeluaran Hari Ini ── */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Pengeluaran Hari Ini</Text>
          <Text style={{ color: Colors.danger, fontSize: 26, fontWeight: '800', marginTop: 4 }}>
            {formatCurrency(todayExpense)}
          </Text>
          <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {todayCount} transaksi
          </Text>
        </Card>

        {/* ── FIX BUG 5: Weekly Bar Chart ── */}
        {weeklyData.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <BarChart
              data={weeklyData}
              title="7 Hari Terakhir"
            />
          </Card>
        )}

        {/* ── FIX BUG 6: Category Pie Chart ── */}
        {categoryData.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <PieChart
              data={categoryData}
              title="Pengeluaran per Kategori"
            />
          </Card>
        )}

        {/* ── Savings Progress ── */}
        {savings.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
                Target Tabungan
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SavingTab')}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ color: Colors.primary, fontSize: 13 }}>Lihat Semua</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {savings.slice(0, 3).map(saving => (
              <View key={saving.id} style={{ marginBottom: 14 }}>
                <ProgressBar
                  current={saving.current_amount}
                  target={saving.target_amount}
                  label={saving.name}
                  color={saving.color || Colors.primary}
                  height={8}
                />
              </View>
            ))}
          </Card>
        )}

        {/* ── Recent Transactions ── */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>
              Transaksi Terbaru
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionTab')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ color: Colors.primary, fontSize: 13 }}>Lihat Semua</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Wallet size={44} color={Colors.textMuted} />
              <Text style={{ color: Colors.textMuted, marginTop: 12 }}>
                Belum ada transaksi
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((tx, idx) => (
              <TouchableOpacity
                key={tx.id}
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderTopWidth: idx !== 0 ? 1 : 0,
                  borderTopColor: '#2A2D35',
                }}
              >
                {/* Category color dot */}
                <View style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: (tx.category_color || Colors.primary) + '25',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: tx.category_color || Colors.primary,
                  }} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontWeight: '600', fontSize: 14 }}>
                    {tx.category_name || 'Tidak ada kategori'}
                  </Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 1 }}>
                    {tx.wallet_name} ·{' '}
                    {new Date(tx.date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short',
                    })}
                  </Text>
                </View>

                <Text style={{
                  fontWeight: '700',
                  fontSize: 15,
                  color: tx.type === 'income' ? Colors.success : Colors.danger,
                }}>
                  {tx.type === 'income' ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;